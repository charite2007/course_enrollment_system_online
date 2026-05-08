import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    instructor: { type: String, required: true, trim: true },
    category: { type: String, default: "General", trim: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    price: { type: Number, default: 0 },
    thumbnail: { type: String, default: "" },
    durationHours: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);

