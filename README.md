## Office Management

### Modules
- **Administration**: Departments, Employees, Leave Approvals
- **Employee**: Dashboard, My Leaves

### Roles
- **Admin**: `ADMIN_EMAIL` / `ADMIN_PASSWORD` (leave approvals only)
- **Manager**: can manage departments/employees + approve leaves
- **Employee**: can apply leave + view own requests

### Setup

Install dependencies:

```bash
npm run install:all
```

Configure server environment:

- Copy `server/.env.example` to `server/.env`
- Update `JWT_SECRET` and `MONGO_URI` if needed

Run both apps (recommended):

```bash
npm run dev
```

Or run separately:

```bash
npm run dev:server
npm run dev:client
```

### URLs
- **Client**: `http://localhost:5174/` (Vite may auto-pick another port)
- **API**: `http://localhost:5000/api`

# Office Management (MERN)

An **office management** starter app built with **MongoDB + Express + React (Vite) + Node**.

## Features

- **Auth**: Register/login with JWT
- **Employees**: Create/list/update/delete employees (admin/manager)
- **Departments**: Create/list/update/delete departments (admin/manager)
- **Leave requests**: Employees can request leave; managers/admin can approve/deny
- **Frontend**: Clean dashboard UI with routing and protected pages

## Prereqs

- Install **Node.js (LTS)** from [nodejs.org](https://nodejs.org/)
- Install and run **MongoDB** locally, or use MongoDB Atlas

## Quick start

From the `office-management` folder:

```bash
# install deps (root script installs root + server + client)
npm run install:all

# start both backend and frontend (two terminals)
npm run dev
```

Then open the app at `http://localhost:5173`.

## Environment variables

### Backend

Copy:

- `server/.env.example` → `server/.env`

### Frontend

Copy:

- `client/.env.example` → `client/.env`

## Accounts

Create an account via the Register screen.

- The **first registered account becomes `admin`** automatically.
- Then create departments, and use **Employees → Add employee** to create employee accounts.

To manually change a user role in MongoDB:

- `users.role`: `employee` | `manager` | `admin`

## Scripts (root)

- `npm run dev`: starts server and client
- `npm run dev:server`: server only
- `npm run dev:client`: client only
- `npm run install:all`: installs both

