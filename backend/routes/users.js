const express = require("express");
const router = express.Router();
const db = require("../db"); // Import the MySQL pool
const bcrypt = require("bcrypt");
const handleNotFound = require("./utils/handleNotFound");

// GET all User profiles
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to get users", error: err.message });
  }
});

// INSERT New User profile
router.post("/", async (req, res) => {
  try {
    const { FirstName, LastName, Email, Username, Password, Bio } = req.body;

    if (!FirstName || !LastName || !Email || !Username || !Password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const PasswordHash = await bcrypt.hash(Password, 10);

    const query = `
      INSERT INTO Users (FirstName, LastName, Email, Username, PasswordHash, Bio)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await db.execute(query, [FirstName, LastName, Email, Username, PasswordHash, Bio || null]);

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
    const [result] = await db.execute("DELETE FROM Users WHERE UserID = ?", [id]);

    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting User:", err);
    res.status(500).json({ error: "Failed to delete User" });
  }
});

// UPDATE User profile
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { FirstName, LastName, Email, Username, Password, Bio } = req.body;

    let query, params;
    
    if (Password && Password.trim() !== "") {
      const PasswordHash = await bcrypt.hash(Password, 10);
      query = `UPDATE Users SET FirstName=?, LastName=?, Email=?, Username=?, PasswordHash=?, Bio=?, Updated_at=NOW() WHERE UserID=?`;
      params = [FirstName, LastName, Email, Username, PasswordHash, Bio || null, id];
    } else {
      query = `UPDATE Users SET FirstName=?, LastName=?, Email=?, Username=?, Bio=?, Updated_at=NOW() WHERE UserID=?`;
      params = [FirstName, LastName, Email, Username, Bio || null, id];
    }

    const [result] = await db.execute(query, params);
    
    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating User:", err);
    res.status(500).json({ error: "Failed to update User" });
  }
});

module.exports = router;