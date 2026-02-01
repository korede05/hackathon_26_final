const path = require("path");
const express = require("express");
const cors = require("cors");
const { StreamChat } = require("stream-chat");
const dotenv = require("dotenv");

// Load ONLY the server env file
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("❌ Missing STREAM_API_KEY or STREAM_API_SECRET in server/.env");
  console.error("   Make sure you created hackathon_26/server/.env and put keys inside.");
  process.exit(1);
}

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

app.post("/stream-token", async (req, res) => {
  const { userId, name, image } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  await serverClient.upsertUser({
    id: userId,
    name: name || "User",
    image: image || undefined,
  });

  const token = serverClient.createToken(userId);
  return res.json({ token });
});

// Endpoint to ensure a user exists in Stream before creating DM channels
app.post("/ensure-user", async (req, res) => {
  const { userId, name, image } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    await serverClient.upsertUser({
      id: userId,
      name: name || "User",
      image: image || undefined,
    });
    return res.json({ success: true });
  } catch (err) {
    console.error("Failed to ensure user:", err);
    return res.status(500).json({ error: "Failed to create user" });
  }
});
app.post("/ensure-user", async (req, res) => {
  const { userId, name, image } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    // This creates the user in Stream's database so they can be added to channels
    await serverClient.upsertUser({
      id: userId,
      name: name || "User",
      image: image || undefined,
    });
    return res.json({ success: true });
  } catch (err) {
    console.error("Upsert error:", err);
    return res.status(500).json({ error: err.message });
  }
});
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`✅ Stream token server running on http://localhost:${PORT}`);
});