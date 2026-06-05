const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all store items
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        itemid AS "ItemID",
        itemname AS "ItemName",
        itemtype AS "ItemType",
        price AS "Price",
        art AS "Art",
        description AS "Description"
      FROM store_items
      ORDER BY itemid
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error getting store items:", err);

    res.status(500).json({
      message: "Failed to get store items",
      error: err.message,
    });
  }
});

// POST store item
router.post("/", async (req, res) => {
  try {
    const { ItemName, ItemType, Price, Art, Description } = req.body;

    if (!ItemName || !ItemType || Price == null) {
      return res.status(400).json({
        error: "ItemName, ItemType, and Price are required"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO store_items
      (itemname, itemtype, price, art, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        itemid AS "ItemID",
        itemname AS "ItemName",
        itemtype AS "ItemType",
        price AS "Price",
        art AS "Art",
        description AS "Description"
      `,
      [ItemName, ItemType, Price, Art ?? null, Description ?? null]
    );

    res.status(201).json({
      message: "Store item added successfully",
      item: result.rows[0],
    });

  } catch (err) {
    console.error("Error adding store item:", err);

    res.status(500).json({
      error: "Failed to add store item",
      details: err.message
    });
  }
});

// UPDATE store item
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { ItemName, ItemType, Price, Art, Description } = req.body;

    if (!ItemName || !ItemType || Price == null) {
      return res.status(400).json({
        error: "ItemName, ItemType, and Price are required"
      });
    }

    const result = await pool.query(
      `
      UPDATE store_items
      SET itemname = $1,
          itemtype = $2,
          price = $3,
          art = $4,
          description = $5
      WHERE itemid = $6
      RETURNING
        itemid AS "ItemID",
        itemname AS "ItemName",
        itemtype AS "ItemType",
        price AS "Price",
        art AS "Art",
        description AS "Description"
      `,
      [ItemName, ItemType, Price, Art ?? null, Description ?? null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Store item not found"
      });
    }

    res.status(200).json({
      message: "Store item updated successfully",
      item: result.rows[0],
    });

  } catch (err) {
    console.error("Error updating store item:", err);

    res.status(500).json({
      error: "Failed to update store item",
      details: err.message
    });
  }
});

// DELETE store item
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM store_items
      WHERE itemid = $1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Store item not found"
      });
    }

    res.status(200).json({
      message: "Store item deleted successfully"
    });

  } catch (err) {
    console.error("Error deleting store item:", err);

    res.status(500).json({
      error: "Failed to delete store item",
      details: err.message
    });
  }
});

module.exports = router;
