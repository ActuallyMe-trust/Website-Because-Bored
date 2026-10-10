const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

/*
 * Serve the frontend because apparently
 * the browser cannot simply figure things out by itself.
 *
 * Vercel does its own weird little server thing,
 * so this is only needed when I'm running everything locally.
 */

if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "../Frontend")));
}

/*
 * Database connection.
 *
 * Local:
 * "Hello MySQL, it's me again."
 *
 * Vercel:
 * "Hello mysterious environment variables,
 * please don't betray me."
 */

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "136816110040",
  database: process.env.DB_NAME || "personal",
});

/*
 * GET COMMENTS
 *
 * Go ask the database what people have been saying.
 * If nobody said anything, congratulations.
 * The guestbook is lonely.
 */

app.get("/api/comments", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, message, date FROM comments ORDER BY date DESC",
    );

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to load comments.",
    });
  }
});

/*
 * POST COMMENT
 *
 * Someone has decided to leave a message.
 * We shall now permanently record their decision.
 */

app.post("/api/comments", async (req, res) => {
  try {
    const { name, message } = req.body;

    /*
     * You cannot enter the guestbook with
     * literally nothing to say.
     *
     * Unfortunately, this does not stop
     * people from saying stupid things.
     */

    if (!name || !message) {
      return res.status(400).json({
        error: "Name and message are required.",
      });
    }

    /*
     * Insert the visitor's message into the database.
     *
     * Yes, this is basically a machine
     * dedicated to remembering nonsense.
     */

    const [result] = await db.query(
      "INSERT INTO comments (name, message) VALUES (?, ?)",
      [name, message],
    );

    /*
     * The database accepted the nonsense.
     * Return the evidence to the browser.
     */

    res.status(201).json({
      id: result.insertId,
      name,
      message,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to submit comment.",
    });
  }
});

/*
 * LOCAL SERVER
 *
 * When I'm testing this on my computer,
 * Node needs to actually listen somewhere.
 *
 * Vercel handles this part itself because apparently
 * it doesn't trust me with a port.
 */

if (!process.env.VERCEL) {
  app.listen(3000, () => {
    console.log("Guestbook API running at http://localhost:3000");
  });
}

/*
 * Give Vercel the Express app.
 *
 * Congratulations, server.
 * You have been outsourced.
 */

module.exports = app;
