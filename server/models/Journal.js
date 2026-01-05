// models/Journal.js
import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  monthYear: { type: String, required: true }, // Format: "2025-11" (helps in sorting)
  displayMonth: { type: String }, // Format: "NOVEMBER-2025" (for the PDF)
  
  entries: [{
    date: { type: Date, required: true },
    trainNo: { type: String }, // e.g., "11001" or "By Road"
    depTime: { type: String }, // e.g., "05:05"
    arrTime: { type: String }, // e.g., "15:00"
    fromStation: { type: String },
    toStation: { type: String },
    objectOfJourney: { type: String },
    isStay: { type: Boolean, default: false }, // If true, UI can show "Stay at [Station]"
    taRate: { type: Number, default: 1000 }
  }],
  
  status: { type: String, enum: ['Draft', 'Submitted'], default: 'Draft' }
}, { timestamps: true });

// Ensure a user can only have one journal document per month
journalSchema.index({ userId: 1, monthYear: 1 }, { unique: true });

const Journal = mongoose.model('Journals', journalSchema);

export default Journal