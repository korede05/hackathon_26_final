const path = require("path"); 

const express = require("express");
const cors = require("cors");
const { StreamChat } = require("stream-chat");
const dotenv = require("dotenv");

// Now this line will work correctly
dotenv.config({ path: path.join(__dirname, ".env") });
const app = express();

// 1. DYNAMIC CORS CONFIGURATION
// Replace the Netlify URL below with your ACTUAL published Netlify link
app.use(cors({
  origin: [
    "https://brilliant-marshmallow-e77688.netlify.app", 
    "http://localhost:5173"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("❌ Missing STREAM_API_KEY or STREAM_API_SECRET");
  process.exit(1);
}

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

// Endpoint to generate user tokens
app.post("/stream-token", async (req, res) => {
  const { userId, name, image } = req.body;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    await serverClient.upsertUser({
      id: userId,
      name: name || "User",
      image: image || undefined,
    });

    const token = serverClient.createToken(userId);
    return res.json({ token });
  } catch (err) {
    console.error("Token error:", err);
    return res.status(500).json({ error: err.message });
  }
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
    console.error("Upsert error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 2. DYNAMIC PORT BINDING
// Railway injects the PORT variable. We listen on 0.0.0.0 to accept external traffic.
const PORT = process.env.PORT || 3001; 

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Stream token server running on port ${PORT}`);
});