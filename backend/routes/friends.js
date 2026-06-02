const express = require("express");
const router = express.Router();
const { connectDB } = require("../db");

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
      message: "Failed to get users",
      error: err.message,
    });
  }
});

module.exports = router;