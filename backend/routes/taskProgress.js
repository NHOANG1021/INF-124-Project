const express = require("express");
const router = express.Router();
const sql = require("mssql/msnodesqlv8");
const { connectDB } = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all task progress records
router.get("/", async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT 
        tp.ProgressID,
        tp.TaskID,
        tp.UserID,
        tp.ProgressValue,
        tp.TargetValue,
        tp.Updated_At,
        t.Title,
        t.IsCompleted
      FROM TaskProgress tp
      JOIN Task t
        ON tp.TaskID = t.TaskID
      ORDER BY tp.Updated_At DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get task progress",
      error: err.message,
    });
  }
});

// GET progress for one user
router.get("/user/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .query(`
        SELECT 
          tp.ProgressID,
          tp.TaskID,
          tp.UserID,
          tp.ProgressValue,
          tp.TargetValue,
          tp.Updated_At,
          t.Title,
          t.IsCompleted,
          t.DueDate,
          t.XpReward,
          t.CoinReward
        FROM TaskProgress tp
        JOIN Task t
          ON tp.TaskID = t.TaskID
        WHERE tp.UserID = @UserID
        ORDER BY tp.Updated_At DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get progress for user",
      error: err.message,
    });
  }
});

// GET progress for one task
router.get("/task/:taskID", async (req, res) => {
  try {
    const { taskID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("TaskID", sql.Int, taskID)
      .query(`
        SELECT 
          tp.ProgressID,
          tp.TaskID,
          tp.UserID,
          tp.ProgressValue,
          tp.TargetValue,
          tp.Updated_At,
          t.Title,
          t.IsCompleted
        FROM TaskProgress tp
        JOIN Task t
          ON tp.TaskID = t.TaskID
        WHERE tp.TaskID = @TaskID
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get progress for task",
      error: err.message,
    });
  }
});

// POST create task progress
router.post("/", async (req, res) => {
  try {
    const { TaskID, UserID, ProgressValue, TargetValue } = req.body;

    if (!TaskID || !UserID || TargetValue == null) {
      return res.status(400).json({
        error: "TaskID, UserID, and TargetValue are required"
      });
    }

    const pool = await connectDB();

    // Check if task exists
    const taskCheck = await pool.request()
      .input("TaskID", sql.Int, TaskID)
      .query(`
        SELECT TaskID
        FROM Task
        WHERE TaskID = @TaskID
      `);

    if (taskCheck.recordset.length === 0) {
      return res.status(404).json({
        error: "Task does not exist"
      });
    }

    // Check if user exists
    const userCheck = await pool.request()
      .input("UserID", sql.Int, UserID)
      .query(`
        SELECT UserID
        FROM Users
        WHERE UserID = @UserID
      `);

    if (userCheck.recordset.length === 0) {
      return res.status(404).json({
        error: "User does not exist"
      });
    }

    // Check if progress already exists for this user/task
    const existingProgress = await pool.request()
      .input("TaskID", sql.Int, TaskID)
      .input("UserID", sql.Int, UserID)
      .query(`
        SELECT ProgressID
        FROM TaskProgress
        WHERE TaskID = @TaskID
          AND UserID = @UserID
      `);

    if (existingProgress.recordset.length > 0) {
      return res.status(409).json({
        error: "Progress already exists for this user and task"
      });
    }

    const startingProgress = ProgressValue ?? 0;

    await pool.request()
      .input("TaskID", sql.Int, TaskID)
      .input("UserID", sql.Int, UserID)
      .input("ProgressValue", sql.Int, startingProgress)
      .input("TargetValue", sql.Int, TargetValue)
      .query(`
        INSERT INTO TaskProgress
        (TaskID, UserID, ProgressValue, TargetValue, Updated_At)
        VALUES
        (@TaskID, @UserID, @ProgressValue, @TargetValue, GETDATE())
      `);

    res.status(201).json({
      message: "Task progress created successfully"
    });
  } catch (err) {
    console.error("Error creating task progress:", err);

    res.status(500).json({
      error: "Failed to create task progress",
      details: err.message
    });
  }
});

// PUT update task progress by ProgressID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { ProgressValue, TargetValue } = req.body;

    if (ProgressValue == null || TargetValue == null) {
      return res.status(400).json({
        error: "ProgressValue and TargetValue are required"
      });
    }

    const pool = await connectDB();

    const result = await pool.request()
      .input("ProgressID", sql.Int, id)
      .input("ProgressValue", sql.Int, ProgressValue)
      .input("TargetValue", sql.Int, TargetValue)
      .query(`
        UPDATE TaskProgress
        SET ProgressValue = @ProgressValue,
            TargetValue = @TargetValue,
            Updated_At = GETDATE()
        WHERE ProgressID = @ProgressID
      `);

    if (handleNotFound(result, res, "Task progress")) return;

    // If progress reaches target, mark task completed
    await pool.request()
      .input("ProgressID", sql.Int, id)
      .query(`
        UPDATE Task
        SET IsCompleted = 1,
            CompletedAt = GETDATE(),
            Updated_At = GETDATE()
        WHERE TaskID = (
          SELECT TaskID
          FROM TaskProgress
          WHERE ProgressID = @ProgressID
        )
        AND (
          SELECT ProgressValue
          FROM TaskProgress
          WHERE ProgressID = @ProgressID
        ) >= (
          SELECT TargetValue
          FROM TaskProgress
          WHERE ProgressID = @ProgressID
        )
      `);

    res.status(200).json({
      message: "Task progress updated successfully"
    });
  } catch (err) {
    console.error("Error updating task progress:", err);

    res.status(500).json({
      error: "Failed to update task progress",
      details: err.message
    });
  }
});

// PATCH increment progress by ProgressID
router.patch("/:id/increment", async (req, res) => {
  try {
    const { id } = req.params;
    const { Amount } = req.body;

    const incrementAmount = Amount ?? 1;

    const pool = await connectDB();

    const result = await pool.request()
      .input("ProgressID", sql.Int, id)
      .input("Amount", sql.Int, incrementAmount)
      .query(`
        UPDATE TaskProgress
        SET ProgressValue = 
          CASE
            WHEN ProgressValue + @Amount > TargetValue THEN TargetValue
            ELSE ProgressValue + @Amount
          END,
          Updated_At = GETDATE()
        WHERE ProgressID = @ProgressID
      `);

    if (handleNotFound(result, res, "Task progress")) return;

    // Mark task completed if progress reached target
    await pool.request()
      .input("ProgressID", sql.Int, id)
      .query(`
        UPDATE Task
        SET IsCompleted = 1,
            CompletedAt = GETDATE(),
            Updated_At = GETDATE()
        WHERE TaskID = (
          SELECT TaskID
          FROM TaskProgress
          WHERE ProgressID = @ProgressID
        )
        AND (
          SELECT ProgressValue
          FROM TaskProgress
          WHERE ProgressID = @ProgressID
        ) >= (
          SELECT TargetValue
          FROM TaskProgress
          WHERE ProgressID = @ProgressID
        )
      `);

    res.status(200).json({
      message: "Task progress incremented successfully"
    });
  } catch (err) {
    console.error("Error incrementing task progress:", err);

    res.status(500).json({
      error: "Failed to increment task progress",
      details: err.message
    });
  }
});

// PATCH complete checkbox task
router.patch("/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("ProgressID", sql.Int, id)
      .query(`
        UPDATE TaskProgress
        SET ProgressValue = TargetValue,
            Updated_At = GETDATE()
        WHERE ProgressID = @ProgressID
      `);

    if (handleNotFound(result, res, "Task progress")) return;

    await pool.request()
      .input("ProgressID", sql.Int, id)
      .query(`
        UPDATE Task
        SET IsCompleted = 1,
            CompletedAt = GETDATE(),
            Updated_At = GETDATE()
        WHERE TaskID = (
          SELECT TaskID
          FROM TaskProgress
          WHERE ProgressID = @ProgressID
        )
      `);

    res.status(200).json({
      message: "Task marked as complete"
    });
  } catch (err) {
    console.error("Error completing task progress:", err);

    res.status(500).json({
      error: "Failed to complete task progress",
      details: err.message
    });
  }
});

// DELETE task progress
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("ProgressID", sql.Int, id)
      .query(`
        DELETE FROM TaskProgress
        WHERE ProgressID = @ProgressID
      `);

    if (handleNotFound(result, res, "Task progress")) return;

    res.status(200).json({
      message: "Task progress deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting task progress:", err);

    res.status(500).json({
      error: "Failed to delete task progress",
      details: err.message
    });
  }
});

module.exports = router;