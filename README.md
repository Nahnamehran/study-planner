Study Planner 🎯

Team Name: Tech Crew
Team Members: Nahna Mehran, Mamo College
Hosted Project Link: https://study-planner-eight-iota.vercel.app/

Project Description

An AI-powered study planner that takes a student’s syllabus, exam date, and available study time to create a personalized day-by-day study schedule. It intelligently distributes topics across the days before the exam, suggests realistic study hours, includes periodic review and breaks, and helps students stay organized and on track with their preparation.

The Problem & Solution

The Problem: Students often struggle with effectively planning their study time and managing academic tasks, which leads to stress, missed deadlines, and poor learning outcomes.

The Solution: Instead of guessing how and when to study, the planner gives students a clear roadmap for every day — a schedule tailored to their pace, ensuring all topics are covered before exams, helping them stay organized, motivated, and in control of their preparation.

Technical Details
Technologies Used

Frontend: React (v19), Vite (v7), CSS (Glassmorphism UI)

AI Integration: Groq SDK (groq-sdk), Cloud-based LLM (Moonshot AI / Kimi)

Backend: Node.js, Express.js

Database: MongoDB, Mongoose

Tools: ESLint, Git

Features

AI-Powered Schedule Generation: Generates a detailed, day-by-day study plan covering all syllabus topics, revision sessions, and breaks based on user's exam date and available hours.

Smart Form Input: Intuitive multi-step form to collect user details, syllabus, and lifestyle preferences (wake/sleep times).

Interactive Timeline: A visual timeline of daily activities with checkboxes to track progress.

Study Reminders: Browser notifications to remind students when a study session is over or a task should be completed.

Motivational Tips: AI-generated daily wisdom to keep students exploring and motivated.

Implementation
Installation

Clone the repository:

git clone https://github.com/YourUsername/studyplanner.git
cd studyplanner


Install Dependencies:

npm install


Environment Setup:
Create a .env file in the root directory and add your Groq API key:

VITE_GROQ_API_KEY=your_groq_api_key_here

Run

Start the Development Server:

npm run dev


The application will be available at http://localhost:5173.

Build for Production:

npm run build
npm run preview

Project Documentation
Screenshots

![](/public/screenshot/Screenshot 2026-02-14 085425.png)
![](/public/screenshot/Screenshot 2026-02-14 085402.png)
![](/public/screenshot/Screenshot 2026-02-14 085318.png)

Diagrams

(Insert Diagrams here)

System Architecture

The current implementation follows a Client-Side AI architecture for immediate responsiveness, with a foundation laid for full-stack expansion.

Frontend (React + Vite): Handles user interaction, form state, and directly interfaces with the Groq AI API for generating schedules. It also manages local notifications and state persistence.

AI Layer (Groq): Processes the syllabus and constraints to return a structured JSON study plan.

Backend (Express + Mongo): Implemented in server.js. Provides endpoints for user registration and server-side plan generation/storage (currently optional as the frontend handles generation locally).

Workflow

User Entry: User enters basic details (Name, Email, Role).

Plan Configuration: User inputs Syllabus, Exam Date, Wake/Sleep times, and Daily Study Hours.

AI Processing: The application sends this data to the AI model via Groq SDK.

Schedule Generation: AI returns a structured JSON plan.

Dashboard: User views the interactive timeline, marks tasks as done, and receives notifications.

API Documentation

(Note: These endpoints are available in the server.js backend implementation)

Base URL: http://localhost:5000

Endpoints
1. Health Check

GET /

Response: "Study Planner API running"

2. Register User

POST /api/register

Body:

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student"
}


Response: User object with ID

3. Generate Plan (Server-Side)

POST /api/plan

Body:

{
  "userId": "UserObjectId",
  "syllabus": "Topics...",
  "examDate": "2024-12-31",
  "availableTime": "5 hours"
}


Response:

{
  "message": "Plan generated!",
  "plan": { ... }
}

AI Tools Used

Tool: Cursor / Groq SDK

Purpose: Accelerated development, boilerplate generation, and core logic for the AI study planning engine.

Prompts Used:

"Create a detailed, day-by-day study schedule for a student... Return ONLY a raw JSON object."

"Include manageable study sessions each day with time suggested for each topic."

"Add short breaks and periodic review/revision sessions."

Team Contributions

Nahna Mehran: Frontend Interface, React Logic

Mamo College: AI Integration, Prompt Engineering

License

This project is licensed under the MIT License.

Made with ❤️ at TinkerHub
