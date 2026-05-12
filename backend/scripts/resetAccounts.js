import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import Author from "../models/author.js";
import Enrollment from "../models/enrollment.js";
import Certificate from "../models/certificate.js";
import Message from "../models/message.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

async function resetAccounts() {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(process.env.MONGODB_URI);

  const users        = await Author.deleteMany({});
  const enrollments  = await Enrollment.deleteMany({});
  const certificates = await Certificate.deleteMany({});
  const messages     = await Message.deleteMany({});

  console.log(`✓ Deleted ${users.deletedCount} user(s)`);
  console.log(`✓ Deleted ${enrollments.deletedCount} enrollment(s)`);
  console.log(`✓ Deleted ${certificates.deletedCount} certificate(s)`);
  console.log(`✓ Deleted ${messages.deletedCount} message(s)`);
  console.log("✅ Database reset complete. You can now register fresh accounts.");
}

resetAccounts()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
