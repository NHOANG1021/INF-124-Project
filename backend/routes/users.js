const express = require("express");
const router = express.Router();
const { connectDB } = require("../db");
const bcrypt = require("bcrypt");
const sql = require("mssql/msnodesqlv8");
const handleNotFound = require("./utils/handleNotFound");


// GET all User profiles
router.get("/", async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT *
      FROM Users
    `);

    res.json(result.recordset);
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
    const { FirstName, LastName, Email, Username, Password, Bio} = req.body;

      if (!FirstName || !LastName || !Email || !Username || !Password) {
      return res.status(400).json({
        error: "FirstName, LastName, Email, Username, and Password are required"
      });
    }
    const PasswordHash = await bcrypt.hash(Password, 10);

    const pool = await connectDB();

    await pool.request()
      .input("FirstName", sql.VarChar, FirstName)
      .input("LastName", sql.VarChar, LastName)
      .input("Email", sql.VarChar, Email)
      .input("Username", sql.VarChar, Username)
      .input("PasswordHash", sql.VarChar, PasswordHash)
      .input("Bio", sql.VarChar, Bio)
      .query(`
        INSERT INTO Users 
        (FirstName, LastName, Email, Username, PasswordHash, Bio)
        VALUES 
        (@FirstName, @LastName, @Email, @Username, @PasswordHash, @Bio)
      `);

    res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ error: "Failed to add user" });
  }
});


// DELETE User profile

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("UserID", sql.Int, id)
      .query(`
        DELETE FROM Users
        WHERE UserID = @UserID
      `);

    if (handleNotFound(result, res, "User")) return;

    res.json({ message: "User deleted successfully" });
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
    const { FirstName, LastName, Email, Username, Password, Bio } = req.body;

    if (!FirstName || !LastName || !Email || !Username) {
      return res.status(400).json({
        error: "FirstName, LastName, Email, and Username are required"
      });
    }

    const pool = await connectDB();

    let result;

    if (Password && Password.trim() !== "") {
      const PasswordHash = await bcrypt.hash(Password, 10);

      result = await pool.request()
        .input("UserID", sql.Int, id)
        .input("FirstName", sql.VarChar, FirstName)
        .input("LastName", sql.VarChar, LastName)
        .input("Email", sql.VarChar, Email)
        .input("Username", sql.VarChar, Username)
        .input("PasswordHash", sql.VarChar, PasswordHash)
        .input("Bio", sql.VarChar, Bio || null)
        .query(`
          UPDATE Users 
          SET FirstName = @FirstName,
              LastName = @LastName,
              Email = @Email,
              Username = @Username,
              PasswordHash = @PasswordHash,
              Bio = @Bio,
              Updated_At = GETDATE()
          WHERE UserID = @UserID
        `);
    } else {
      result = await pool.request()
        .input("UserID", sql.Int, id)
        .input("FirstName", sql.VarChar, FirstName)
        .input("LastName", sql.VarChar, LastName)
        .input("Email", sql.VarChar, Email)
        .input("Username", sql.VarChar, Username)
        .input("Bio", sql.VarChar, Bio || null)
        .query(`
          UPDATE Users 
          SET FirstName = @FirstName,
              LastName = @LastName,
              Email = @Email,
              Username = @Username,
              Bio = @Bio,
              Updated_At = GETDATE()
          WHERE UserID = @UserID
        `);
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