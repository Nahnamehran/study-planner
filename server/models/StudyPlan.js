import mongoose from 'mongoose';

const StudyPlanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    syllabus: { type: String, required: true },
    examDate: { type: Date, required: true },
    availableTime: { type: String, required: true }, // e.g., "2 hours"
    generatedSchedule: { type: Object }, // To store the JSON plan from AI
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('StudyPlan', StudyPlanSchema);
