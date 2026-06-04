const express = require("express");
const router = express.Router();
const sql = require("mssql/msnodesqlv8");
const { connectDB } = require("../db");
const handleNotFound = require("./utils/handleNotFound");

// GET all store items
router.get("/", async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT
        ItemID,
        ItemName,
        ItemType,
        Price,
        Art,
        Description
      FROM Store
      ORDER BY ItemID
    `);

    res.json(result.recordset);
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

    const pool = await connectDB();

    const result = await pool.request()
      .input("ItemName", sql.VarChar, ItemName)
      .input("ItemType", sql.Int, ItemType)
      .input("Price", sql.Int, Price)
      .input("Art", sql.VarChar, Art ?? null)
      .input("Description", sql.VarChar, Description ?? null)
      .query(`
        INSERT INTO Store
        (ItemName, ItemType, Price, Art, Description)
        OUTPUT INSERTED.ItemID, INSERTED.ItemName, INSERTED.ItemType, INSERTED.Price, INSERTED.Art, INSERTED.Description
        VALUES
        (@ItemName, @ItemType, @Price, @Art, @Description)
      `);

    res.status(201).json({
      message: "Store item added successfully",
      item: result.recordset[0],
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

    const pool = await connectDB();

    const result = await pool.request()
      .input("ItemID", sql.Int, id)
      .input("ItemName", sql.VarChar, ItemName)
      .input("ItemType", sql.Int, ItemType)
      .input("Price", sql.Int, Price)
      .input("Art", sql.VarChar, Art ?? null)
      .input("Description", sql.VarChar, Description ?? null)
      .query(`
        UPDATE Store
        SET ItemName = @ItemName,
            ItemType = @ItemType,
            Price = @Price,
            Art = @Art,
            Description = @Description
        OUTPUT INSERTED.ItemID, INSERTED.ItemName, INSERTED.ItemType, INSERTED.Price, INSERTED.Art, INSERTED.Description
        WHERE ItemID = @ItemID
      `);

    if (handleNotFound(result, res, "Store item")) return;

    res.status(200).json({
      message: "Store item updated successfully",
      item: result.recordset[0],
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

    const pool = await connectDB();

    const result = await pool.request()
      .input("ItemID", sql.Int, id)
      .query(`
        DELETE FROM Store
        WHERE ItemID = @ItemID
      `);

    if (handleNotFound(result, res, "Store item")) return;

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
