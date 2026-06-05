const express = require("express");
const router = express.Router();
const pool = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all task schedules
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ts."ScheduleID",
        ts."TaskID",
        ts."UserID",
        ts."ScheduleDate",
        ts."DayofWeekID",
        ts."Created_At",
        t."Title",
        d."Day"
      FROM TaskSchedules ts
      JOIN Task t
        ON ts."TaskID" = t."TaskID"
      JOIN DayOfWeek d
        ON ts."DayofWeekID" = d."DayID"
      ORDER BY ts."ScheduleDate" ASC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get task schedules",
      error: err.message,
    });
  }
});

// GET schedules for one user
router.get("/user/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

    const result = await pool.query(
      `
      SELECT
        ts."ScheduleID",
        ts."TaskID",
        ts."UserID",
        ts."ScheduleDate",
        ts."DayofWeekID",
        ts."Created_At",
        t."Title",
        t."IsCompleted",
        t."DueDate",
        d."Day"
      FROM TaskSchedules ts
      JOIN Task t
        ON ts."TaskID" = t."TaskID"
      JOIN DayOfWeek d
        ON ts."DayofWeekID" = d."DayID"
      WHERE ts."UserID" = $1
      ORDER BY ts."ScheduleDate" ASC
      `,
      [userID]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get schedules for user",
      error: err.message,
    });
  }
});

// GET schedules for one task
router.get("/task/:taskID", async (req, res) => {
  try {
    const { taskID } = req.params;

    const result = await pool.query(
      `
      SELECT
        ts."ScheduleID",
        ts."TaskID",
        ts."UserID",
        ts."ScheduleDate",
        ts."DayofWeekID",
        ts."Created_At",
        t."Title",
        d."Day"
      FROM TaskSchedules ts
      JOIN Task t
        ON ts."TaskID" = t."TaskID"
      JOIN DayOfWeek d
        ON ts."DayofWeekID" = d."DayID"
      WHERE ts."TaskID" = $1
      ORDER BY ts."ScheduleDate" ASC
      `,
      [taskID]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get schedules for task",
      error: err.message,
    });
  }
});

// POST create task schedule
router.post("/", async (req, res) => {
  try {
    const { TaskID, UserID, ScheduleDate, DayofWeekID } = req.body;

    if (!TaskID || !UserID || !ScheduleDate || !DayofWeekID) {
      return res.status(400).json({
        error: "TaskID, UserID, ScheduleDate, and DayofWeekID are required"
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

    const dayCheck = await pool.query(
      `
      SELECT "DayID"
      FROM DayOfWeek
      WHERE "DayID" = $1
      `,
      [DayofWeekID]
    );

    if (dayCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Day of week does not exist"
      });
    }

    await pool.query(
      `
      INSERT INTO TaskSchedules
      (
        "TaskID",
        "UserID",
        "ScheduleDate",
        "DayofWeekID",
        "Created_At"
      )
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      `,
      [
        TaskID,
        UserID,
        ScheduleDate,
        DayofWeekID
      ]
    );

    res.status(201).json({
      message: "Task schedule created successfully"
    });

  } catch (err) {
    console.error("Error creating task schedule:", err);

    res.status(500).json({
      error: "Failed to create task schedule",
      details: err.message
    });
  }
});

// UPDATE task schedule
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { TaskID, UserID, ScheduleDate, DayofWeekID } = req.body;

    if (!TaskID || !UserID || !ScheduleDate || !DayofWeekID) {
      return res.status(400).json({
        error: "TaskID, UserID, ScheduleDate, and DayofWeekID are required"
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

    const dayCheck = await pool.query(
      `
      SELECT "DayID"
      FROM DayOfWeek
      WHERE "DayID" = $1
      `,
      [DayofWeekID]
    );

    if (dayCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Day of week does not exist"
      });
    }

    const result = await pool.query(
      `
      UPDATE TaskSchedules
      SET "TaskID" = $1,
          "UserID" = $2,
          "ScheduleDate" = $3,
          "DayofWeekID" = $4
      WHERE "ScheduleID" = $5
      `,
      [
        TaskID,
        UserID,
        ScheduleDate,
        DayofWeekID,
        id
      ]
    );

    if (handleNotFound(result, res, "Task schedule")) return;

    res.status(200).json({
      message: "Task schedule updated successfully"
    });

  } catch (err) {
    console.error("Error updating task schedule:", err);

    res.status(500).json({
      error: "Failed to update task schedule",
      details: err.message
    });
  }
});

// DELETE task schedule
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM TaskSchedules
      WHERE "ScheduleID" = $1
      `,
      [id]
    );

    if (handleNotFound(result, res, "Task schedule")) return;

    res.status(200).json({
      message: "Task schedule deleted successfully"
    });

  } catch (err) {
    console.error("Error deleting task schedule:", err);

    res.status(500).json({
      error: "Failed to delete task schedule",
      details: err.message
    });
  }
});

module.exports = router;