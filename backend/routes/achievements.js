const express = require("express");
const router = express.Router();
const { connectDB } = require("../db");
const sql = require("mssql/msnodesqlv8");
const handleNotFound = require("./utils/handleNotFound");


// GET all Achievements
router.get("/", async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT *
      FROM Achievements
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get users",
      error: err.message,
    });
  }
});

// INSERT New Achievements

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

// DELETE Achievements

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await connectDB();
    
    const result = await pool.request()
      .input("AchievementID", sql.Int, id)
      .query(`
        DELETE FROM Achievements
        WHERE AchievementID = @AchievementID
      `);
    if (handleNotFound(result, res, "Achievement")) return;

    res.json({ message: "Achievement deleted successfully" });
  } catch (err) {
    console.error("Error deleting Achievement:", err);
    res.status(500).json({
      error: "Failed to delete Achievement",
      details: err.message
    });
  }
});

// UPDATE Achievements

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { AchievementName, Description, XpReward, CoinReward } = req.body;
    const pool = await connectDB();

    const result = await pool.request()
      .input("AchievementID", sql.Int, id)
      .input("AchievementName", sql.VarChar, AchievementName)
      .input("Description", sql.VarChar, Description)
      .input("XpReward", sql.Int, XpReward)
      .input("CoinReward", sql.Int, CoinReward)
      .query(`
        UPDATE Achievements 
        SET AchievementName = @AchievementName,
            Description = @Description,
            XpReward = @XpReward,
            CoinReward = @CoinReward
        WHERE AchievementID = @AchievementID 
      `);
    
    if (handleNotFound(result, res, "Achievement")) return;

    res.status(200).json({ message: "Achievement updated successfully" });
  } catch (err) {
    console.error("Error updating achievement:", err);
    res.status(500).json({
      error: "Failed to update achievement",
      details: err.message
    });
  }
});

module.exports = router;