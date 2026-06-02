const express = require("express");
const router = express.Router();
const { connectDB } = require("../db");

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT *
      FROM Task
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get users",
      error: err.message,
    });
  }
});

// POST Task

router.post("/", async (req, res) => {
  try {
    const { AchievementName, Description, XpReward, CoinReward } = req.body;

    const pool = await connectDB();

    await pool.request()
      .input("AchievementName", sql.VarChar, AchievementName)
      .input("Description", sql.VarChar, Description)
      .input("XpReward", sql.Int, XpReward)
      .input("CoinReward", sql.Int, CoinReward)
      .query(`
        INSERT INTO Achievements 
        (AchievementName, Description, XpReward, CoinReward)
        VALUES 
        (@AchievementName, @Description, @XpReward, @CoinReward)
      `);

    res.status(201).json({ message: "Achievement added successfully" });
  } catch (err) {
    console.error("Error adding achievement:", err);
    res.status(500).json({ error: "Failed to add achievement" });
  }
});


module.exports = router;