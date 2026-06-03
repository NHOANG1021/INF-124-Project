const express = require("express");
const router = express.Router();
const sql = require("mssql/msnodesqlv8");
const { connectDB } = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all user achievements
router.get("/", async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT *
      FROM UserAchievements
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get user achievements",
      error: err.message,
    });
  }
});

// GET achievements for one user
router.get("/user/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .query(`
        SELECT 
          ua.UserID,
          ua.AchievementID,
          ua.Unlocked_At,
          a.AchievementName,
          a.Description,
          a.XpReward,
          a.CoinReward
        FROM UserAchievements ua
        JOIN Achievements a
          ON ua.AchievementID = a.AchievementID
        WHERE ua.UserID = @UserID
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get achievements for user",
      error: err.message,
    });
  }
});

// POST give achievement to user
router.post("/", async (req, res) => {
  try {
    const { UserID, AchievementID } = req.body;

    if (!UserID || !AchievementID) {
      return res.status(400).json({
        error: "UserID and AchievementID are required"
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

    // Check if achievement exists and get rewards
    const achievementCheck = await pool.request()
      .input("AchievementID", sql.Int, AchievementID)
      .query(`
        SELECT AchievementID, XpReward, CoinReward
        FROM Achievements
        WHERE AchievementID = @AchievementID
      `);

    if (achievementCheck.recordset.length === 0) {
      return res.status(404).json({
        error: "Achievement does not exist"
      });
    }

    const achievement = achievementCheck.recordset[0];

    // Check if user already unlocked this achievement
    const existingAchievement = await pool.request()
      .input("UserID", sql.Int, UserID)
      .input("AchievementID", sql.Int, AchievementID)
      .query(`
        SELECT *
        FROM UserAchievements
        WHERE UserID = @UserID
          AND AchievementID = @AchievementID
      `);

    if (existingAchievement.recordset.length > 0) {
      return res.status(409).json({
        error: "User already unlocked this achievement"
      });
    }

    // Add achievement to user
    await pool.request()
      .input("UserID", sql.Int, UserID)
      .input("AchievementID", sql.Int, AchievementID)
      .query(`
        INSERT INTO UserAchievements
        (UserID, AchievementID, Unlocked_At)
        VALUES
        (@UserID, @AchievementID, GETDATE())
      `);

    // Give achievement rewards to user
    await pool.request()
      .input("UserID", sql.Int, UserID)
      .input("XpReward", sql.Int, achievement.XpReward)
      .input("CoinReward", sql.Int, achievement.CoinReward)
      .query(`
        UPDATE Users
        SET XP = XP + @XpReward,
            Coins = Coins + @CoinReward,
            Updated_At = GETDATE()
        WHERE UserID = @UserID
      `);

    res.status(201).json({
      message: "Achievement unlocked successfully",
      reward: {
        XpReward: achievement.XpReward,
        CoinReward: achievement.CoinReward
      }
    });
  } catch (err) {
    console.error("Error unlocking achievement:", err);

    res.status(500).json({
      error: "Failed to unlock achievement",
      details: err.message
    });
  }
});

// DELETE user achievement
router.delete("/:userID/:achievementID", async (req, res) => {
  try {
    const { userID, achievementID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .input("AchievementID", sql.Int, achievementID)
      .query(`
        DELETE FROM UserAchievements
        WHERE UserID = @UserID
          AND AchievementID = @AchievementID
      `);

    if (handleNotFound(result, res, "User achievement")) return;

    res.status(200).json({
      message: "User achievement removed successfully"
    });
  } catch (err) {
    console.error("Error deleting user achievement:", err);

    res.status(500).json({
      error: "Failed to delete user achievement",
      details: err.message
    });
  }
});

module.exports = router;