# Copilot Instructions for Zopper E-commerce Backend

## Project Overview
- Node.js/Express backend for e-commerce, focused on session-based authentication (no JWT).
- MongoDB Atlas is used via Mongoose for all data persistence.
- Passwords are always hashed with bcrypt (12 salt rounds).
- All API routes are under `/api` and use RESTful conventions.
- Two main user roles: `customer` and `admin` (see `User.js`).

## Key Files & Structure
- `server.js`: Entry point, sets up Express, MongoDB, sessions, CORS, and routes.
- `config.js`: Loads environment variables and configures DB connection.
- `models/`: Mongoose schemas for `User`, `Admin`, `Product`, `Category`, `Vendor`.
- `routes/`: Route handlers for `auth`, `admin`, `products`, `subcategories`, `vendor`.
- `middleware/`: Auth/session middleware (`auth.js`, `jwtAuth.js`, `adminAuth.js`).
- `.env`: Required for DB URI, session secret, etc. (see README for template).

## Developer Workflows
- **Install:** `npm install`
- **Run (dev):** `npx nodemon server.js` (auto-reloads)
- **Run (prod):** `npm start`
- **Test connection:** `node test-mongodb-connection.js`
- **API smoke tests:** `node test-api.js`, `node test-admin-api.js`, etc.

## Patterns & Conventions
- **Session Auth:** Uses `express-session` (see `server.js`). No JWT for user auth.
- **Error Handling:** Consistent JSON error format: `{ success: false, message, error }`.
- **Validation:** All user input is validated before DB writes (see route handlers).
- **Password Security:** Passwords are never returned in responses.
- **Role Checks:** Admin routes require `adminAuth` middleware.
- **Timestamps:** All models use ISO 8601 dates.
- **CORS:** Configured for local React frontend (see `server.js`).

## Integration Points
- **MongoDB Atlas:** Connection string in `.env` as `MONGODB_URI`.
- **Frontend:** Designed for React, expects session cookies for auth.
- **Session Storage:** Sessions are server-side, not in JWTs.

## Examples
- To add a new protected route: use `auth.js` or `adminAuth.js` middleware.
- To add a new model: create in `models/`, register in `server.js` if needed.
- To extend user roles: update `User.js` schema and relevant middleware.

## References
- See `README.md` for API details, environment setup, and example requests.
- See `ADMIN_API_DOCUMENTATION.md`, `PRODUCT_API_DOCUMENTATION.md`, etc. for endpoint specifics.

---

**For AI agents:**
- Always follow the session-based auth pattern (no JWT unless explicitly required).
- Use existing error/response formats and validation logic as reference.
- When in doubt, check `README.md` and route/middleware files for project-specific logic.
