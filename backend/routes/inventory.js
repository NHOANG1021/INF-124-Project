const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all inventory records
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.userid AS "UserID",
        i.itemid AS "ItemID",
        i.quantity AS "Quantity",
        i.isequipped AS "isEquipped",
        i.purchasedat AS "purchasedAt"
      FROM inventory i
      ORDER BY i.userid, i.itemid
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
        i.userid AS "UserID",
        i.itemid AS "ItemID",
        i.quantity AS "Quantity",
        i.isequipped AS "isEquipped",
        i.purchasedat AS "purchasedAt",
        s.itemname AS "ItemName",
        s.itemtype AS "ItemType",
        s.price AS "Price",
        s.art AS "Art",
        s.description AS "Description"
      FROM inventory i
      JOIN store_items s
        ON i.itemid = s.itemid
      WHERE i.userid = $1
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
      SELECT userid
      FROM users
      WHERE userid = $1
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
      SELECT itemid
      FROM store_items
      WHERE itemid = $1
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
      FROM inventory
      WHERE userid = $1
        AND itemid = $2
      `,
      [UserID, ItemID]
    );

    if (existingItem.rows.length > 0) {
      await pool.query(
        `
        UPDATE inventory
        SET quantity = quantity + $1
        WHERE userid = $2
          AND itemid = $3
        `,
        [Quantity || 1, UserID, ItemID]
      );

      return res.status(200).json({
        message: "Inventory quantity updated successfully"
      });
    }

    await pool.query(
      `
      INSERT INTO inventory
      (userid, itemid, quantity, isequipped, purchasedat)
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
      UPDATE inventory
      SET quantity = $1,
          isequipped = $2
      WHERE userid = $3
        AND itemid = $4
      `,
      [
        Quantity,
        isEquipped,
        userID,
        itemID
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Inventory item not found"
      });
    }

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
      DELETE FROM inventory
      WHERE userid = $1
        AND itemid = $2
      `,
      [userID, itemID]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Inventory item not found"
      });
    }

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
