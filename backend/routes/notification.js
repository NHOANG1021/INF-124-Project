const express = require("express");
const router = express.Router();
const pool = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all notifications
router.get("/", async (req, res) => {
  try {

    const result = await pool.query(`
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

    res.json(result.rows);
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

    const result = await pool.query(`
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
        WHERE n.UserID = $1
        ORDER BY n.Created_At DESC
      `, [userID]);

    res.json(result.rows);
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

    const result = await pool.query(`
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
        WHERE n.UserID = $1
          AND n.isRead = 0
        ORDER BY n.Created_At DESC
      `, [userID]);

    res.json(result.rows);
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

    // Check if user exists
    const userCheck = await pool.query(`
        SELECT UserID
        FROM Users
        WHERE UserID = $1
      `, [UserID]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        error: "User does not exist"
      });
    }

    // Check if notification type exists
    const typeCheck = await pool.query(`
        SELECT NotificationTypeID
        FROM NotificationType
        WHERE NotificationTypeID = $1
      `, [NotificationTypeID]);

    if (typeCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Notification type does not exist"
      });
    }

    await pool.query(`
        INSERT INTO Notification
        (NotificationTypeID, UserID, Message, isRead, Created_At)
        VALUES
        ($1, $2, $3, $4, GETDATE())
      `, [NotificationTypeID, Message, User, false]);

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


    const result = await pool.query(`
        UPDATE Notification
        SET isRead = 1
        WHERE NotificationID = $1
      `, [notificationID]);

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

    const result = await pool.query(`
        UPDATE Notification
        SET isRead = 1
        WHERE UserID = $1
          AND isRead = 0
      `, [userID]);

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

    const result = await pool.query(`
        DELETE FROM Notification
        WHERE NotificationID = $1
      `, [notificationID]);

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