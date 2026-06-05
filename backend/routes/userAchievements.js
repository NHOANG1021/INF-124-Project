const express = require("express");
const router = express.Router();
const pool = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all user achievements
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM UserAchievements
    `);

    res.json(result.rows);
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

    const result = await pool.query(
      `
      SELECT
        ua."UserID",
        ua."AchievementID",
        ua."Unlocked_At",
        a."AchievementName",
        a."Description",
        a."XpReward",
        a."CoinReward"
      FROM UserAchievements ua
      JOIN Achievements a
        ON ua."AchievementID" = a."AchievementID"
      WHERE ua."UserID" = $1
      `,
      [userID]
    );

    res.json(result.rows);
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

    // Check if user exists
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

    // Check if achievement exists
    const achievementCheck = await pool.query(
      `
      SELECT
        "AchievementID",
        "XpReward",
        "CoinReward"
      FROM Achievements
      WHERE "AchievementID" = $1
      `,
      [AchievementID]
    );

    if (achievementCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Achievement does not exist"
      });
    }

    const achievement = achievementCheck.rows[0];

    // Check if already unlocked
    const existingAchievement = await pool.query(
      `
      SELECT *
      FROM UserAchievements
      WHERE "UserID" = $1
        AND "AchievementID" = $2
      `,
      [UserID, AchievementID]
    );

    if (existingAchievement.rows.length > 0) {
      return res.status(409).json({
        error: "User already unlocked this achievement"
      });
    }

    // Add achievement
    await pool.query(
      `
      INSERT INTO UserAchievements
      (
        "UserID",
        "AchievementID",
        "Unlocked_At"
      )
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      `,
      [UserID, AchievementID]
    );

    // Award rewards
    await pool.query(
      `
      UPDATE Users
      SET "XP" = "XP" + $1,
          "Coins" = "Coins" + $2,
          "Updated_At" = CURRENT_TIMESTAMP
      WHERE "UserID" = $3
      `,
      [
        achievement.XpReward,
        achievement.CoinReward,
        UserID
      ]
    );

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

    const result = await pool.query(
      `
      DELETE FROM UserAchievements
      WHERE "UserID" = $1
        AND "AchievementID" = $2
      `,
      [userID, achievementID]
    );

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