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
      FROM users
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get users",
      error: err.message,
    });
  }
});

// GET single user profile
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        userid AS id,
        firstname AS "firstName",
        lastname AS "lastName",
        email,
        username,
        level,
        xp,
        streakcount AS "streakCount",
        coins,
        bio
      FROM users
      WHERE userid = $1
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({
      message: "Failed to get user",
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
      INSERT INTO users
      (
        firstname,
        lastname,
        email,
        username,
        passwordhash,
        bio
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
      DELETE FROM users
      WHERE userid = $1
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
        UPDATE users
        SET firstname = $1,
            lastname = $2,
            email = $3,
            username = $4,
            passwordhash = $5,
            bio = $6,
            updated_at = CURRENT_TIMESTAMP
        WHERE userid = $7
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
        UPDATE users
        SET firstname = $1,
            lastname = $2,
            email = $3,
            username = $4,
            bio = $5,
            updated_at = CURRENT_TIMESTAMP
        WHERE userid = $6
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

// UPDATE user stats
router.patch("/:id/stats", async (req, res) => {
  try {
    const { id } = req.params;
    const { coins, xp } = req.body;

    if (typeof coins !== "number" || typeof xp !== "number") {
      return res.status(400).json({
        error: "coins and xp must both be numbers",
      });
    }

    const normalizedCoins = Math.max(0, Math.floor(coins));
    const normalizedXp = Math.max(0, Math.floor(xp));
    const level = Math.floor(normalizedXp / 100) + 1;

    const result = await pool.query(
      `
      UPDATE users
      SET coins = $1,
          xp = $2,
          level = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE userid = $4
      RETURNING
        userid AS id,
        firstname AS "firstName",
        lastname AS "lastName",
        email,
        username,
        level,
        xp,
        streakcount AS "streakCount",
        coins,
        bio
      `,
      [normalizedCoins, normalizedXp, level, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      message: "User stats updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating user stats:", err);
    return res.status(500).json({
      error: "Failed to update user stats",
      details: err.message,
    });
  }
});

// LOGIN user
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await pool.query(
      `
      SELECT *
      FROM users
      WHERE LOWER(username) = LOWER($1)
         OR LOWER(email) = LOWER($1)
      `,
      [identifier]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid username/email or password"
      });
    }

    const dbUser = user.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      dbUser.passwordhash
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid username/email or password"
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: dbUser.userid,
        username: dbUser.username,
        email: dbUser.email,
        firstName: dbUser.firstname,
        lastName: dbUser.lastname,
        level: dbUser.level,
        xp: dbUser.xp,
        coins: dbUser.coins,
        streakCount: dbUser.streakcount,
        bio: dbUser.bio,
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// CHECK if user exists
router.post("/check-user", async (req, res) => {
  try {
    const { username, email } = req.body;

    const result = await pool.query(
      `
      SELECT username, email
      FROM users
      WHERE LOWER(username) = LOWER($1)
         OR LOWER(email) = LOWER($2)
      `,
      [username, email]
    );

    if (result.rows.length > 0) {
      return res.status(409).json({
        exists: true,
        message: "Username or email already exists",
      });
    }

    return res.status(200).json({
      exists: false,
      message: "Username and email are available",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
    } = req.body;

    const existingUser = await pool.query(
      `
      SELECT 1
      FROM users
      WHERE LOWER(username) = LOWER($1)
         OR LOWER(email) = LOWER($2)
      `,
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "Username or email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users
      (
        firstname,
        lastname,
        username,
        email,
        passwordhash,
        coins,
        xp,
        level,
        streakcount
      )
      VALUES
      (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      )
      RETURNING
        userid AS id,
        firstname AS "firstName",
        lastname AS "lastName",
        username,
        email,
        level,
        xp,
        coins,
        streakcount AS "streakCount",
        bio
      `,
      [
        firstName,
        lastName,
        username,
        email,
        passwordHash,
        1500,
        0,
        1,
        0,
      ]
    );

    return res.status(201).json({
      message: "Account created successfully",
      user: result.rows[0],
    });
  }
  catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

module.exports = router;
