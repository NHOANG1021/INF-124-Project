const express = require("express");
const router = express.Router();
const pool = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all friend requests
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM FriendRequests
    `);

    res.json(result.rows);
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


    const result = await pool.query(`
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
        WHERE fr.ReceiverID = $1
       `, [userID]
      );

    res.json(result.rows);
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

    const result = await pool.query(`
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
        WHERE fr.SenderID = $1
      `, [userID]);

    res.json(result.rows);
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

    // Check if they are already friends
    const existingFriend = await pool.query(`
        SELECT *
        FROM Friends
        WHERE (UserID = $1 AND FriendID = $2)
           OR (UserID = $2 AND FriendID = $1)
      `, [SenderID, ReceiverID]);

    if (existingFriend.rows.length > 0) {
      return res.status(409).json({
        error: "Users are already friends"
      });
    }

    // Check if user exists
    const usersCheck = await pool.query(`
        SELECT *
        FROM Users
        WHERE UserID = $1
           OR UserID = $2
      `, [SenderID, ReceiverID]);

    if (usersCheck.rows.length < 2) {
    return res.status(404).json({
        error: "Sender or receiver user does not exist"
    });
    }

    // Check if request already exists
    const existingRequest = await pool.query(`
        SELECT *
        FROM FriendRequests
        WHERE Status = 0
          AND (
            (SenderID = $1 AND ReceiverID = $2)
            OR
            (SenderID = $2 AND ReceiverID = $1)
          )
      `, [SenderID, ReceiverID]);

    if (existingRequest.rows.length > 0) {
      return res.status(409).json({
        error: "A pending friend request already exists"
      });
    }

    await pool.query(`
            INSERT INTO FriendRequests
            (SenderID, ReceiverID, Status)
            VALUES
            ($1, $2, $3)
        `, [SenderID, ReceiverID, 0]);

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

    const requestResult = await pool.query(`
        SELECT *
        FROM FriendRequests
        WHERE RequestID = $1
          AND Status = 0
      `, [requestID]);

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        message: "Pending friend request not found"
      });
    }

    const friendRequest = requestResult.rows[0];
    const SenderID = friendRequest.SenderID;
    const ReceiverID = friendRequest.ReceiverID;

    // Update request status
    await pool.query(`
        UPDATE FriendRequests
        SET Status = 1,
            Updated_At = GETDATE()
        WHERE RequestID = $1
      `, [requestID]);

    // Add both directions to Friends table
    await pool.query(`
        IF NOT EXISTS (
          SELECT 1 FROM Friends
          WHERE UserID = $1 AND FriendID = $2
        )
        BEGIN
          INSERT INTO Friends (UserID, FriendID, isFavorite)
          VALUES ($1, $2, $3)
        END
      `, [SenderID, ReceiverID, false]);

    await pool.query(`
        IF NOT EXISTS (
          SELECT 1 FROM Friends
          WHERE UserID = $1 AND FriendID = $2
        )
        BEGIN
          INSERT INTO Friends (UserID, FriendID, isFavorite)
          VALUES ($1, $2, $3)
        END
      `, [ReceiverID, SenderID, false]);

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

    const result = await pool.query(`
        UPDATE FriendRequests
        SET Status = 2,
            Updated_At = GETDATE()
        WHERE RequestID = $1
          AND Status = 0
      `, [requestID]);

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


    const result = await pool.query(`
        DELETE FROM FriendRequests
        WHERE RequestID = $1
      `, [requestID]);

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