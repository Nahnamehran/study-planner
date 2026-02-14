import { useState, useEffect } from 'react'
import './App.css'
import Groq from 'groq-sdk';

function App() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    startHour: '08:00', // Default start time
    syllabus: '',
    examDate: '',
    availableTime: '',
    wakeTime: '07:00',
    bedTime: '23:00'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (formData.name && formData.email) {
      setStep(2);
    } else {
      alert("Please fill in your name and email.");
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleDone = async () => {
    if (!formData.syllabus || !formData.examDate) {
      alert("Please provide syllabus and exam date.");
      return;
    }

    setIsLoading(true);
    try {
      // Initialize Groq Client
      const groq = new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const prompt = `
        You are an expert academic planner. Create a neat, focused, and highly effective study schedule for a student.
        
        **User Profile:**
        - Exam Date: ${formData.examDate}
        - Syllabus: ${formData.syllabus}
        - Available Study Hours: ${formData.availableTime}
        - Wake Up Time: ${formData.wakeTime}
        - Bedtime: ${formData.bedTime}

        **Requirements:**
        1. **Full Day Schedule**: Plan the ENTIRE day from Wake Up to Bedtime.
        2. **Include Lifestyle**:
           - **Meals**: Breakfast, Lunch, Dinner (approx 30-45 mins).
           - **Sleep**: Mark start and end of day.
           - **Personal/Relax**: Short blocks for winding down or hobbies.
        3. **Study Blocks**:
           - Insert focused study sessions (45-60 mins) to meet the target of ${formData.availableTime} (or as much as fits).
           - Assign specific topics from the syllabus.
           - Include 10m breaks between study blocks.
           - **Revision**: Dedicate the last study session to revision.
        4. **Day 1 Output**: Detailed timeline for Day 1.

        **Output Format:**
        Return ONLY a raw JSON object with this structure:
        {
          "schedule": [
            {
              "time": "09:00 AM - 10:00 AM",
              "activity": "Study: [Specific Topic]",
              "category": "study",
              "icon": "📚"
            },
            {
              "time": "08:00 AM - 08:30 AM",
              "activity": "Breakfast 🍳",
              "category": "food",
              "icon": "🥐"
            },
            {
              "time": "09:00 AM - 10:00 AM",
              "activity": "Study: [Topic]",
              "category": "study",
              "icon": "📚"
            },
            {
              "time": "10:00 AM - 10:15 AM",
              "activity": "Short Break",
              "category": "break",
              "icon": "☕"
            },
            ...
          ],
          "study_strategy": "Brief, professional advice on how to tackle this syllabus...",
          "motivational_tips": ["Tip 1", "Tip 2"]
        }
        *category options*: 'study', 'break', 'revision', 'food', 'sleep', 'lifestyle'.
      `;

      const chatCompletion = await groq.chat.completions.create({
        "messages": [{ "role": "user", "content": prompt }],
        "model": "moonshotai/kimi-k2-instruct-0905",
        "temperature": 0.6,
        "max_completion_tokens": 4096,
        "top_p": 1,
        "stream": false,
        "stop": null
      });

      const text = chatCompletion.choices[0]?.message?.content || "";
      const jsonString = text.replace(/```json|```/g, '').trim();
      const scheduleData = JSON.parse(jsonString);

      setGeneratedPlan(scheduleData);
      setGeneratedPlan(prevState => ({
        ...prevState,
        schedule: prevState.schedule.map(item => ({ ...item, completed: false }))
      }));
      setStep(3);

    } catch (error) {
      console.error("AI Error:", error);
      alert("Failed to generate plan. Please try again. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStep = (index) => {
    setGeneratedPlan(prev => {
      const newSchedule = [...prev.schedule];
      newSchedule[index].completed = !newSchedule[index].completed;
      return { ...prev, schedule: newSchedule };
    });
  };

  // Reminder System
  useEffect(() => {
    if (!generatedPlan || step !== 3) return;

    // Request notification permission
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      const now = new Date();
      generatedPlan.schedule.forEach((item, index) => {
        if (item.category === 'study' && !item.completed) {
          // Parse time: "09:00 AM - 10:00 AM" -> extract end time
          const timeParts = item.time.split('-');
          if (timeParts.length < 2) return;

          const endTimeStr = timeParts[1].trim();
          const [time, modifier] = endTimeStr.split(' ');
          let [hours, minutes] = time.split(':');

          if (hours === '12') {
            hours = '00';
          }
          if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
          }

          const endTime = new Date();
          endTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);

          // Check if current time is past end time (with 1 min buffer)
          if (now > endTime && now.getTime() - endTime.getTime() < 60000) {
            new Notification("⏰ Study Reminder", {
              body: `You should have finished: ${item.activity}. Mark it as done!`,
              icon: "https://cdn-icons-png.flaticon.com/512/2693/2693507.png"
            });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [generatedPlan, step]);

  return (
    <div className="app-container">
      <div className="glass-card">
        <h1 className="title">STUDY WITH ME</h1>

        {isLoading && <div className="loading-overlay">⏳ building your perfect day...</div>}

        {step === 1 && (
          <div className="form-step fade-in">
            <div className="logo-container">
              <div className="student-logo-placeholder">🎓</div>
            </div>

            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="input-group">
              <label>I am a...</label>
              <select name="role" value={formData.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="worker">Worker</option>
              </select>
            </div>

            <button className="btn-primary" onClick={handleNext} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Next ➝'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="form-step fade-in">
            <div className="input-group">
              <label>Syllabus</label>
              <textarea
                name="syllabus"
                placeholder="Paste your syllabus here..."
                value={formData.syllabus}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="row-group">
              <div className="input-group half">
                <label>Wake Up Time</label>
                <input
                  type="time"
                  name="wakeTime"
                  value={formData.wakeTime}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group half">
                <label>Bedtime</label>
                <input
                  type="time"
                  name="bedTime"
                  value={formData.bedTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row-group">
              <div className="input-group half">
                <label>Exam Date</label>
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Study Hours Target (per day)</label>
              <input
                type="text"
                name="availableTime"
                placeholder="e.g., 6 hours"
                value={formData.availableTime}
                onChange={handleChange}
              />
            </div>

            <div className="button-group">
              <button className="btn-secondary" onClick={handleBack}>Back</button>
              <button className="btn-primary" onClick={handleDone} disabled={isLoading}>
                {isLoading ? 'Generate Plan ✨' : 'Generate Plan ✨'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && generatedPlan && (
          <div className="result-step fade-in">
            <h2>Your Perfect Day 🌅</h2>
            <p className="strategy-text">{generatedPlan.study_strategy}</p>

            <div className="timeline-container">
              {generatedPlan.schedule.map((item, index) => (
                <div key={index} className={`timeline-item category-${item.category} ${item.completed ? 'completed' : ''}`}>
                  <div className="time-col">
                    <span className="time-text">{item.time.split('-')[0]}</span>
                    <div className="line"></div>
                  </div>
                  <div className="card-col">
                    <div className="activity-card" onClick={() => toggleStep(index)}>
                      <div className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={item.completed || false}
                          readOnly
                        />
                        <span className="checkmark"></span>
                      </div>
                      <span className="icon">{item.icon}</span>
                      <div className="content">
                        <h4>{item.activity}</h4>
                        <span className="category-tag">{item.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {generatedPlan.motivational_tips && (
              <div className="motivational-section">
                <h3>💡 Daily Wisdom</h3>
                <ul>
                  {generatedPlan.motivational_tips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            )}

            <button className="btn-secondary" onClick={() => setStep(1)}>Create New Plan</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App
