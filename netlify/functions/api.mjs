// Shared data API for The Community Library hub.
// Data lives in Netlify Blobs (built in, no database to set up).
// Every request must send the team password in the "x-team-key" header.
// The password is checked here on the server (not visible in the web page's code).
// To change it, edit the line below and redeploy.
const PASSWORD = "tclsupport";
import { getStore } from "@netlify/blobs";

const COLLECTIONS = ["ev", "plan", "pmeta", "vol"]; // sign-in events, calendar, month meta, volunteer logs
const validId = (s) => typeof s === "string" && /^[A-Za-z0-9_-]{1,60}$/.test(s);
const json = (o, status = 200) =>
  new Response(JSON.stringify(o), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export default async (req) => {
  if (req.headers.get("x-team-key") !== PASSWORD) return json({ error: "auth" }, 401);

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, "") || "/";
  const store = getStore({ name: "library", consistency: "strong" });

  const list = async (c) => {
    const { blobs } = await store.list({ prefix: c + "/" });
    const all = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
    return all.filter(Boolean);
  };

  try {
    if (path === "/login") return json({ ok: true });

    if (path === "/all" && req.method === "GET") {
      const [plan, pmeta, vol, ev] = await Promise.all(["plan", "pmeta", "vol", "ev"].map(list));
      return json({
        plan, pmeta, vol,
        ev: ev.map((e) => ({ id: e.id, updated: e.updated || 0, date: e.date || "" })),
      });
    }

    if (path === "/ev" && req.method === "GET") {
      const ids = (url.searchParams.get("ids") || "").split(",").filter(validId).slice(0, 40);
      const recs = await Promise.all(ids.map((id) => store.get("ev/" + id, { type: "json" })));
      return json(recs.filter(Boolean));
    }

    if (req.method === "POST" && (path === "/put" || path === "/del")) {
      const b = await req.json();
      if (!COLLECTIONS.includes(b.c)) return json({ error: "bad collection" }, 400);
      if (path === "/put") {
        if (!b.o || !validId(b.o.id)) return json({ error: "bad id" }, 400);
        await store.setJSON(b.c + "/" + b.o.id, b.o);
      } else {
        if (!validId(b.id)) return json({ error: "bad id" }, 400);
        await store.delete(b.c + "/" + b.id);
      }
      return json({ ok: true });
    }
  } catch (e) {
    return json({ error: String((e && e.message) || e) }, 500);
  }
  return json({ error: "not found" }, 404);
};

export const config = { path: "/api/*" };
