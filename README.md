# Apollonia Employee Management API

Simple employee management CRUD API for Apollonia Dental Practice, built with Node.js, Express, and MongoDB.

## Setup (local, without Docker)

1. Make sure you have **Node.js** and **MongoDB** installed and running locally.
2. In the project folder, create a `.env` file based on `.env.example`:

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/apollonia
   ```

3. Install dependencies (already done if you ran `npm install`):

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. The API will be available at `http://localhost:3000`.

## Setup with Docker

1. Make sure you have **Docker** and **Docker Compose** installed.
2. From the project folder, run:

   ```bash
   docker-compose up --build
   ```

3. The API will be available at `http://localhost:3000`.

MongoDB runs in a separate `mongo` container, and the app connects using:

```text
MONGO_URI=mongodb://mongo:27017/apollonia
```

## Main Endpoints

- `GET /` – Basic health/info message.

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
