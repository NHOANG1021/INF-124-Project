const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET global leaderboard
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        userid,
        username,
        xp,
        FLOOR(xp / 100) + 1 AS level
      FROM users
      ORDER BY xp DESC, username ASC
      LIMIT 100
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error getting leaderboard:", err);

    res.status(500).json({
      message: "Failed to get leaderboard",
      error: err.message,
    });
  }
});

module.exports = router;