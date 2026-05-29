# Real Estate Property Management System

A production-style full-stack Real Estate Property Management System using ReactJS, HTML, CSS, Bootstrap, NodeJS, ExpressJS, JWT, bcrypt, Multer, and MySQL.

## Delivered Modules

- Role-based authentication for buyer, seller, agent, and admin
- JWT auth middleware and role authorization middleware
- Property CRUD with pagination, search, filters, detail page, and responsive cards
- Multiple property image upload through Multer into `server/uploads/`
- Gallery display on property detail pages
- Visit booking with approval/rejection workflow and booking history
- Favorite properties
- Loan EMI calculator
- Agent/admin dashboards with statistics and reports
- Admin user management
- MySQL schema, relationships, foreign keys, and indexes
- Bootstrap responsive UI with loading states and toast notifications

## Folder Structure

```text
client/
  src/
    api/              Axios client
    components/       Shared UI components
    context/          Auth context
    pages/            Route pages
    main.jsx          React Router setup
    styles.css        Bootstrap-friendly custom styles
  vite.config.js

server/
  db/
    schema.sql        Complete MySQL schema
    seed.sql          Empty by design; create real records through the app/API
  src/
    config/           MySQL connection
    controllers/      Request handlers
    middleware/       Auth, upload, errors
    models/           Data-access layer
    routes/           REST routes
    utils/            Helpers
    app.js            Express app
    index.js          Server bootstrap
  uploads/            Multer image uploads
```

## Setup

Install all dependencies:

```bash
npm run install:all
```

Create MySQL schema:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS real_estate_pm;"
mysql -u root -p real_estate_pm < server/db/schema.sql
```

Configure environment:

```bash
# In server directory
cp .env.example .env
```

Update `server/.env` with your MySQL credentials. **Note: The project requires a running MySQL database and will not start without one.**

Run in development:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5174` (or the next available port) and the backend at `http://localhost:5004`.

Build frontend and serve it through Express:

```bash
npm run build
npm run start --prefix server
```

Local URLs:

- Frontend dev server: `http://localhost:5174` or the next available Vite port
- API server: `http://localhost:5004`
- Health check: `http://localhost:5004/api/health`

## Initial Users

No preloaded users are provided. Create real users through registration, then promote the first verified platform administrator directly in MySQL.

## API Examples

Login:

```bash
curl -X POST http://localhost:5004/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-real-password"}'
```

List properties:

```bash
curl "http://localhost:5004/api/properties?city=Mumbai&category=residential&page=1&limit=9"
```

Create property as seller/agent:

```bash
curl -X POST http://localhost:5004/api/properties \
  -H "Authorization: Bearer TOKEN" \
  -F "title=New City Apartment" \
  -F "description=Ready to move apartment near metro" \
  -F "property_type=Apartment" \
  -F "category=residential" \
  -F "price=8500000" \
  -F "city=Mumbai" \
  -F "address=Andheri East, Mumbai" \
  -F "bedrooms=3" \
  -F "bathrooms=2" \
  -F "area_sqft=1250" \
  -F "availability=available" \
  -F "images=@/path/to/property.jpg"
```

Book visit:

```bash
curl -X POST http://localhost:5004/api/bookings \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"property_id":1,"booking_date":"2026-06-10","booking_time":"11:00"}'
```

Save favorite:

```bash
curl -X POST http://localhost:5004/api/favorites/1 \
  -H "Authorization: Bearer TOKEN"
```

Admin/agent dashboard:

```bash
curl http://localhost:5004/api/reports/summary \
  -H "Authorization: Bearer TOKEN"
```
