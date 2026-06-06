const express = require("express");
const cors = require("cors");
const pool = require("./db");

const usersRoutes = require("./routes/users");
const storeRoutes = require("./routes/store");
const taskRoutes = require("./routes/task");
const taskSchedulesRoutes = require("./routes/taskSchedules");
const taskProgressRoutes = require("./routes/taskProgress");
const achievementsRoutes = require("./routes/achievements");
const userAchievementsRoutes = require("./routes/userAchievements");
const friendsRoutes = require("./routes/friends");
const friendRequestRoutes = require("./routes/friendRequests");
const notificationRoutes = require("./routes/notification");
const inventoryRoutes = require("./routes/inventory");
const leaderboardRoutes = require("./routes/leaderboard");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_ORIGIN,
  process.env.VITE_FRONTEND_ORIGIN,
].filter(Boolean);

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("GameTask backend is running");
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
    `);

    res.json({
      message: "Database connected successfully",
      tables: result.rows,
    });

  } catch (err) {
    res.status(500).json({
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// Routes
app.use("/api/users", usersRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/taskSchedules", taskSchedulesRoutes);
app.use("/api/taskProgress", taskProgressRoutes);
app.use("/api/achievements", achievementsRoutes);
app.use("/api/userAchievements", userAchievementsRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/friendRequests", friendRequestRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/leaderboard", leaderboardRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
