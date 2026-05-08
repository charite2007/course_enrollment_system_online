import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const emailToPromote = process.argv[2];
if (!emailToPromote) {
  console.error('Usage: node scripts/makeAdmin.js <email>');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const Author = mongoose.model('Author', new mongoose.Schema({
  Fullname: String, email: String, role: String, password: String
}));

const user = await Author.findOneAndUpdate(
  { email: emailToPromote },
  { role: 'admin' },
  { new: true }
);

if (!user) {
  console.error(`No user found with email: ${emailToPromote}`);
} else {
  console.log(`✓ ${user.Fullname} (${user.email}) is now role: ${user.role}`);
}

await mongoose.disconnect();
