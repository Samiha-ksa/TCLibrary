# Library Hub – Netlify setup

One site with four tabs: **Sign-in**, **Calendar** (shared), **Volunteer log** (teens + adults together) and **Monthly export** (Excel).
All devices save to one shared record (Netlify Blobs – built in, nothing to set up).

## Deploy (about 10 minutes)

> Netlify's drag-and-drop box does **not** install the function's dependency, so use GitHub or the CLI.

**Option A – GitHub (easiest long-term)**
1. Create a new GitHub repo and upload everything in this folder (keep the folder structure).
2. Netlify → *Add new site → Import an existing project* → pick the repo. Leave build settings as they are (`netlify.toml` sets them).
3. That's it – no settings to add.

**Option B – CLI**
```
npm i -g netlify-cli
cd library-hub
npm install
netlify login
netlify init            # create & link a new site
netlify deploy --prod
```

## Using it
- Everyone opens the site and types the team password once per device. The password is the `PASSWORD` line at the top of `netlify/functions/api.mjs` (currently `tclsupport`).
- **Sign-in**: works as before. Each change uploads automatically; the same event can be opened on another device after a "Sync now".
- **Calendar**: anyone can add / edit / delete activities; changes appear on everyone's screen within ~30 seconds.
- **Volunteer log**: name, Teen/Adult, date, hours, activity.
- **Monthly export**: pick a month → *Download Excel* (needs internet).

## Good to know
- If two people edit the *same* sign-in event or calendar activity at the same moment, the last save wins.
- Offline? Changes are kept on the device and upload when it reconnects.
- The password protects the data but everyone with it can edit and delete. To change it, edit `PASSWORD` in `netlify/functions/api.mjs` and redeploy.
- Netlify's free plan is plenty for this volume.
