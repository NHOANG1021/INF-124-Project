const express = require("express");
const router = express.Router();
const pool = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all task progress records
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        tp."ProgressID",
        tp."TaskID",
        tp."UserID",
        tp."ProgressValue",
        tp."TargetValue",
        tp."Updated_At",
        t."Title",
        t."IsCompleted"
      FROM TaskProgress tp
      JOIN Task t
        ON tp."TaskID" = t."TaskID"
      ORDER BY tp."Updated_At" DESC
    `);

    res.json(result.rows);
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

    const result = await pool.query(
      `
      SELECT
        tp."ProgressID",
        tp."TaskID",
        tp."UserID",
        tp."ProgressValue",
        tp."TargetValue",
        tp."Updated_At",
        t."Title",
        t."IsCompleted",
        t."DueDate",
        t."XpReward",
        t."CoinReward"
      FROM TaskProgress tp
      JOIN Task t
        ON tp."TaskID" = t."TaskID"
      WHERE tp."UserID" = $1
      ORDER BY tp."Updated_At" DESC
      `,
      [userID]
    );

    res.json(result.rows);
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

    const result = await pool.query(
      `
      SELECT
        tp."ProgressID",
        tp."TaskID",
        tp."UserID",
        tp."ProgressValue",
        tp."TargetValue",
        tp."Updated_At",
        t."Title",
        t."IsCompleted"
      FROM TaskProgress tp
      JOIN Task t
        ON tp."TaskID" = t."TaskID"
      WHERE tp."TaskID" = $1
      `,
      [taskID]
    );

    res.json(result.rows);
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

    const taskCheck = await pool.query(
      `
      SELECT "TaskID"
      FROM Task
      WHERE "TaskID" = $1
      `,
      [TaskID]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Task does not exist"
      });
    }

    const userCheck = await pool.query(
      `
      SELECT "UserID"
      FROM Users
      WHERE "UserID" = $1
      `,
      [UserID]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        error: "User does not exist"
      });
    }

    const existingProgress = await pool.query(
      `
      SELECT "ProgressID"
      FROM TaskProgress
      WHERE "TaskID" = $1
        AND "UserID" = $2
      `,
      [TaskID, UserID]
    );

    if (existingProgress.rows.length > 0) {
      return res.status(409).json({
        error: "Progress already exists for this user and task"
      });
    }

    await pool.query(
      `
      INSERT INTO TaskProgress
      (
        "TaskID",
        "UserID",
        "ProgressValue",
        "TargetValue",
        "Updated_At"
      )
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      `,
      [
        TaskID,
        UserID,
        ProgressValue ?? 0,
        TargetValue
      ]
    );

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

// PUT update task progress
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { ProgressValue, TargetValue } = req.body;

    if (ProgressValue == null || TargetValue == null) {
      return res.status(400).json({
        error: "ProgressValue and TargetValue are required"
      });
    }

    const result = await pool.query(
      `
      UPDATE TaskProgress
      SET "ProgressValue" = $1,
          "TargetValue" = $2,
          "Updated_At" = CURRENT_TIMESTAMP
      WHERE "ProgressID" = $3
      `,
      [ProgressValue, TargetValue, id]
    );

    if (handleNotFound(result, res, "Task progress")) return;

    await pool.query(
      `
      UPDATE Task
      SET "IsCompleted" = TRUE,
          "CompletedAt" = CURRENT_TIMESTAMP,
          "Updated_At" = CURRENT_TIMESTAMP
      WHERE "TaskID" = (
        SELECT "TaskID"
        FROM TaskProgress
        WHERE "ProgressID" = $1
      )
      AND (
        SELECT "ProgressValue"
        FROM TaskProgress
        WHERE "ProgressID" = $1
      ) >= (
        SELECT "TargetValue"
        FROM TaskProgress
        WHERE "ProgressID" = $1
      )
      `,
      [id]
    );

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

// PATCH increment progress
router.patch("/:id/increment", async (req, res) => {
  try {
    const { id } = req.params;
    const { Amount } = req.body;

    const incrementAmount = Amount ?? 1;

    const result = await pool.query(
      `
      UPDATE TaskProgress
      SET "ProgressValue" =
        CASE
          WHEN "ProgressValue" + $1 > "TargetValue"
            THEN "TargetValue"
          ELSE "ProgressValue" + $1
        END,
        "Updated_At" = CURRENT_TIMESTAMP
      WHERE "ProgressID" = $2
      `,
      [incrementAmount, id]
    );

    if (handleNotFound(result, res, "Task progress")) return;

    await pool.query(
      `
      UPDATE Task
      SET "IsCompleted" = TRUE,
          "CompletedAt" = CURRENT_TIMESTAMP,
          "Updated_At" = CURRENT_TIMESTAMP
      WHERE "TaskID" = (
        SELECT "TaskID"
        FROM TaskProgress
        WHERE "ProgressID" = $1
      )
      AND (
        SELECT "ProgressValue"
        FROM TaskProgress
        WHERE "ProgressID" = $1
      ) >= (
        SELECT "TargetValue"
        FROM TaskProgress
        WHERE "ProgressID" = $1
      )
      `,
      [id]
    );

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

// PATCH complete task
router.patch("/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      UPDATE TaskProgress
      SET "ProgressValue" = "TargetValue",
          "Updated_At" = CURRENT_TIMESTAMP
      WHERE "ProgressID" = $1
      `,
      [id]
    );

    if (handleNotFound(result, res, "Task progress")) return;

    await pool.query(
      `
      UPDATE Task
      SET "IsCompleted" = TRUE,
          "CompletedAt" = CURRENT_TIMESTAMP,
          "Updated_At" = CURRENT_TIMESTAMP
      WHERE "TaskID" = (
        SELECT "TaskID"
        FROM TaskProgress
        WHERE "ProgressID" = $1
      )
      `,
      [id]
    );

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

    const result = await pool.query(
      `
      DELETE FROM TaskProgress
      WHERE "ProgressID" = $1
      `,
      [id]
    );

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