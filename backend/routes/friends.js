const express = require("express");
const router = express.Router();
const sql = require("mssql/msnodesqlv8");
const { connectDB } = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all friends
router.get("/", async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT *
      FROM Friends
    `);

    res.json(result.recordset);
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

    const pool = await connectDB();

    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .query(`
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
        WHERE f.UserID = @UserID
      `);

    res.json(result.recordset);
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

    const pool = await connectDB();

    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .input("FriendID", sql.Int, friendID)
      .input("isFavorite", sql.Bit, isFavorite)
      .query(`
        UPDATE Friends
        SET isFavorite = @isFavorite
        WHERE UserID = @UserID
          AND FriendID = @FriendID
      `);

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

    const pool = await connectDB();

    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .input("FriendID", sql.Int, friendID)
      .query(`
        DELETE FROM Friends
        WHERE (UserID = @UserID AND FriendID = @FriendID)
           OR (UserID = @FriendID AND FriendID = @UserID)
      `);

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