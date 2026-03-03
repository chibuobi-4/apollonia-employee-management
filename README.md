# Apollonia Employee Management

Employee management CRUD app for Apollonia Dental Practice, built with **Node.js**, **Express**, **MongoDB (Mongoose)** and a small frontend dashboard.

The backend exposes REST endpoints for employees and departments; the frontend (served at `/`) lets you do all CRUD operations from the browser.

**Live demo**: [`https://apollonia-employee-management.onrender.com`](https://apollonia-employee-management.onrender.com)

---

## Running locally (without Docker)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Create a `.env` file based on `.env.example`:

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/apollonia
   ```

3. **Start the dev server (with auto‑reload)**

   ```bash
   npm run dev
   ```

   Or run once:

   ```bash
   npm start
   ```

4. Open the app at `http://localhost:3000/`.

---

## Running with Docker

1. Make sure you have **Docker** and **Docker Compose** installed.
2. From the project folder, run:

   ```bash
   docker-compose up --build
   ```

3. The app will be available at `http://localhost:3000/`.

MongoDB runs in a separate `mongo` container, and the app connects using:

```text
MONGO_URI=mongodb://mongo:27017/apollonia
```

---

## API endpoints

- `GET /` – Frontend dashboard (CRUD UI).

### Departments

- `POST /api/departments` – Create a department.
- `GET /api/departments` – List all departments.
- `GET /api/departments/:id` – Get a single department.
- `PUT /api/departments/:id` – Update a department.
- `DELETE /api/departments/:id` – Delete a department.

### Employees

- `POST /api/employees` – Create an employee.
- `GET /api/employees` – List employees (optional `?departmentId=` filter).
- `GET /api/employees/:id` – Get a single employee.
- `PUT /api/employees/:id` – Update an employee.
- `DELETE /api/employees/:id` – Delete an employee.

You can use a REST client like Postman, Insomnia, or VS Code REST client to exercise the CRUD operations.
