import mongoose from "mongoose";

export default async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    const err = new Error("Missing MONGODB_URI in environment.");
    err.status = 500;
    throw err;
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
}

