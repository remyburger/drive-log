# Amelie's Drive Log

A shared, real-time driving-practice tracker built for one specific family's supervised-driving requirement (50 total hours, including 10 night hours), but generic enough to fork for anyone else's DMV requirement.

Built with React + Vite, using Firebase (Authentication + Firestore) so the log stays in sync in real time across everyone's devices, with no backend server to run or maintain.

## Features

- **Live session timer** — start/stop tracking with one tap, or add/edit sessions manually after the fact
- **Three logins** (Mom, Dad, and the student), each seeing the same shared log in real time
- **Precise night-driving detection** — calculates actual sunset/sunrise for a fixed location (currently Boulder, CO) and splits each session's minutes between day and night accordingly, rather than tagging a whole session as one or the other
- **Progress dashboard** — an arc gauge plus stat rows for total, day, and night hours against configurable goals
- **Milestone badges** — first drive, hour thresholds, night-hour thresholds, with a celebratory toast when a new one is hit
- **Six visual themes** ("skins"), independent of who's logged in — anyone can switch look and feel at any time, and the choice follows each person's login across devices
- **Two export formats**: CSV, and a print-ready PDF styled like a supervised-driving affidavit (summary of hours + signature line)
- **Companion tracking**: Mom / Dad / Other (with an optional custom label, e.g. "Instructor")
- **PWA-friendly**: installable to a phone home screen with a custom icon, works full-screen without browser chrome

## Tech stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Firebase Authentication](https://firebase.google.com/docs/auth) (email/password) — access control
- [Firebase Firestore](https://firebase.google.com/docs/firestore) — real-time shared data
- [SunCalc](https://github.com/mourner/suncalc) — sunrise/sunset astronomical calculations
- [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) — client-side PDF export
- [Tailwind CSS](https://tailwindcss.com/) (utility classes only, most styling is inline)
- [Lucide](https://lucide.dev/) — icons
- Deployed via [GitHub Actions](https://github.com/features/actions) to [GitHub Pages](https://pages.github.com/)

## Project structure

```
├── public/
│   ├── icon-192.png, icon-512.png, apple-touch-icon.png,
│   │   favicon-32.png, favicon.ico    — app icon set
│   └── site.webmanifest                — PWA manifest
├── src/
│   ├── App.jsx        — main app: session tracking, log, export, UI
│   ├── Login.jsx       — email/password sign-in screen
│   ├── firebase.js     — Firebase project config + SDK init
│   ├── roles.js        — maps login emails to Mom/Dad/student roles
│   ├── sun.js           — sunrise/sunset + night-minutes calculations
│   ├── theme.js         — all 6 visual theme definitions
│   ├── main.jsx, index.css
├── index.html
├── vite.config.js
└── .github/workflows/deploy.yml   — auto-deploy to GitHub Pages on push
```

## Setup

### 1. Firebase project

1. Create a project at the [Firebase console](https://console.firebase.google.com), register a web app, and copy the config object into `src/firebase.js`.
2. Enable **Firestore Database**.
3. Enable **Authentication → Sign-in method → Email/Password**, then create one account per person under **Authentication → Users**.
4. Edit `src/roles.js` to map each account's email to `"mom"`, `"dad"`, or the student's role key.
5. Set Firestore rules to require login:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /drivelog/{docId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### 2. Location

Night-driving detection is pinned to a fixed latitude/longitude in `src/sun.js`. Update `LOCATION_LAT` / `LOCATION_LON` there if tracking happens somewhere other than Boulder, CO.

### 3. Local development

```bash
npm install
npm run dev
```

### 4. Deploy

1. Update `REPO_NAME` in `vite.config.js` to match your GitHub repo name (needed for correct asset paths on GitHub Pages).
2. Push to `main`. The included GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys automatically.
3. In the repo's **Settings → Pages**, set **Source** to "GitHub Actions".
4. The live site will be at `https://<username>.github.io/<repo>/`.

## Notes

- **Goals** (50 total hours / 10 night hours) are hardcoded constants (`TOTAL_GOAL`, `NIGHT_GOAL`) near the top of `App.jsx` — change them if your state's requirement differs.
- **Distance tracking** is intentionally not included — GPS tracking in a home-screen web app is unreliable once iOS suspends a backgrounded tab, so manual odometer entry would be the more honest approach if ever added.
- **Firestore security** here is intentionally simple (any signed-in account can read/write everything) — fine for a small family use case, but not a general-purpose multi-tenant setup.
- The **student's name and DMV hour goals shown in the PDF export** are hardcoded in the `exportPDF` function in `App.jsx`.
