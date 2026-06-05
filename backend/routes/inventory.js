const express = require("express");
const router = express.Router();
const pool = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all inventory records
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM Inventory
    `);

    res.json(result.rows);
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

    const result = await pool.query(
      `
      SELECT
        i."UserID",
        i."ItemID",
        i."Quantity",
        i."isEquipped",
        i."purchasedAt",
        s."ItemName",
        s."ItemType",
        s."Price"
      FROM Inventory i
      JOIN Store s
        ON i."ItemID" = s."ItemID"
      WHERE i."UserID" = $1
      `,
      [userID]
    );

    res.json(result.rows);
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

    // Check if item exists
    const itemCheck = await pool.query(
      `
      SELECT "ItemID"
      FROM Store
      WHERE "ItemID" = $1
      `,
      [ItemID]
    );

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({
        error: "Store item does not exist"
      });
    }

    // Check if user already owns item
    const existingItem = await pool.query(
      `
      SELECT *
      FROM Inventory
      WHERE "UserID" = $1
        AND "ItemID" = $2
      `,
      [UserID, ItemID]
    );

    if (existingItem.rows.length > 0) {
      await pool.query(
        `
        UPDATE Inventory
        SET "Quantity" = "Quantity" + $1
        WHERE "UserID" = $2
          AND "ItemID" = $3
        `,
        [Quantity || 1, UserID, ItemID]
      );

      return res.status(200).json({
        message: "Inventory quantity updated successfully"
      });
    }

    await pool.query(
      `
      INSERT INTO Inventory
      ("UserID", "ItemID", "Quantity", "isEquipped", "purchasedAt")
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      `,
      [
        UserID,
        ItemID,
        Quantity || 1,
        isEquipped || false
      ]
    );

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

    const result = await pool.query(
      `
      UPDATE Inventory
      SET "Quantity" = $1,
          "isEquipped" = $2
      WHERE "UserID" = $3
        AND "ItemID" = $4
      `,
      [
        Quantity,
        isEquipped,
        userID,
        itemID
      ]
    );

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

    const result = await pool.query(
      `
      DELETE FROM Inventory
      WHERE "UserID" = $1
        AND "ItemID" = $2
      `,
      [userID, itemID]
    );

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