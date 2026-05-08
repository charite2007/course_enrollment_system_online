import mongoose from "mongoose";

const authorSchema = new mongoose.Schema(
  {
    Fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    phone: { type: String, default: "" },
    bio: { type: String, default: "" },
    photo: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Author", authorSchema);

