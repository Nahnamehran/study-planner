import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect("mongodb+srv://nahnamehran:nahna%40db@cluster0.jtdevz9.mongodb.net/?appName=Cluster0")
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

// Mongoose Schema Definitions
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'student' }
});
const User = mongoose.model('User', UserSchema);

const StudyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  syllabus: String,
  examDate: String,
  availableTime: String,
  schedule: Object, // To store AI response
  createdAt: { type: Date, default: Date.now }
});
const StudyPlan = mongoose.model('StudyPlan', StudyPlanSchema);

// API Routes
app.get("/", (req, res) => {
  res.send("Study Planner API running");
});

// 1. Register User or Login if exists
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, role } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, role });
      await user.save();
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Generate Study Plan (Groq AI)
app.post("/api/plan", async (req, res) => {
  try {
    const { userId, syllabus, examDate, availableTime } = req.body;

    // Initialize Groq
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "Groq API Key is missing" });
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `
      You are an expert study planner. Create a detailed, day-by-day study schedule for a student.
      
      **Inputs:**
      - Syllabus: ${syllabus}
      - Exam Date: ${examDate}
      - Available Time Daily: ${availableTime}
      - Today's Date: ${new Date().toISOString().split('T')[0]}

      **Requirements:**
      1. Distribute all syllabus topics evenly across the available days.
      2. Include manageable study sessions each day with time suggested for each topic.
      3. Add short breaks and periodic review/revision sessions.
      4. Prioritize difficult topics earlier and balance study load.
      5. Include a "motivational_tips" array with 3-5 short, punchy tips.

      **Output Format:**
      Return ONLY a raw JSON object (no markdown, no backticks, no explanatory text) with this structure:
      {
        "plan": [
          {
            "day": "Day 1",
            "date": "YYYY-MM-DD",
            "activities": [
              { "type": "Topic", "text": "Topic Name — X hours" },
              { "type": "Revision", "text": "Topic Name — Y hours" },
              { "type": "Break", "text": "Short Break — 15 mins" }
            ]
          },
          ...
        ],
        "motivational_tips": [
          "Tip 1...",
          "Tip 2..."
        ]
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        {
          "role": "user",
          "content": prompt
        }
      ],
      "model": "moonshotai/kimi-k2-instruct-0905",
      "temperature": 0.6,
      "max_completion_tokens": 4096,
      "top_p": 1,
      "stream": false,
      "stop": null
    });

    const text = chatCompletion.choices[0]?.message?.content || "";

    // Clean up markdown if present
    const jsonString = text.replace(/```json|```/g, '').trim();
    let scheduleData;
    try {
      scheduleData = JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON Parse Error:", e, "Raw Text:", text);
      return res.status(500).json({ error: "Failed to parse AI response. Try again." });
    }

    const newPlan = new StudyPlan({
      userId,
      syllabus,
      examDate,
      availableTime,
      schedule: scheduleData
    });

    await newPlan.save();
    res.status(200).json({ message: "Plan generated!", plan: newPlan });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate plan" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
