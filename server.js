const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const db = require("./db");
const { body, validationResult } = require("express-validator");

const PORT = process.env.PORT || 5000;

const app = express();

// =====================
// Middleware
// =====================
app.use(helmet());
app.use(cors({ origin: "http://localhost:3000" })); // allow only frontend
app.use(express.json());

// =====================
// Root route
// =====================
app.get("/", (req, res) => {
  res.send("To-Do Backend API is running");
});

// =====================
// Get all tasks
// =====================
app.get("/tasks", (req, res) => {
  db.query("SELECT * FROM tasks", (err, result) => {
    if (err) return res.status(500).send("Database error");
    res.json(result);
  });
});

// =====================
// Add new task
// =====================
app.post(
  "/tasks",
  body("title").trim().escape(),
  body("priority").trim().escape(),
  body("due_date").optional().isDate(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());

    const { title, priority, due_date } = req.body;
    const sql = "INSERT INTO tasks (title, priority, due_date) VALUES (?, ?, ?)";
    db.query(sql, [title, priority || "Low", due_date || null], (err) => {
      if (err) return res.status(500).send("Database error");
      res.status(201).send("Task Added");
    });
  }
);

// =====================
// Edit task
// =====================
app.put(
  "/tasks/edit/:id",
  body("title").trim().escape(),
  body("priority").trim().escape(),
  body("due_date").optional().isDate(),
  body("completed").isBoolean(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());

    const { title, priority, due_date, completed } = req.body;
    const sql = "UPDATE tasks SET title=?, priority=?, due_date=?, completed=? WHERE id=?";
    db.query(sql, [title, priority, due_date, completed, req.params.id], (err) => {
      if (err) return res.status(500).send("Database error");
      res.send("Task Updated");
    });
  }
);

// =====================
// Toggle completion
// =====================
app.put("/tasks/:id", (req, res) => {
  const { completed } = req.body;
  const sql = "UPDATE tasks SET completed=? WHERE id=?";
  db.query(sql, [completed, req.params.id], (err) => {
    if (err) return res.status(500).send("Database error");
    res.send("Task Updated");
  });
});

// =====================
// Delete task
// =====================
app.delete("/tasks/:id", (req, res) => {
  const sql = "DELETE FROM tasks WHERE id=?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).send("Database error");
    res.send("Task Deleted");
  });
});

// =====================
// Start server
// =====================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});