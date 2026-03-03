const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/apollonia";

// Static frontend
app.use(express.static(path.join(__dirname, "public")));

// Routes
const departmentRoutes = require("./routes/departments");
const employeeRoutes = require("./routes/employees");

app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function startServer() {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
