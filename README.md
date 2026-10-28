# OutSchool — Parent Support App

React Native (Expo) parent app + web admin + Express API for school-gated speech & language content.

## What's included

| App | Path | Port | Purpose |
|-----|------|------|---------|
| API | `backend/` | `4100` | Auth, schools/codes, CMS content, analytics |
| Admin | `admin/` | `5173` | Schools, content publishing, usage dashboard |
| Mobile | `mobile/` | Expo | Parent unlock gate, content, Myth vs Fact, favourites/notes |

The API stores content in MongoDB (`mongodb://127.0.0.1:27017/outschool`). Prisma writes need a replica set, so the local server must be started with `replSetName: rs0`. The connection string in `backend/.env` includes `?replicaSet=rs0`.

## Quick start

```bash
cd C:\outschool
npm run setup
```

Then in three terminals:

```bash
npm run dev:backend
npm run dev:admin
npm run dev:mobile
```

### Default logins

- **Admin:** `admin@outschool.local` / `admin123`
- **Demo school code:** `DEMO2026`
- Parent unlock needs any valid email + that code

Admin UI: http://localhost:5173  
API health: http://localhost:4100/health

## Product rules (v1)

- Parents enter **email every time** and **school code once** (stored on device)
- Content locked until a valid, non-expired school code is used
- Favourites + notes are **local only** (no parent accounts)
- Videos hosted via **Vimeo** URLs
- Admin manages schools/codes/expiry, questions → subtopics → resources, Top Tips, usage by school

## Mobile API URL

By default the app targets:

- iOS simulator / web: `http://localhost:4100`
- Android emulator: `http://10.0.2.2:4100`
- Physical device: set `EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:4100` in `mobile/.env`

## Suggested next steps

1. Replace seed Vimeo URLs with real private videos
2. Show client the colourful admin + app UI for design approval
3. Create Google Play / Apple developer accounts
4. Add privacy policy page before store submission
