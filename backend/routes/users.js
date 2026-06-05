const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const handleNotFound = require("./utils/handleNotFound");

// GET all User profiles
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM Users
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get users",
      error: err.message,
    });
  }
});

// INSERT New User profile
router.post("/", async (req, res) => {
  try {
    const {
      FirstName,
      LastName,
      Email,
      Username,
      Password,
      Bio
    } = req.body;

    if (!FirstName || !LastName || !Email || !Username || !Password) {
      return res.status(400).json({
        error: "FirstName, LastName, Email, Username, and Password are required"
      });
    }

    const PasswordHash = await bcrypt.hash(Password, 10);

    await pool.query(
      `
      INSERT INTO Users
      (
        "FirstName",
        "LastName",
        "Email",
        "Username",
        "PasswordHash",
        "Bio"
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        FirstName,
        LastName,
        Email,
        Username,
        PasswordHash,
        Bio || null
      ]
    );

    res.status(201).json({
      message: "User added successfully"
    });

  } catch (err) {
    console.error("Error adding user:", err);

    res.status(500).json({
      error: "Failed to add user",
      details: err.message
    });
  }
});

// DELETE User profile
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM Users
      WHERE "UserID" = $1
      `,
      [id]
    );

    if (handleNotFound(result, res, "User")) return;

    res.json({
      message: "User deleted successfully"
    });

  } catch (err) {
    console.error("Error deleting User:", err);

    res.status(500).json({
      error: "Failed to delete User",
      details: err.message
    });
  }
});

// UPDATE User profile
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      FirstName,
      LastName,
      Email,
      Username,
      Password,
      Bio
    } = req.body;

    if (!FirstName || !LastName || !Email || !Username) {
      return res.status(400).json({
        error: "FirstName, LastName, Email, and Username are required"
      });
    }

    let result;

    if (Password && Password.trim() !== "") {
      const PasswordHash = await bcrypt.hash(Password, 10);

      result = await pool.query(
        `
        UPDATE Users
        SET "FirstName" = $1,
            "LastName" = $2,
            "Email" = $3,
            "Username" = $4,
            "PasswordHash" = $5,
            "Bio" = $6,
            "Updated_At" = CURRENT_TIMESTAMP
        WHERE "UserID" = $7
        `,
        [
          FirstName,
          LastName,
          Email,
          Username,
          PasswordHash,
          Bio || null,
          id
        ]
      );

    } else {
      result = await pool.query(
        `
        UPDATE Users
        SET "FirstName" = $1,
            "LastName" = $2,
            "Email" = $3,
            "Username" = $4,
            "Bio" = $5,
            "Updated_At" = CURRENT_TIMESTAMP
        WHERE "UserID" = $6
        `,
        [
          FirstName,
          LastName,
          Email,
          Username,
          Bio || null,
          id
        ]
      );
    }

    if (handleNotFound(result, res, "User")) return;

    res.status(200).json({
      message: "User updated successfully"
    });

  } catch (err) {
    console.error("Error updating User:", err);

    res.status(500).json({
      error: "Failed to update User",
      details: err.message
    });
  }
});

module.exports = router;