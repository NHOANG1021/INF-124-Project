const express = require("express");
const router = express.Router();
const sql = require("mssql/msnodesqlv8");
const { connectDB } = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all task schedules
router.get("/", async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT 
        ts.ScheduleID,
        ts.TaskID,
        ts.UserID,
        ts.ScheduleDate,
        ts.DayofWeekID,
        ts.Created_At,
        t.Title,
        d.Day
      FROM TaskSchedules ts
      JOIN Task t
        ON ts.TaskID = t.TaskID
      JOIN DayOfWeek d
        ON ts.DayofWeekID = d.DayID
      ORDER BY ts.ScheduleDate ASC
    `);

    res.json(result.recordset);
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

    const pool = await connectDB();

    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .query(`
        SELECT 
          ts.ScheduleID,
          ts.TaskID,
          ts.UserID,
          ts.ScheduleDate,
          ts.DayofWeekID,
          ts.Created_At,
          t.Title,
          t.IsCompleted,
          t.DueDate,
          d.Day
        FROM TaskSchedules ts
        JOIN Task t
          ON ts.TaskID = t.TaskID
        JOIN DayOfWeek d
          ON ts.DayofWeekID = d.DayID
        WHERE ts.UserID = @UserID
        ORDER BY ts.ScheduleDate ASC
      `);

    res.json(result.recordset);
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

    const pool = await connectDB();

    const result = await pool.request()
      .input("TaskID", sql.Int, taskID)
      .query(`
        SELECT 
          ts.ScheduleID,
          ts.TaskID,
          ts.UserID,
          ts.ScheduleDate,
          ts.DayofWeekID,
          ts.Created_At,
          t.Title,
          d.Day
        FROM TaskSchedules ts
        JOIN Task t
          ON ts.TaskID = t.TaskID
        JOIN DayOfWeek d
          ON ts.DayofWeekID = d.DayID
        WHERE ts.TaskID = @TaskID
        ORDER BY ts.ScheduleDate ASC
      `);

    res.json(result.recordset);
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

    // Check if day exists
    const dayCheck = await pool.request()
      .input("DayofWeekID", sql.Int, DayofWeekID)
      .query(`
        SELECT DayID
        FROM DayOfWeek
        WHERE DayID = @DayofWeekID
      `);

    if (dayCheck.recordset.length === 0) {
      return res.status(404).json({
        error: "Day of week does not exist"
      });
    }

    await pool.request()
      .input("TaskID", sql.Int, TaskID)
      .input("UserID", sql.Int, UserID)
      .input("ScheduleDate", sql.Date, ScheduleDate)
      .input("DayofWeekID", sql.Int, DayofWeekID)
      .query(`
        INSERT INTO TaskSchedules
        (TaskID, UserID, ScheduleDate, DayofWeekID, Created_At)
        VALUES
        (@TaskID, @UserID, @ScheduleDate, @DayofWeekID, GETDATE())
      `);

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

    // Check if day exists
    const dayCheck = await pool.request()
      .input("DayofWeekID", sql.Int, DayofWeekID)
      .query(`
        SELECT DayID
        FROM DayOfWeek
        WHERE DayID = @DayofWeekID
      `);

    if (dayCheck.recordset.length === 0) {
      return res.status(404).json({
        error: "Day of week does not exist"
      });
    }

    const result = await pool.request()
      .input("ScheduleID", sql.Int, id)
      .input("TaskID", sql.Int, TaskID)
      .input("UserID", sql.Int, UserID)
      .input("ScheduleDate", sql.Date, ScheduleDate)
      .input("DayofWeekID", sql.Int, DayofWeekID)
      .query(`
        UPDATE TaskSchedules
        SET TaskID = @TaskID,
            UserID = @UserID,
            ScheduleDate = @ScheduleDate,
            DayofWeekID = @DayofWeekID
        WHERE ScheduleID = @ScheduleID
      `);

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

    const pool = await connectDB();

    const result = await pool.request()
      .input("ScheduleID", sql.Int, id)
      .query(`
        DELETE FROM TaskSchedules
        WHERE ScheduleID = @ScheduleID
      `);

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