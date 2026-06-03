const express = require("express");
const router = express.Router();
const sql = require("mssql/msnodesqlv8");
const { connectDB } = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all friend requests
router.get("/", async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT *
      FROM FriendRequests
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get friend requests",
      error: err.message,
    });
  }
});

// GET received friend requests for one user
router.get("/received/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("ReceiverID", sql.Int, userID)
      .query(`
        SELECT 
          fr.RequestID,
          fr.SenderID,
          fr.ReceiverID,
          fr.Status,
          fr.Created_At,
          fr.Updated_At,
          u.FirstName,
          u.LastName,
          u.Username
        FROM FriendRequests fr
        JOIN Users u
          ON fr.SenderID = u.UserID
        WHERE fr.ReceiverID = @ReceiverID
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get received friend requests",
      error: err.message,
    });
  }
});

// GET sent friend requests for one user
router.get("/sent/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("SenderID", sql.Int, userID)
      .query(`
        SELECT 
          fr.RequestID,
          fr.SenderID,
          fr.ReceiverID,
          fr.Status,
          fr.Created_At,
          fr.Updated_At,
          u.FirstName,
          u.LastName,
          u.Username
        FROM FriendRequests fr
        JOIN Users u
          ON fr.ReceiverID = u.UserID
        WHERE fr.SenderID = @SenderID
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get sent friend requests",
      error: err.message,
    });
  }
});

// POST send friend request
router.post("/", async (req, res) => {
  try {
    const { SenderID, ReceiverID } = req.body;

    if (!SenderID || !ReceiverID) {
      return res.status(400).json({
        error: "SenderID and ReceiverID are required"
      });
    }

    if (SenderID === ReceiverID) {
      return res.status(400).json({
        error: "You cannot send a friend request to yourself"
      });
    }

    const pool = await connectDB();

    // Check if they are already friends
    const existingFriend = await pool.request()
      .input("SenderID", sql.Int, SenderID)
      .input("ReceiverID", sql.Int, ReceiverID)
      .query(`
        SELECT *
        FROM Friends
        WHERE (UserID = @SenderID AND FriendID = @ReceiverID)
           OR (UserID = @ReceiverID AND FriendID = @SenderID)
      `);

    if (existingFriend.recordset.length > 0) {
      return res.status(409).json({
        error: "Users are already friends"
      });
    }

    // Check if user exists
    const usersCheck = await pool.request()
      .input("SenderID", sql.Int, SenderID)
      .input("ReceiverID", sql.Int, ReceiverID)
      .query(`
        SELECT *
        FROM Users
        WHERE UserID = @SenderID
            OR UserID = @ReceiverID
      `);

    if (usersCheck.recordset.length < 2) {
    return res.status(404).json({
        error: "Sender or receiver user does not exist"
    });
    }

    // Check if request already exists
    const existingRequest = await pool.request()
      .input("SenderID", sql.Int, SenderID)
      .input("ReceiverID", sql.Int, ReceiverID)
      .query(`
        SELECT *
        FROM FriendRequests
        WHERE Status = 0
          AND (
            (SenderID = @SenderID AND ReceiverID = @ReceiverID)
            OR
            (SenderID = @ReceiverID AND ReceiverID = @SenderID)
          )
      `);

    if (existingRequest.recordset.length > 0) {
      return res.status(409).json({
        error: "A pending friend request already exists"
      });
    }

    await pool.request()
        .input("SenderID", sql.Int, SenderID)
        .input("ReceiverID", sql.Int, ReceiverID)
        .input("Status", sql.Int, 0)
        .query(`
            INSERT INTO FriendRequests
            (SenderID, ReceiverID, Status)
            VALUES
            (@SenderID, @ReceiverID, @Status)
        `);

    res.status(201).json({
      message: "Friend request sent successfully"
    });
  } catch (err) {
    console.error("Error sending friend request:", err);

    res.status(500).json({
      error: "Failed to send friend request",
      details: err.message
    });
  }
});

// PUT accept friend request
router.put("/:requestID/accept", async (req, res) => {
  try {
    const { requestID } = req.params;

    const pool = await connectDB();

    const requestResult = await pool.request()
      .input("RequestID", sql.Int, requestID)
      .query(`
        SELECT *
        FROM FriendRequests
        WHERE RequestID = @RequestID
          AND Status = 0
      `);

    if (requestResult.recordset.length === 0) {
      return res.status(404).json({
        message: "Pending friend request not found"
      });
    }

    const friendRequest = requestResult.recordset[0];
    const SenderID = friendRequest.SenderID;
    const ReceiverID = friendRequest.ReceiverID;

    // Update request status
    await pool.request()
      .input("RequestID", sql.Int, requestID)
      .query(`
        UPDATE FriendRequests
        SET Status = 1,
            Updated_At = GETDATE()
        WHERE RequestID = @RequestID
      `);

    // Add both directions to Friends table
    await pool.request()
      .input("UserID", sql.Int, SenderID)
      .input("FriendID", sql.Int, ReceiverID)
      .input("isFavorite", sql.Bit, false)
      .query(`
        IF NOT EXISTS (
          SELECT 1 FROM Friends
          WHERE UserID = @UserID AND FriendID = @FriendID
        )
        BEGIN
          INSERT INTO Friends (UserID, FriendID, isFavorite)
          VALUES (@UserID, @FriendID, @isFavorite)
        END
      `);

    await pool.request()
      .input("UserID", sql.Int, ReceiverID)
      .input("FriendID", sql.Int, SenderID)
      .input("isFavorite", sql.Bit, false)
      .query(`
        IF NOT EXISTS (
          SELECT 1 FROM Friends
          WHERE UserID = @UserID AND FriendID = @FriendID
        )
        BEGIN
          INSERT INTO Friends (UserID, FriendID, isFavorite)
          VALUES (@UserID, @FriendID, @isFavorite)
        END
      `);

    res.status(200).json({
      message: "Friend request accepted successfully"
    });
  } catch (err) {
    console.error("Error accepting friend request:", err);

    res.status(500).json({
      error: "Failed to accept friend request",
      details: err.message
    });
  }
});

// PUT reject friend request
router.put("/:requestID/reject", async (req, res) => {
  try {
    const { requestID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("RequestID", sql.Int, requestID)
      .query(`
        UPDATE FriendRequests
        SET Status = 2,
            Updated_At = GETDATE()
        WHERE RequestID = @RequestID
          AND Status = 0
      `);

    if (handleNotFound(result, res, "Pending friend request")) return;

    res.status(200).json({
      message: "Friend request rejected successfully"
    });
  } catch (err) {
    console.error("Error rejecting friend request:", err);

    res.status(500).json({
      error: "Failed to reject friend request",
      details: err.message
    });
  }
});

// DELETE friend request
router.delete("/:requestID", async (req, res) => {
  try {
    const { requestID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("RequestID", sql.Int, requestID)
      .query(`
        DELETE FROM FriendRequests
        WHERE RequestID = @RequestID
      `);

    if (handleNotFound(result, res, "Friend request")) return;

    res.status(200).json({
      message: "Friend request deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting friend request:", err);

    res.status(500).json({
      error: "Failed to delete friend request",
      details: err.message
    });
  }
});

module.exports = router;