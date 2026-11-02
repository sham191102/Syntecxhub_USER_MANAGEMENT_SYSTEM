# ShamWEB User Management API

A REST API for managing user accounts with Express, MongoDB, and Mongoose. It includes password hashing, bearer-token authentication, role-protected administration, request validation, and paginated user search.

## Requirements

- Node.js 20 or newer
- MongoDB running locally or a MongoDB connection string

## Setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a unique `JWT_SECRET` of at least 32 characters.
3. Start the API:

   ```powershell
   npm run dev
   ```

The API listens on `http://localhost:3000` by default. `GET /api/health` checks that the HTTP server is responding.

## Authentication and first administrator

Register a standard account with `POST /api/auth/register`, or sign in with `POST /api/auth/login`. Both return a JWT. Send it on protected requests as:

```http
Authorization: Bearer <token>
```

Public registration always creates a standard user; it cannot assign administrator privileges. To create the initial administrator, set `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (at least 12 characters) in `.env`, then run:

```powershell
npm run seed:admin
```

The seed command refuses to create another administrator if one already exists. If you have lost the existing admin login, set the desired `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env`, then run `npm run reset:admin` from the project root (or `npm run reset:admin` from the backend folder). This updates the existing admin account, or creates the first one if none exists. It refuses to reset when multiple admins exist, unless the configured email identifies the target admin. Remove the seed credentials from `.env` after setup.

## Endpoints

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Health check |
| `POST` | `/api/auth/register` | Public | Register a standard user |
| `POST` | `/api/auth/login` | Public | Sign in and receive a JWT |
| `GET` | `/api/users/me` | Authenticated | Get the current profile |
| `PATCH` | `/api/users/me` | Authenticated | Update own name, email, or password |
| `DELETE` | `/api/users/me` | Authenticated | Delete own account |
| `GET` | `/api/users` | Admin | List users; supports `page`, `limit`, `search`, and `role` |
| `GET` | `/api/users/stats` | Admin | Get total, member, and administrator counts |
| `POST` | `/api/users` | Admin | Create a user; admins may assign a role |
| `GET` | `/api/users/:id` | Admin | Get a user |
| `PATCH` | `/api/users/:id` | Admin | Update a user |
| `DELETE` | `/api/users/:id` | Admin | Delete a user |

User list example: `GET /api/users?page=1&limit=20&search=sam&role=user`. Page size is capped at 100. Passwords are hashed with bcrypt and are never included in API responses.

## Testing

```powershell
npm test
```

## Postman

Import [`postman/User Management API.postman_collection.json`](./postman/User%20Management%20API.postman_collection.json) into Postman. Start the API, run the login request with an administrator account, then use the admin user-management requests. The collection saves the returned token and newly created user ID automatically. Update the sample credentials in the login request to match your local administrator.
