const express = require("express");
const router = express.Router();
const sql = require("mssql/msnodesqlv8");
const { connectDB } = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT *
      FROM Task
    `);

    res.json(result.recordset);
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

    const pool = await connectDB();

    const result = await pool.request()
      .input("TaskID", sql.Int, id)
      .query(`
        SELECT *
        FROM Task
        WHERE TaskID = @TaskID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    res.json(result.recordset[0]);
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

    const pool = await connectDB();

    await pool.request()
      .input("UserID", sql.Int, UserID)
      .input("TaskTrackingType", sql.Int, TaskTrackingType)
      .input("Title", sql.VarChar, Title)
      .input("IsCompleted", sql.Bit, IsCompleted || false)
      .input("DueDate", sql.DateTime, DueDate || null)
      .input("XpReward", sql.Int, XpReward || 0)
      .input("CoinReward", sql.Int, CoinReward || 0)
      .query(`
        INSERT INTO Task
        (UserID, TaskTrackingType, Title, IsCompleted, DueDate, XpReward, CoinReward)
        VALUES
        (@UserID, @TaskTrackingType, @Title, @IsCompleted, @DueDate, @XpReward, @CoinReward)
      `);

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

    const pool = await connectDB();

    const result = await pool.request()
      .input("TaskID", sql.Int, id)
      .input("UserID", sql.Int, UserID)
      .input("TaskTrackingType", sql.Int, TaskTrackingType)
      .input("Title", sql.VarChar, Title)
      .input("IsCompleted", sql.Bit, IsCompleted || false)
      .input("DueDate", sql.DateTime, DueDate || null)
      .input("XpReward", sql.Int, XpReward || 0)
      .input("CoinReward", sql.Int, CoinReward || 0)
      .query(`
        UPDATE Task
        SET UserID = @UserID,
            TaskTrackingType = @TaskTrackingType,
            Title = @Title,
            IsCompleted = @IsCompleted,
            DueDate = @DueDate,
            XpReward = @XpReward,
            CoinReward = @CoinReward,
            Updated_At = GETDATE(),
            CompletedAt = CASE 
              WHEN @IsCompleted = 1 THEN GETDATE()
              ELSE NULL
            END
        WHERE TaskID = @TaskID
      `);

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

    const pool = await connectDB();

    const result = await pool.request()
      .input("TaskID", sql.Int, id)
      .query(`
        UPDATE Task
        SET IsCompleted = 1,
            CompletedAt = GETDATE(),
            Updated_At = GETDATE()
        WHERE TaskID = @TaskID
      `);

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

    const pool = await connectDB();

    const result = await pool.request()
      .input("TaskID", sql.Int, id)
      .query(`
        DELETE FROM Task
        WHERE TaskID = @TaskID
      `);

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