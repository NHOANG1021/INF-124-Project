const express = require("express");
const router = express.Router();
const sql = require("mssql/msnodesqlv8");
const { connectDB } = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all notifications
router.get("/", async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT 
        n.NotificationID,
        n.NotificationTypeID,
        nt.TypeName,
        n.UserID,
        n.Message,
        n.isRead,
        n.Created_At
      FROM Notification n
      JOIN NotificationType nt
        ON n.NotificationTypeID = nt.NotificationTypeID
      ORDER BY n.Created_At DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get notifications",
      error: err.message,
    });
  }
});

// GET notifications for one user
router.get("/user/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .query(`
        SELECT 
          n.NotificationID,
          n.NotificationTypeID,
          nt.TypeName,
          n.UserID,
          n.Message,
          n.isRead,
          n.Created_At
        FROM Notification n
        JOIN NotificationType nt
          ON n.NotificationTypeID = nt.NotificationTypeID
        WHERE n.UserID = @UserID
        ORDER BY n.Created_At DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get user notifications",
      error: err.message,
    });
  }
});

// GET unread notifications for one user
router.get("/user/:userID/unread", async (req, res) => {
  try {
    const { userID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .query(`
        SELECT 
          n.NotificationID,
          n.NotificationTypeID,
          nt.TypeName,
          n.UserID,
          n.Message,
          n.isRead,
          n.Created_At
        FROM Notification n
        JOIN NotificationType nt
          ON n.NotificationTypeID = nt.NotificationTypeID
        WHERE n.UserID = @UserID
          AND n.isRead = 0
        ORDER BY n.Created_At DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get unread notifications",
      error: err.message,
    });
  }
});

// POST create/send notification to user
router.post("/", async (req, res) => {
  try {
    const { NotificationTypeID, UserID, Message } = req.body;

    if (!NotificationTypeID || !UserID || !Message) {
      return res.status(400).json({
        error: "NotificationTypeID, UserID, and Message are required"
      });
    }

    const pool = await connectDB();

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

    // Check if notification type exists
    const typeCheck = await pool.request()
      .input("NotificationTypeID", sql.Int, NotificationTypeID)
      .query(`
        SELECT NotificationTypeID
        FROM NotificationType
        WHERE NotificationTypeID = @NotificationTypeID
      `);

    if (typeCheck.recordset.length === 0) {
      return res.status(404).json({
        error: "Notification type does not exist"
      });
    }

    await pool.request()
      .input("NotificationTypeID", sql.Int, NotificationTypeID)
      .input("UserID", sql.Int, UserID)
      .input("Message", sql.VarChar, Message)
      .input("isRead", sql.Bit, false)
      .query(`
        INSERT INTO Notification
        (NotificationTypeID, UserID, Message, isRead, Created_At)
        VALUES
        (@NotificationTypeID, @UserID, @Message, @isRead, GETDATE())
      `);

    res.status(201).json({
      message: "Notification sent successfully"
    });
  } catch (err) {
    console.error("Error creating notification:", err);

    res.status(500).json({
      error: "Failed to create notification",
      details: err.message
    });
  }
});

// PUT mark one notification as read
router.put("/:notificationID/read", async (req, res) => {
  try {
    const { notificationID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("NotificationID", sql.Int, notificationID)
      .query(`
        UPDATE Notification
        SET isRead = 1
        WHERE NotificationID = @NotificationID
      `);

    if (handleNotFound(result, res, "Notification")) return;

    res.status(200).json({
      message: "Notification marked as read"
    });
  } catch (err) {
    console.error("Error marking notification as read:", err);

    res.status(500).json({
      error: "Failed to mark notification as read",
      details: err.message
    });
  }
});

// PUT mark all notifications as read for one user
router.put("/user/:userID/read-all", async (req, res) => {
  try {
    const { userID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .query(`
        UPDATE Notification
        SET isRead = 1
        WHERE UserID = @UserID
          AND isRead = 0
      `);

    res.status(200).json({
      message: "All notifications marked as read",
      rowsUpdated: result.rowsAffected[0]
    });
  } catch (err) {
    console.error("Error marking all notifications as read:", err);

    res.status(500).json({
      error: "Failed to mark all notifications as read",
      details: err.message
    });
  }
});

// DELETE notification
router.delete("/:notificationID", async (req, res) => {
  try {
    const { notificationID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("NotificationID", sql.Int, notificationID)
      .query(`
        DELETE FROM Notification
        WHERE NotificationID = @NotificationID
      `);

    if (handleNotFound(result, res, "Notification")) return;

    res.status(200).json({
      message: "Notification deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting notification:", err);

    res.status(500).json({
      error: "Failed to delete notification",
      details: err.message
    });
  }
});

module.exports = router;