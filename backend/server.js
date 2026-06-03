const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");
const usersRoutes = require("./routes/users");
const storeRoutes = require("./routes/store");
const taskRoutes = require("./routes/task");
const achievementsRoutes = require("./routes/achievements");
const friendsRoutes = require("./routes/friends");
const friendRequestRoutes = require("./routes/friendRequests");
const notificationRoutes = require("./routes/notification");



const app = express();
const PORT = 3000;

// Middleware

app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("GameTask backend is running");
});

app.get("/api/test-db", async (req, res) => {
  try {
    const pool = await connectDB();

    const result = await pool.request().query(`
      SELECT name 
      FROM sys.tables
    `);

    res.json({
      message: "Database connected successfully",
      tables: result.recordset,
    });
  } catch (err) {
    res.status(500).json({
      message: "Database connection failed",
      error: err.message,
    });
  }
});


app.use("/api/users", usersRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/achievements", achievementsRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/friendRequests", friendRequestRoutes);
app.use("/api/notification", notificationRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

