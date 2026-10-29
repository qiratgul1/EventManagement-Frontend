# Golden Hour: Frontend

React 18 + Vite + React Router + Axios + Socket.IO client. Purple-pink gradient theme, glass navbar, unique footer, logo with a glowing disc behind the letters and a blinking dot.
Fonts: **Unbounded** (headings, logo) and **Outfit** (body).

## Run (backend not deployed, local only)
1. Start the backend first (it listens on port 5000 in your Postman tests).
2. In this folder:
```
npm install
rename env.example to .env
npm run dev
```
3. Open http://localhost:5173

## Backend port
`.env` contains `VITE_API_PORT=5000`. If your backend runs on another port, change this number and restart `npm run dev`.
After you deploy the backend, set `VITE_API_URL=https://your-backend-url` (it takes priority over the port), then `npm run build`.
Backend `.env`: set `CLIENT_URL=http://localhost:5173` so password-reset emails open this app.

## Folder structure
```
index.html  package.json  vite.config.js  .env  public/favicon.svg
src/
  main.jsx  App.jsx  index.css  api.js  AuthContext.jsx  ui.jsx
  components/  Logo  Layout  Footer  AuthShell  ProtectedRoute  ExhibitorSearch  Schedule  FloorPlan
  pages/       Login Register ForgotPassword ResetPassword Expos ExpoDetail Feedback Messages Notifications Account MyAgenda
               ExhibitorProfile ExhibitorApplications ExhibitorBooths
               AdminDashboard AdminExpos AdminApplications AdminBooths AdminSchedule AdminReports AdminFeedback
```

## Roles
attendee, exhibitor and admin/organizer each see their own menu. Real-time updates (booths, schedule, chat, notifications, admin activity) use Socket.IO.

## Change the look
All colors, fonts and spacing live in `src/index.css` (variables at the top). The logo is drawn in `src/components/Logo.jsx`.
