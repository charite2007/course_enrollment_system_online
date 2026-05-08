import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

await mongoose.connect(process.env.MONGODB_URI);
const Author = mongoose.model('Author', new mongoose.Schema({ Fullname: String, email: String, role: String, password: String }));
const users = await Author.find({}, 'Fullname email role');
console.log('=== ALL USERS IN DB ===');
users.forEach(u => console.log(`  ${u.email} | role: ${u.role} | name: ${u.Fullname}`));
console.log('=======================');
await mongoose.disconnect();
