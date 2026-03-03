const express = require("express");
const Employee = require("../models/Employee");
const Department = require("../models/Department");

const router = express.Router();

// Create employee
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, departmentId } = req.body;

    if (!firstName || !lastName || !departmentId) {
      return res
        .status(400)
        .json({ message: "firstName, lastName and departmentId are required" });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(400).json({ message: "Invalid departmentId" });
    }

    const employee = await Employee.create({
      firstName,
      lastName,
      department: departmentId,
    });

    res.status(201).json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all employees (optionally filter by departmentId)
router.get("/", async (req, res) => {
  try {
    const { departmentId } = req.query;
    const query = {};
    if (departmentId) {
      query.department = departmentId;
    }

    const employees = await Employee.find(query)
      .populate("department", "name")
      .sort({ lastName: 1, firstName: 1 });

    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single employee
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate(
      "department",
      "name"
    );
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update employee
router.put("/:id", async (req, res) => {
  try {
    const { firstName, lastName, departmentId } = req.body;

    const update = {};
    if (firstName) update.firstName = firstName;
    if (lastName) update.lastName = lastName;

    if (departmentId) {
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(400).json({ message: "Invalid departmentId" });
      }
      update.department = departmentId;
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete employee
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
