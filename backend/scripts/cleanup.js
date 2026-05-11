import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import Enrollment from "../models/enrollment.js";
import Certificate from "../models/certificate.js";
import Author from "../models/author.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

async function cleanup() {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(process.env.MONGODB_URI);

  // Get all valid student IDs
  const validIds = (await Author.find({}, "_id")).map((u) => String(u._id));

  // Delete enrollments where studentId no longer exists
  const enrollmentResult = await Enrollment.deleteMany({
    studentId: { $nin: validIds.map((id) => new mongoose.Types.ObjectId(id)) },
  });

  // Delete certificates where studentId no longer exists
  const certResult = await Certificate.deleteMany({
    studentId: { $nin: validIds.map((id) => new mongoose.Types.ObjectId(id)) },
  });

  console.log(`✓ Removed ${enrollmentResult.deletedCount} orphaned enrollment(s)`);
  console.log(`✓ Removed ${certResult.deletedCount} orphaned certificate(s)`);
}

cleanup()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
