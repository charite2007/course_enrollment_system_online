import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, default: "" },
    order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

lessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

export default mongoose.model("Lesson", lessonSchema);

