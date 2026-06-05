const express = require("express");
const router = express.Router();
const pool = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all friends
router.get("/", async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT *
      FROM Friends
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get friends",
      error: err.message,
    });
  }
});

// GET friends for one user
router.get("/user/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

    const result = await pool.query(`
        SELECT 
          f.UserID,
          f.FriendID,
          f.isFavorite,
          u.FirstName,
          u.LastName,
          u.Username,
          u.Level,
          u.XP,
          u.Coins
        FROM Friends f
        JOIN Users u
          ON f.FriendID = u.UserID
        WHERE f.UserID = $1
      `, [userID]);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get user's friends",
      error: err.message,
    });
  }
});

// UPDATE favorite status
router.put("/:userID/:friendID/favorite", async (req, res) => {
  try {
    const { userID, friendID } = req.params;
    const { isFavorite } = req.body;

    const result = await pool.query(`
        UPDATE Friends
        SET isFavorite = $1
        WHERE UserID = $2
          AND FriendID = $3
      `, [isFavorite, userID, friendID]);

    if (handleNotFound(result, res, "Friend")) return;

    res.status(200).json({
      message: "Favorite status updated successfully"
    });
  } catch (err) {
    console.error("Error updating favorite status:", err);

    res.status(500).json({
      error: "Failed to update favorite status",
      details: err.message
    });
  }
});

// DELETE friend
router.delete("/:userID/:friendID", async (req, res) => {
  try {
    const { userID, friendID } = req.params;


    const result = await pool.query(`
        DELETE FROM Friends
        WHERE (UserID = $1 AND FriendID = $2)
           OR (UserID = $2 AND FriendID = $1)
      `, [userID, friendID]);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        message: "Friend relationship not found"
      });
    }

    res.status(200).json({
      message: "Friend removed successfully"
    });
  } catch (err) {
    console.error("Error deleting friend:", err);

    res.status(500).json({
      error: "Failed to delete friend",
      details: err.message
    });
  }
});

module.exports = router;