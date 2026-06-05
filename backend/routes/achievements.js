const express = require("express");
const router = express.Router();
const pool = require("../db");
const handleNotFound = require("./utils/handleNotFound");


// GET all Achievements
router.get("/", async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT *
      FROM Achievements
    `);

    res.json(result.rows);
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


    await pool.query(
      `
        INSERT INTO Achievements 
        (AchievementName, Description, XpReward, CoinReward)
        VALUES 
        ($1, $2, $3, $4)
      `, [AchievementName, Description, XpReward, CoinReward]);

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

    
    const result = await pool.query(`
        DELETE FROM Achievements
        WHERE AchievementID = $1
      `,[id]);
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

    const result = await pool.query(`
        UPDATE Achievements 
        SET AchievementName = $1,
            Description = $2,
            XpReward = $3,
            CoinReward = $4
        WHERE AchievementID = $5
      `, [AchievementName, Description, XpReward, CoinReward, id]);
    
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