# ShamWEB — User Management

A full-stack user-management application. The React frontend and Express/MongoDB backend remain in separate folders, but the root scripts install and run them together. In development, the frontend proxies `/api` requests to the backend; in production, the backend can serve the built frontend and API from one origin.

## Requirements

- Node.js 20+
- MongoDB running locally, or a MongoDB connection string

## Configure MongoDB and the API

The first `npm run dev` automatically creates `backend/.env` from the local MongoDB defaults and a randomly generated, private JWT secret if the file is missing. Alternatively, run `npm run setup:env`. These commands never replace an existing `backend/.env`. To use another database, edit `MONGODB_URI` in `backend/.env`; keep this file private.

For example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/syntexchub_users
JWT_SECRET=use-a-unique-random-secret-at-least-32-characters
```

## Install and run the complete application

From the project root:

```powershell
npm install
npm run dev
```

The backend runs at `http://localhost:3000`; the Vite frontend is usually at `http://localhost:5173`. Open the frontend URL. Its `/api` requests are automatically forwarded to the backend, so both servers share the same configured API without a separate frontend API URL.

The frontend and backend can also be started separately with `npm run dev --workspace=frontend` and `npm run dev --workspace=backend`.

## Create the first administrator

Set `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` of at least 12 characters in `backend/.env`, then, from the project root, run:

```powershell
npm run seed:admin
```

The seed command refuses to create another administrator if an admin already exists. If you have lost the existing admin login, set the desired `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `backend/.env`, then run `npm run reset:admin` from the project root. This updates the existing admin account (or creates the first one if none exists). Remove the admin password from `.env` after setup. Public registration creates regular member accounts only.

## Features

- Sign up, log in, and persist the authenticated session.
- View and update your own profile.
- Admin dashboard with user totals, member and admin counts, search, pagination, account creation, role editing, and deletion.
- Postman collection in `backend/postman` for direct API testing.

## Production and checks

Build the frontend and run the API in production mode to serve both from the same origin:

```powershell
npm run build
$env:NODE_ENV = 'production'
npm start
```

Run backend tests from the project root:

```powershell
npm test
```

For API routes, environment variables, and implementation details, see `backend/README.md`.
