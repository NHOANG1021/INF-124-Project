const express = require("express");
const router = express.Router();
const pool = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM Task
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get tasks",
      error: err.message,
    });
  }
});

// GET task by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM Task
      WHERE "TaskID" = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get task",
      error: err.message,
    });
  }
});

// POST Task
router.post("/", async (req, res) => {
  try {
    const {
      UserID,
      TaskTrackingType,
      Title,
      IsCompleted,
      DueDate,
      XpReward,
      CoinReward
    } = req.body;

    if (!UserID || !TaskTrackingType || !Title) {
      return res.status(400).json({
        error: "UserID, TaskTrackingType, and Title are required"
      });
    }

    await pool.query(
      `
      INSERT INTO Task
      (
        "UserID",
        "TaskTrackingType",
        "Title",
        "IsCompleted",
        "DueDate",
        "XpReward",
        "CoinReward"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        UserID,
        TaskTrackingType,
        Title,
        IsCompleted || false,
        DueDate || null,
        XpReward || 0,
        CoinReward || 0
      ]
    );

    res.status(201).json({
      message: "Task added successfully"
    });

  } catch (err) {
    console.error("Error adding task:", err);

    res.status(500).json({
      error: "Failed to add task",
      details: err.message
    });
  }
});

// UPDATE Task
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      UserID,
      TaskTrackingType,
      Title,
      IsCompleted,
      DueDate,
      XpReward,
      CoinReward
    } = req.body;

    if (!UserID || !TaskTrackingType || !Title) {
      return res.status(400).json({
        error: "UserID, TaskTrackingType, and Title are required"
      });
    }

    const result = await pool.query(
      `
      UPDATE Task
      SET "UserID" = $1,
          "TaskTrackingType" = $2,
          "Title" = $3,
          "IsCompleted" = $4,
          "DueDate" = $5,
          "XpReward" = $6,
          "CoinReward" = $7,
          "Updated_At" = CURRENT_TIMESTAMP,
          "CompletedAt" = CASE
            WHEN $4 = TRUE THEN CURRENT_TIMESTAMP
            ELSE NULL
          END
      WHERE "TaskID" = $8
      `,
      [
        UserID,
        TaskTrackingType,
        Title,
        IsCompleted || false,
        DueDate || null,
        XpReward || 0,
        CoinReward || 0,
        id
      ]
    );

    if (handleNotFound(result, res, "Task")) return;

    res.status(200).json({
      message: "Task updated successfully"
    });

  } catch (err) {
    console.error("Error updating task:", err);

    res.status(500).json({
      error: "Failed to update task",
      details: err.message
    });
  }
});

// COMPLETE Task
router.patch("/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE Task
      SET "IsCompleted" = TRUE,
          "CompletedAt" = CURRENT_TIMESTAMP,
          "Updated_At" = CURRENT_TIMESTAMP
      WHERE "TaskID" = $1
      `,
      [id]
    );

    if (handleNotFound(result, res, "Task")) return;

    res.status(200).json({
      message: "Task completed successfully"
    });

  } catch (err) {
    console.error("Error completing task:", err);

    res.status(500).json({
      error: "Failed to complete task",
      details: err.message
    });
  }
});

// DELETE Task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM Task
      WHERE "TaskID" = $1
      `,
      [id]
    );

    if (handleNotFound(result, res, "Task")) return;

    res.status(200).json({
      message: "Task deleted successfully"
    });

  } catch (err) {
    console.error("Error deleting task:", err);

    res.status(500).json({
      error: "Failed to delete task",
      details: err.message
    });
  }
});

module.exports = router;