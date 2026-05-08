import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import Author from "../models/author.js";
import Course from "../models/course.js";
import Lesson from "../models/lesson.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const COURSES = [
  {
    course: {
      title: "Python for Beginners — Zero to Hero",
      description:
        "Master Python from scratch. You'll learn variables, loops, functions, OOP, file handling, and build 3 real-world projects. Perfect for anyone with zero coding experience.",
      instructor: "Jacob Jones",
      category: "Development",
      level: "Beginner",
      price: 0,
      durationHours: 42,
    },
    lessons: [
      { title: "Welcome & Course Overview", order: 1, videoUrl: "https://www.youtube.com/embed/kqtD5dpn9C8" },
      { title: "Installing Python & VS Code", order: 2, videoUrl: "https://www.youtube.com/embed/YYXdXT2l-Gg" },
      { title: "Variables, Data Types & Input", order: 3, videoUrl: "https://www.youtube.com/embed/cKPlPJyQrt4" },
      { title: "Conditionals & Loops", order: 4, videoUrl: "https://www.youtube.com/embed/DZwmZ8Usvnk" },
      { title: "Functions & Scope", order: 5, videoUrl: "https://www.youtube.com/embed/9Os0o3wzS_I" },
      { title: "Lists, Tuples & Dictionaries", order: 6, videoUrl: "https://www.youtube.com/embed/W8KRzm-HUcc" },
      { title: "Object-Oriented Programming", order: 7, videoUrl: "https://www.youtube.com/embed/JeznW_7DlB0" },
      { title: "Final Project: Build a To-Do App", order: 8, videoUrl: "https://www.youtube.com/embed/yriw5Zh406s" },
    ],
  },
  {
    course: {
      title: "Full-Stack Web Development Bootcamp",
      description:
        "Learn HTML, CSS, JavaScript, React, Node.js, Express and MongoDB. Build and deploy full-stack web applications from scratch with hands-on projects.",
      instructor: "Sarah Mitchell",
      category: "Development",
      level: "Intermediate",
      price: 49,
      durationHours: 65,
    },
    lessons: [
      { title: "HTML5 Fundamentals", order: 1, videoUrl: "https://www.youtube.com/embed/pQN-pnXPaVg" },
      { title: "CSS3 & Flexbox Layout", order: 2, videoUrl: "https://www.youtube.com/embed/1Rs2ND1ryYc" },
      { title: "JavaScript ES6+ Essentials", order: 3, videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk" },
      { title: "React — Components & Hooks", order: 4, videoUrl: "https://www.youtube.com/embed/w7ejDZ8SWv8" },
      { title: "Node.js & Express REST API", order: 5, videoUrl: "https://www.youtube.com/embed/fBNz5xF-Kx4" },
      { title: "MongoDB & Mongoose", order: 6, videoUrl: "https://www.youtube.com/embed/ExcRbA7fy_A" },
      { title: "Authentication with JWT", order: 7, videoUrl: "https://www.youtube.com/embed/mbsmsi7l3r4" },
      { title: "Deploy to Vercel & Railway", order: 8, videoUrl: "https://www.youtube.com/embed/l134cBAJCuc" },
    ],
  },
  {
    course: {
      title: "UI/UX Design Masterclass",
      description:
        "Learn the complete design process from user research to high-fidelity prototypes using Figma. Covers design thinking, wireframing, typography, color theory, and usability testing.",
      instructor: "Amara Osei",
      category: "Design",
      level: "Beginner",
      price: 29,
      durationHours: 28,
    },
    lessons: [
      { title: "What is UX Design?", order: 1, videoUrl: "https://www.youtube.com/embed/v6n1i0qojws" },
      { title: "Design Thinking Process", order: 2, videoUrl: "https://www.youtube.com/embed/a7sEoEvT8l8" },
      { title: "User Research & Personas", order: 3, videoUrl: "https://www.youtube.com/embed/NoNr94MiXvA" },
      { title: "Wireframing in Figma", order: 4, videoUrl: "https://www.youtube.com/embed/FTFaQWZBqQ8" },
      { title: "Typography & Color Theory", order: 5, videoUrl: "https://www.youtube.com/embed/sByzHoiYFX0" },
      { title: "Prototyping & Interactions", order: 6, videoUrl: "https://www.youtube.com/embed/lTIeZ2ahEkQ" },
      { title: "Usability Testing", order: 7, videoUrl: "https://www.youtube.com/embed/0YL0xoSmyZI" },
    ],
  },
  {
    course: {
      title: "Data Science with Python & Pandas",
      description:
        "Dive into data analysis, visualization, and machine learning using Python. Learn NumPy, Pandas, Matplotlib, Seaborn, and Scikit-learn through real datasets and projects.",
      instructor: "Dr. Lena Hoffmann",
      category: "Data Science",
      level: "Intermediate",
      price: 59,
      durationHours: 38,
    },
    lessons: [
      { title: "Introduction to Data Science", order: 1, videoUrl: "https://www.youtube.com/embed/ua-CiDNNj30" },
      { title: "NumPy Arrays & Operations", order: 2, videoUrl: "https://www.youtube.com/embed/QUT1VHiLmmI" },
      { title: "Pandas DataFrames", order: 3, videoUrl: "https://www.youtube.com/embed/vmEHCJofslg" },
      { title: "Data Cleaning & Preprocessing", order: 4, videoUrl: "https://www.youtube.com/embed/bDhvCp3_lYw" },
      { title: "Data Visualization with Matplotlib", order: 5, videoUrl: "https://www.youtube.com/embed/3Xc3CA655Y4" },
      { title: "Machine Learning with Scikit-learn", order: 6, videoUrl: "https://www.youtube.com/embed/0Lt9w-BxKFQ" },
      { title: "Capstone: Analyze a Real Dataset", order: 7, videoUrl: "https://www.youtube.com/embed/r-uOLxNrNk8" },
    ],
  },
  {
    course: {
      title: "AWS Cloud Practitioner Essentials",
      description:
        "Prepare for the AWS Certified Cloud Practitioner exam. Covers core AWS services, cloud concepts, security, pricing, and the shared responsibility model with practice questions.",
      instructor: "Marcus Webb",
      category: "Cloud",
      level: "Beginner",
      price: 39,
      durationHours: 20,
    },
    lessons: [
      { title: "What is Cloud Computing?", order: 1, videoUrl: "https://www.youtube.com/embed/M988_fsOSWo" },
      { title: "AWS Global Infrastructure", order: 2, videoUrl: "https://www.youtube.com/embed/a9__D53WsUs" },
      { title: "EC2, S3 & Core Services", order: 3, videoUrl: "https://www.youtube.com/embed/ulprqHHWlng" },
      { title: "IAM & Security Best Practices", order: 4, videoUrl: "https://www.youtube.com/embed/iF9fs8Rw4Uo" },
      { title: "Databases on AWS (RDS, DynamoDB)", order: 5, videoUrl: "https://www.youtube.com/embed/uj7Ting6Ckk" },
      { title: "AWS Pricing & Billing", order: 6, videoUrl: "https://www.youtube.com/embed/awBtRoFEJhA" },
      { title: "Practice Exam & Exam Tips", order: 7, videoUrl: "https://www.youtube.com/embed/SOTamWNgDKc" },
    ],
  },
  {
    course: {
      title: "Digital Marketing & SEO Fundamentals",
      description:
        "Learn how to grow a business online through SEO, social media marketing, email campaigns, Google Ads, and analytics. Includes real campaign walkthroughs.",
      instructor: "Priya Sharma",
      category: "Marketing",
      level: "Beginner",
      price: 0,
      durationHours: 18,
    },
    lessons: [
      { title: "Digital Marketing Overview", order: 1, videoUrl: "https://www.youtube.com/embed/bixR-KIJKYM" },
      { title: "SEO Fundamentals & Keyword Research", order: 2, videoUrl: "https://www.youtube.com/embed/DvwS7cV9GmQ" },
      { title: "Content Marketing Strategy", order: 3, videoUrl: "https://www.youtube.com/embed/s9ShggwbgdQ" },
      { title: "Social Media Marketing", order: 4, videoUrl: "https://www.youtube.com/embed/yCOK6p2_Z-4" },
      { title: "Email Marketing Campaigns", order: 5, videoUrl: "https://www.youtube.com/embed/Ks0CVdAFBSM" },
      { title: "Google Ads & PPC", order: 6, videoUrl: "https://www.youtube.com/embed/lD9C2j4pFzk" },
    ],
  },
  {
    course: {
      title: "React & TypeScript — Professional Development",
      description:
        "Build production-grade React applications with TypeScript. Covers advanced hooks, context, React Query, Zustand, testing with Vitest, and CI/CD deployment.",
      instructor: "Carlos Mendez",
      category: "Development",
      level: "Advanced",
      price: 79,
      durationHours: 50,
    },
    lessons: [
      { title: "TypeScript Crash Course for React Devs", order: 1, videoUrl: "https://www.youtube.com/embed/TPACABQTHvM" },
      { title: "Advanced React Hooks", order: 2, videoUrl: "https://www.youtube.com/embed/TNhaISOUy6Q" },
      { title: "State Management with Zustand", order: 3, videoUrl: "https://www.youtube.com/embed/_ngCLZ5Iz-0" },
      { title: "Data Fetching with React Query", order: 4, videoUrl: "https://www.youtube.com/embed/r8Dg0KVnfMA" },
      { title: "Component Testing with Vitest", order: 5, videoUrl: "https://www.youtube.com/embed/7f-71kYhK00" },
      { title: "Performance Optimization", order: 6, videoUrl: "https://www.youtube.com/embed/5fLW5Q5ODiE" },
      { title: "CI/CD with GitHub Actions", order: 7, videoUrl: "https://www.youtube.com/embed/R8_veQiYBjI" },
    ],
  },
  {
    course: {
      title: "Cybersecurity Essentials",
      description:
        "Understand the fundamentals of cybersecurity including network security, ethical hacking basics, cryptography, threat modeling, and how to protect systems from common attacks.",
      instructor: "Nadia Kowalski",
      category: "Security",
      level: "Intermediate",
      price: 49,
      durationHours: 32,
    },
    lessons: [
      { title: "Introduction to Cybersecurity", order: 1, videoUrl: "https://www.youtube.com/embed/inWWhr5tnEA" },
      { title: "Networking Fundamentals for Security", order: 2, videoUrl: "https://www.youtube.com/embed/qiQR5rTSshw" },
      { title: "Common Threats & Attack Vectors", order: 3, videoUrl: "https://www.youtube.com/embed/Dk-ZqQ-bfy4" },
      { title: "Cryptography & Encryption", order: 4, videoUrl: "https://www.youtube.com/embed/AQDCe585Lnc" },
      { title: "Ethical Hacking Basics", order: 5, videoUrl: "https://www.youtube.com/embed/3Kq1MIfTWCE" },
      { title: "Web Application Security (OWASP Top 10)", order: 6, videoUrl: "https://www.youtube.com/embed/rWHvp7rUka8" },
      { title: "Incident Response & Recovery", order: 7, videoUrl: "https://www.youtube.com/embed/s_0GcRGv6Ds" },
    ],
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(process.env.MONGODB_URI);

  // Ensure admin account exists
  const adminEmail = "admin@populoushr.com";
  const adminPassword = "Admin123!";
  let admin = await Author.findOne({ email: adminEmail });
  if (!admin) {
    admin = await Author.create({
      Fullname: "Admin User",
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      role: "admin",
    });
    console.log(`✓ Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    // Make sure existing admin has correct role
    if (admin.role !== "admin") {
      admin.role = "admin";
      await admin.save();
    }
    console.log(`✓ Admin already exists: ${adminEmail}`);
  }

  // Wipe existing courses and lessons for a clean seed
  const existingCount = await Course.countDocuments();
  if (existingCount > 0) {
    await Lesson.deleteMany({});
    await Course.deleteMany({});
    console.log(`✓ Cleared ${existingCount} existing courses`);
  }

  // Insert all courses and lessons
  for (const { course, lessons } of COURSES) {
    const created = await Course.create(course);
    await Lesson.insertMany(lessons.map((l) => ({ ...l, courseId: created._id })));
    console.log(`✓ Created: "${course.title}" (${lessons.length} lessons)`);
  }

  console.log(`\n🎉 Seed complete — ${COURSES.length} courses inserted.`);
  console.log(`\nAdmin login: ${adminEmail} / ${adminPassword}`);
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
