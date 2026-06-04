const express = require("express");
const router = express.Router();
const sql = require("mssql/msnodesqlv8");
const { connectDB } = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all inventory records
router.get("/", async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT *
      FROM Inventory
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get inventory",
      error: err.message,
    });
  }
});

// GET inventory for one user
router.get("/user/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .query(`
        SELECT 
          i.UserID,
          i.ItemID,
          i.Quantity,
          i.isEquipped,
          i.purchasedAt,
          s.ItemName,
          s.ItemType,
          s.Price
        FROM Inventory i
        JOIN Store s
          ON i.ItemID = s.ItemID
        WHERE i.UserID = @UserID
      `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get user inventory",
      error: err.message,
    });
  }
});

// POST add item to user's inventory
router.post("/", async (req, res) => {
  try {
    const { UserID, ItemID, Quantity, isEquipped } = req.body;

    if (!UserID || !ItemID) {
      return res.status(400).json({
        error: "UserID and ItemID are required"
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

    // Check if item exists
    const itemCheck = await pool.request()
      .input("ItemID", sql.Int, ItemID)
      .query(`
        SELECT ItemID
        FROM Store
        WHERE ItemID = @ItemID
      `);

    if (itemCheck.recordset.length === 0) {
      return res.status(404).json({
        error: "Store item does not exist"
      });
    }

    // Check if user already has item
    const existingItem = await pool.request()
      .input("UserID", sql.Int, UserID)
      .input("ItemID", sql.Int, ItemID)
      .query(`
        SELECT *
        FROM Inventory
        WHERE UserID = @UserID
          AND ItemID = @ItemID
      `);

    if (existingItem.recordset.length > 0) {
      // If item already exists, increase quantity instead of inserting duplicate row
      await pool.request()
        .input("UserID", sql.Int, UserID)
        .input("ItemID", sql.Int, ItemID)
        .input("Quantity", sql.Int, Quantity || 1)
        .query(`
          UPDATE Inventory
          SET Quantity = Quantity + @Quantity
          WHERE UserID = @UserID
            AND ItemID = @ItemID
        `);

      return res.status(200).json({
        message: "Inventory quantity updated successfully"
      });
    }

    await pool.request()
      .input("UserID", sql.Int, UserID)
      .input("ItemID", sql.Int, ItemID)
      .input("Quantity", sql.Int, Quantity || 1)
      .input("isEquipped", sql.Bit, isEquipped || false)
      .query(`
        INSERT INTO Inventory
        (UserID, ItemID, Quantity, isEquipped, purchasedAt)
        VALUES
        (@UserID, @ItemID, @Quantity, @isEquipped, GETDATE())
      `);

    res.status(201).json({
      message: "Item added to inventory successfully"
    });
  } catch (err) {
    console.error("Error adding item to inventory:", err);

    res.status(500).json({
      error: "Failed to add item to inventory",
      details: err.message
    });
  }
});

// UPDATE inventory item
router.put("/:userID/:itemID", async (req, res) => {
  try {
    const { userID, itemID } = req.params;
    const { Quantity, isEquipped } = req.body;

    if (Quantity == null || isEquipped == null) {
      return res.status(400).json({
        error: "Quantity and isEquipped are required"
      });
    }

    const pool = await connectDB();

    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .input("ItemID", sql.Int, itemID)
      .input("Quantity", sql.Int, Quantity)
      .input("isEquipped", sql.Bit, isEquipped)
      .query(`
        UPDATE Inventory
        SET Quantity = @Quantity,
            isEquipped = @isEquipped
        WHERE UserID = @UserID
          AND ItemID = @ItemID
      `);

    if (handleNotFound(result, res, "Inventory item")) return;

    res.status(200).json({
      message: "Inventory item updated successfully"
    });
  } catch (err) {
    console.error("Error updating inventory item:", err);

    res.status(500).json({
      error: "Failed to update inventory item",
      details: err.message
    });
  }
});

// DELETE inventory item
router.delete("/:userID/:itemID", async (req, res) => {
  try {
    const { userID, itemID } = req.params;

    const pool = await connectDB();

    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .input("ItemID", sql.Int, itemID)
      .query(`
        DELETE FROM Inventory
        WHERE UserID = @UserID
          AND ItemID = @ItemID
      `);

    if (handleNotFound(result, res, "Inventory item")) return;

    res.status(200).json({
      message: "Inventory item deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting inventory item:", err);

    res.status(500).json({
      error: "Failed to delete inventory item",
      details: err.message
    });
  }
});

module.exports = router;