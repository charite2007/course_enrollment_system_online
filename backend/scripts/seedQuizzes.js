import dotenv from "dotenv";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import Course from "../models/course.js";
import Lesson from "../models/lesson.js";
import Quiz from "../models/quiz.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

// Quiz questions per lesson title (matched by title keyword)
const QUIZ_DATA = {

  // ── Python for Beginners ─────────────────────────────────────
  "Welcome & Course Overview": [
    { question: "What is Python primarily used for?", options: ["Web design only", "General-purpose programming", "Only data science", "Only game development"], correctIndex: 1 },
    { question: "Python is which type of language?", options: ["Compiled", "Interpreted", "Assembly", "Machine code"], correctIndex: 1 },
  ],
  "Installing Python & VS Code": [
    { question: "Which command checks your Python version in the terminal?", options: ["python --check", "python --version", "py version", "check python"], correctIndex: 1 },
    { question: "What is VS Code?", options: ["A Python library", "A code editor", "A database", "A web browser"], correctIndex: 1 },
  ],
  "Variables, Data Types & Input": [
    { question: "Which of these is a valid Python variable name?", options: ["2name", "my_name", "my-name", "class"], correctIndex: 1 },
    { question: "What function reads user input in Python?", options: ["read()", "scan()", "input()", "get()"], correctIndex: 2 },
    { question: "What data type is the value 3.14?", options: ["int", "str", "float", "bool"], correctIndex: 2 },
  ],
  "Conditionals & Loops": [
    { question: "Which keyword starts a conditional block in Python?", options: ["when", "if", "check", "case"], correctIndex: 1 },
    { question: "What does a 'for' loop iterate over?", options: ["Only numbers", "Only strings", "Any iterable", "Only lists"], correctIndex: 2 },
    { question: "What is the output of: for i in range(3): print(i)?", options: ["1 2 3", "0 1 2", "0 1 2 3", "1 2"], correctIndex: 1 },
  ],
  "Functions & Scope": [
    { question: "Which keyword defines a function in Python?", options: ["func", "function", "def", "define"], correctIndex: 2 },
    { question: "What does 'return' do in a function?", options: ["Prints a value", "Sends a value back to the caller", "Ends the program", "Loops back"], correctIndex: 1 },
  ],
  "Lists, Tuples & Dictionaries": [
    { question: "Which is mutable in Python?", options: ["Tuple", "String", "List", "Integer"], correctIndex: 2 },
    { question: "How do you access a dictionary value by key?", options: ["dict[key]", "dict.get_key()", "dict->key", "dict::key"], correctIndex: 0 },
    { question: "What method adds an item to a list?", options: ["add()", "insert()", "append()", "push()"], correctIndex: 2 },
  ],
  "Object-Oriented Programming": [
    { question: "What keyword creates a class in Python?", options: ["object", "class", "struct", "type"], correctIndex: 1 },
    { question: "What is '__init__' in a Python class?", options: ["A destructor", "A constructor method", "A static method", "A class variable"], correctIndex: 1 },
    { question: "What is inheritance in OOP?", options: ["Copying code", "A class acquiring properties of another", "Deleting a class", "Hiding data"], correctIndex: 1 },
  ],
  "Final Project: Build a To-Do App": [
    { question: "Which Python structure is best for storing a to-do list?", options: ["Dictionary", "List", "Tuple", "Set"], correctIndex: 1 },
    { question: "What does CRUD stand for?", options: ["Create Read Update Delete", "Copy Run Undo Deploy", "Code Run Use Debug", "Create Run Update Deploy"], correctIndex: 0 },
  ],

  // ── Full-Stack Web Development ───────────────────────────────
  "HTML5 Fundamentals": [
    { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Logic", "Home Tool Markup Language"], correctIndex: 0 },
    { question: "Which tag creates a hyperlink?", options: ["<link>", "<href>", "<a>", "<url>"], correctIndex: 2 },
    { question: "Which HTML tag is used for the largest heading?", options: ["<h6>", "<h1>", "<heading>", "<head>"], correctIndex: 1 },
  ],
  "CSS3 & Flexbox Layout": [
    { question: "What does CSS stand for?", options: ["Cascading Style Sheets", "Computer Style System", "Creative Style Syntax", "Coded Style Sheets"], correctIndex: 0 },
    { question: "Which CSS property controls text color?", options: ["font-color", "text-color", "color", "foreground"], correctIndex: 2 },
    { question: "What does 'display: flex' do?", options: ["Hides an element", "Makes element flexible/responsive", "Adds animation", "Changes font size"], correctIndex: 1 },
  ],
  "JavaScript ES6+ Essentials": [
    { question: "Which keyword declares a block-scoped variable in ES6?", options: ["var", "let", "variable", "set"], correctIndex: 1 },
    { question: "What is an arrow function?", options: ["A function with no name", "A shorthand function syntax using =>", "A function that returns arrays", "A loop function"], correctIndex: 1 },
    { question: "What does 'const' mean?", options: ["A variable that can change", "A constant that cannot be reassigned", "A constructor", "A CSS constant"], correctIndex: 1 },
  ],
  "React — Components & Hooks": [
    { question: "What is a React component?", options: ["A CSS file", "A reusable piece of UI", "A database table", "A server route"], correctIndex: 1 },
    { question: "Which hook manages state in a functional component?", options: ["useEffect", "useContext", "useState", "useRef"], correctIndex: 2 },
    { question: "What does JSX stand for?", options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extra"], correctIndex: 0 },
  ],
  "Node.js & Express REST API": [
    { question: "What is Node.js?", options: ["A browser", "A JavaScript runtime on the server", "A CSS framework", "A database"], correctIndex: 1 },
    { question: "Which HTTP method is used to create a resource?", options: ["GET", "DELETE", "POST", "PUT"], correctIndex: 2 },
    { question: "What does REST stand for?", options: ["Remote Execution State Transfer", "Representational State Transfer", "Rapid Endpoint Service Technology", "Resource Exchange Standard Transfer"], correctIndex: 1 },
  ],
  "MongoDB & Mongoose": [
    { question: "MongoDB stores data in what format?", options: ["Tables", "XML files", "JSON-like documents", "CSV files"], correctIndex: 2 },
    { question: "What is Mongoose?", options: ["A MongoDB GUI", "An ODM for MongoDB in Node.js", "A REST framework", "A testing library"], correctIndex: 1 },
  ],
  "Authentication with JWT": [
    { question: "What does JWT stand for?", options: ["Java Web Token", "JSON Web Token", "JavaScript Web Transfer", "JSON Web Transfer"], correctIndex: 1 },
    { question: "Where should JWT tokens be stored securely?", options: ["localStorage", "sessionStorage", "HttpOnly cookie", "URL parameter"], correctIndex: 2 },
  ],
  "Deploy to Vercel & Railway": [
    { question: "What is Vercel primarily used for?", options: ["Backend APIs", "Database hosting", "Frontend deployment", "Email services"], correctIndex: 2 },
    { question: "What file does Vercel use for SPA routing?", options: ["nginx.conf", "vercel.json", "routes.json", "spa.config"], correctIndex: 1 },
  ],

  // ── UI/UX Design ─────────────────────────────────────────────
  "What is UX Design?": [
    { question: "What does UX stand for?", options: ["User Experience", "User Extension", "Unified Experience", "User Execution"], correctIndex: 0 },
    { question: "What is the main goal of UX design?", options: ["Make things look pretty", "Make products useful and enjoyable", "Write code faster", "Reduce server costs"], correctIndex: 1 },
  ],
  "Design Thinking Process": [
    { question: "What is the first stage of Design Thinking?", options: ["Prototype", "Test", "Empathize", "Define"], correctIndex: 2 },
    { question: "How many stages are in the Design Thinking process?", options: ["3", "4", "5", "7"], correctIndex: 2 },
  ],
  "User Research & Personas": [
    { question: "What is a user persona?", options: ["A real user account", "A fictional representation of a target user", "A design template", "A user password"], correctIndex: 1 },
    { question: "Which method involves observing users in their environment?", options: ["Survey", "Ethnographic research", "A/B testing", "Heatmap analysis"], correctIndex: 1 },
  ],
  "Wireframing in Figma": [
    { question: "What is a wireframe?", options: ["A finished design", "A low-fidelity layout sketch", "A color palette", "A font selection"], correctIndex: 1 },
    { question: "Figma is primarily a tool for?", options: ["Video editing", "UI/UX design and prototyping", "Code compilation", "Database management"], correctIndex: 1 },
  ],
  "Typography & Color Theory": [
    { question: "What are complementary colors?", options: ["Colors next to each other on the wheel", "Colors opposite each other on the wheel", "Shades of the same color", "Black and white"], correctIndex: 1 },
    { question: "What is kerning in typography?", options: ["Font weight", "Space between individual characters", "Line height", "Font size"], correctIndex: 1 },
  ],
  "Prototyping & Interactions": [
    { question: "What is a high-fidelity prototype?", options: ["A paper sketch", "A detailed interactive mockup", "A color palette", "A user story"], correctIndex: 1 },
    { question: "What is the purpose of prototyping?", options: ["Final product delivery", "Testing ideas before development", "Writing documentation", "Deploying to production"], correctIndex: 1 },
  ],
  "Usability Testing": [
    { question: "What is usability testing?", options: ["Testing server performance", "Evaluating a product with real users", "Checking code quality", "Testing database queries"], correctIndex: 1 },
    { question: "How many users are typically needed for basic usability testing?", options: ["1", "5", "50", "100"], correctIndex: 1 },
  ],

  // ── Data Science ─────────────────────────────────────────────
  "Introduction to Data Science": [
    { question: "What is data science?", options: ["Only statistics", "Extracting insights from data using various techniques", "Only machine learning", "Only database management"], correctIndex: 1 },
    { question: "Which language is most popular in data science?", options: ["Java", "C++", "Python", "PHP"], correctIndex: 2 },
  ],
  "NumPy Arrays & Operations": [
    { question: "What does NumPy stand for?", options: ["Numerical Python", "New Python", "Number Processing", "Numeric Package"], correctIndex: 0 },
    { question: "How do you create a NumPy array?", options: ["numpy.list()", "np.array()", "np.create()", "numpy.make()"], correctIndex: 1 },
  ],
  "Pandas DataFrames": [
    { question: "What is a Pandas DataFrame?", options: ["A 1D array", "A 2D labeled data structure", "A database", "A chart type"], correctIndex: 1 },
    { question: "Which method shows the first 5 rows of a DataFrame?", options: ["df.top()", "df.first()", "df.head()", "df.show()"], correctIndex: 2 },
  ],
  "Data Cleaning & Preprocessing": [
    { question: "What does df.dropna() do?", options: ["Drops all columns", "Removes rows with missing values", "Fills missing values", "Renames columns"], correctIndex: 1 },
    { question: "What is normalization in data preprocessing?", options: ["Removing duplicates", "Scaling data to a standard range", "Sorting data", "Encoding text"], correctIndex: 1 },
  ],
  "Data Visualization with Matplotlib": [
    { question: "Which function creates a line plot in Matplotlib?", options: ["plt.bar()", "plt.scatter()", "plt.plot()", "plt.pie()"], correctIndex: 2 },
    { question: "What does plt.show() do?", options: ["Saves the plot", "Displays the plot", "Clears the plot", "Exports to PDF"], correctIndex: 1 },
  ],
  "Machine Learning with Scikit-learn": [
    { question: "What is supervised learning?", options: ["Learning without labels", "Learning with labeled training data", "Unsupervised clustering", "Reinforcement learning"], correctIndex: 1 },
    { question: "Which Scikit-learn method trains a model?", options: ["model.train()", "model.fit()", "model.learn()", "model.run()"], correctIndex: 1 },
  ],
  "Capstone: Analyze a Real Dataset": [
    { question: "What is EDA?", options: ["External Data Analysis", "Exploratory Data Analysis", "Extended Data Algorithm", "Encoded Data Array"], correctIndex: 1 },
    { question: "Which metric measures classification accuracy?", options: ["RMSE", "R-squared", "Accuracy score", "Mean absolute error"], correctIndex: 2 },
  ],

  // ── AWS Cloud ────────────────────────────────────────────────
  "What is Cloud Computing?": [
    { question: "What is cloud computing?", options: ["Local server storage", "Delivering computing services over the internet", "A type of weather forecasting", "A programming language"], correctIndex: 1 },
    { question: "Which is NOT a cloud service model?", options: ["IaaS", "PaaS", "SaaS", "DaaS (Desktop as a Service is valid, so: BaaS)"], correctIndex: 3 },
  ],
  "AWS Global Infrastructure": [
    { question: "What is an AWS Region?", options: ["A single data center", "A geographic area with multiple Availability Zones", "A type of EC2 instance", "An IAM policy"], correctIndex: 1 },
    { question: "What is an Availability Zone?", options: ["A billing zone", "One or more discrete data centers in a Region", "A CDN location", "A VPC subnet"], correctIndex: 1 },
  ],
  "EC2, S3 & Core Services": [
    { question: "What does EC2 stand for?", options: ["Elastic Cloud Compute", "Elastic Compute Cloud", "Extended Cloud Computing", "Enterprise Cloud Container"], correctIndex: 1 },
    { question: "What is Amazon S3 used for?", options: ["Running virtual machines", "Object storage", "Relational databases", "DNS management"], correctIndex: 1 },
    { question: "What is an S3 bucket?", options: ["A virtual machine", "A container for storing objects in S3", "A database table", "A network subnet"], correctIndex: 1 },
  ],
  "IAM & Security Best Practices": [
    { question: "What does IAM stand for?", options: ["Internet Access Management", "Identity and Access Management", "Internal Application Monitor", "Integrated API Manager"], correctIndex: 1 },
    { question: "What is the principle of least privilege?", options: ["Give all users admin access", "Grant only the minimum permissions needed", "Never use passwords", "Share credentials between users"], correctIndex: 1 },
  ],
  "Databases on AWS (RDS, DynamoDB)": [
    { question: "What type of database is DynamoDB?", options: ["Relational", "NoSQL", "Graph", "Time-series"], correctIndex: 1 },
    { question: "What does RDS stand for?", options: ["Remote Data Service", "Relational Database Service", "Rapid Deployment System", "Resource Distribution Service"], correctIndex: 1 },
  ],
  "AWS Pricing & Billing": [
    { question: "What is the AWS Free Tier?", options: ["Always free services", "Limited free usage for new accounts", "A paid support plan", "A discount for enterprises"], correctIndex: 1 },
    { question: "Which tool estimates AWS costs before deploying?", options: ["AWS Cost Explorer", "AWS Pricing Calculator", "AWS Budgets", "AWS Trusted Advisor"], correctIndex: 1 },
  ],
  "Practice Exam & Exam Tips": [
    { question: "How many questions are on the AWS Cloud Practitioner exam?", options: ["50", "65", "100", "30"], correctIndex: 1 },
    { question: "What is the passing score for AWS Cloud Practitioner?", options: ["60%", "70%", "75%", "80%"], correctIndex: 1 },
  ],

  // ── Digital Marketing ────────────────────────────────────────
  "Digital Marketing Overview": [
    { question: "What is digital marketing?", options: ["Only social media ads", "Promoting products/services through digital channels", "Only email marketing", "Only SEO"], correctIndex: 1 },
    { question: "Which is NOT a digital marketing channel?", options: ["Social media", "Email", "Billboard", "Search engine"], correctIndex: 2 },
  ],
  "SEO Fundamentals & Keyword Research": [
    { question: "What does SEO stand for?", options: ["Search Engine Optimization", "Social Engagement Online", "Site Engagement Order", "Search Engine Operation"], correctIndex: 0 },
    { question: "What is a keyword in SEO?", options: ["A password", "A word/phrase users search for", "A meta tag", "A backlink"], correctIndex: 1 },
  ],
  "Content Marketing Strategy": [
    { question: "What is the main goal of content marketing?", options: ["Direct selling", "Attracting and engaging audiences with valuable content", "Paid advertising", "Cold calling"], correctIndex: 1 },
    { question: "Which content type has the highest engagement?", options: ["Plain text", "Video", "Spreadsheets", "PDFs"], correctIndex: 1 },
  ],
  "Social Media Marketing": [
    { question: "What is a social media algorithm?", options: ["A hacking tool", "Rules that determine what content users see", "A scheduling tool", "A payment system"], correctIndex: 1 },
    { question: "What does CTR stand for?", options: ["Click Through Rate", "Content Transfer Rate", "Customer Tracking Report", "Channel Traffic Ratio"], correctIndex: 0 },
  ],
  "Email Marketing Campaigns": [
    { question: "What is an email open rate?", options: ["Number of emails sent", "Percentage of recipients who opened the email", "Number of unsubscribes", "Email delivery speed"], correctIndex: 1 },
    { question: "What is A/B testing in email marketing?", options: ["Testing two email servers", "Comparing two versions of an email to see which performs better", "Sending emails to two lists", "Testing email security"], correctIndex: 1 },
  ],
  "Google Ads & PPC": [
    { question: "What does PPC stand for?", options: ["Pay Per Click", "Page Per Customer", "Paid Promotion Campaign", "Product Placement Cost"], correctIndex: 0 },
    { question: "What is Quality Score in Google Ads?", options: ["Your account age", "A metric rating ad relevance and landing page quality", "Your total ad spend", "Number of clicks"], correctIndex: 1 },
  ],

  // ── React & TypeScript ───────────────────────────────────────
  "TypeScript Crash Course for React Devs": [
    { question: "What is TypeScript?", options: ["A new programming language", "A typed superset of JavaScript", "A CSS framework", "A testing library"], correctIndex: 1 },
    { question: "What does the ':string' annotation mean in TypeScript?", options: ["A comment", "The variable must be a string type", "A string method", "A CSS class"], correctIndex: 1 },
  ],
  "Advanced React Hooks": [
    { question: "What does useCallback do?", options: ["Fetches data", "Memoizes a function to prevent unnecessary re-creation", "Creates a ref", "Manages global state"], correctIndex: 1 },
    { question: "When should you use useMemo?", options: ["Always", "When you need to memoize expensive calculations", "For API calls", "For routing"], correctIndex: 1 },
  ],
  "State Management with Zustand": [
    { question: "What is Zustand?", options: ["A CSS library", "A lightweight state management library for React", "A testing framework", "A build tool"], correctIndex: 1 },
    { question: "How do you create a Zustand store?", options: ["new Store()", "create()", "useState()", "createContext()"], correctIndex: 1 },
  ],
  "Data Fetching with React Query": [
    { question: "What is React Query used for?", options: ["Routing", "Server state management and data fetching", "Styling", "Form validation"], correctIndex: 1 },
    { question: "What does the 'staleTime' option control?", options: ["Animation duration", "How long data is considered fresh before refetching", "Cache size", "Request timeout"], correctIndex: 1 },
  ],
  "Component Testing with Vitest": [
    { question: "What is Vitest?", options: ["A React component library", "A fast unit testing framework for Vite projects", "A CSS testing tool", "A browser automation tool"], correctIndex: 1 },
    { question: "What does 'expect(value).toBe(expected)' do?", options: ["Renders a component", "Asserts that value equals expected", "Mocks a function", "Imports a module"], correctIndex: 1 },
  ],
  "Performance Optimization": [
    { question: "What does React.memo do?", options: ["Adds animation", "Prevents re-rendering if props haven't changed", "Manages memory", "Caches API responses"], correctIndex: 1 },
    { question: "What is code splitting?", options: ["Breaking CSS into files", "Splitting JS bundles to load only what's needed", "Dividing a team", "Splitting a database"], correctIndex: 1 },
  ],
  "CI/CD with GitHub Actions": [
    { question: "What does CI/CD stand for?", options: ["Code Integration / Code Deployment", "Continuous Integration / Continuous Deployment", "Central Integration / Central Delivery", "Code Inspection / Code Distribution"], correctIndex: 1 },
    { question: "What is a GitHub Actions workflow?", options: ["A branch strategy", "An automated process defined in YAML", "A pull request template", "A deployment server"], correctIndex: 1 },
  ],

  // ── Cybersecurity ────────────────────────────────────────────
  "Introduction to Cybersecurity": [
    { question: "What is cybersecurity?", options: ["Only antivirus software", "Protecting systems and data from digital attacks", "Only network monitoring", "Only password management"], correctIndex: 1 },
    { question: "What is the CIA triad?", options: ["Central Intelligence Agency", "Confidentiality, Integrity, Availability", "Code, Inspect, Audit", "Cyber, Internet, Access"], correctIndex: 1 },
  ],
  "Networking Fundamentals for Security": [
    { question: "What does IP stand for?", options: ["Internet Protocol", "Internal Process", "Integrated Package", "Internet Program"], correctIndex: 0 },
    { question: "What is a firewall?", options: ["A physical wall in a data center", "A security system that monitors and controls network traffic", "An antivirus program", "A VPN service"], correctIndex: 1 },
  ],
  "Common Threats & Attack Vectors": [
    { question: "What is phishing?", options: ["A fishing technique", "A social engineering attack using fake emails/sites", "A network scan", "A password cracker"], correctIndex: 1 },
    { question: "What is a DDoS attack?", options: ["Data Deletion on Servers", "Distributed Denial of Service attack", "Direct Data on Systems", "Dynamic DNS over SSL"], correctIndex: 1 },
  ],
  "Cryptography & Encryption": [
    { question: "What is encryption?", options: ["Deleting data", "Converting data into an unreadable format", "Compressing files", "Backing up data"], correctIndex: 1 },
    { question: "What is a public key used for in asymmetric encryption?", options: ["Decrypting messages", "Encrypting messages sent to the key owner", "Signing certificates", "Generating passwords"], correctIndex: 1 },
  ],
  "Ethical Hacking Basics": [
    { question: "What is ethical hacking?", options: ["Illegal system access", "Authorized testing of systems to find vulnerabilities", "Stealing data for research", "Bypassing firewalls for fun"], correctIndex: 1 },
    { question: "What is a penetration test?", options: ["A hardware stress test", "A simulated cyberattack to find security weaknesses", "A network speed test", "A software performance test"], correctIndex: 1 },
  ],
  "Web Application Security (OWASP Top 10)": [
    { question: "What is SQL injection?", options: ["Adding SQL to a database", "Inserting malicious SQL code into a query", "A SQL backup method", "A database optimization technique"], correctIndex: 1 },
    { question: "What does XSS stand for?", options: ["Extra Secure Script", "Cross-Site Scripting", "External Style Sheet", "Cross-Server Syntax"], correctIndex: 1 },
    { question: "What is OWASP?", options: ["A hacking group", "Open Web Application Security Project", "A web framework", "An encryption standard"], correctIndex: 1 },
  ],
  "Incident Response & Recovery": [
    { question: "What is the first step in incident response?", options: ["Eradication", "Recovery", "Identification/Detection", "Lessons learned"], correctIndex: 2 },
    { question: "What is a disaster recovery plan?", options: ["A plan to avoid all disasters", "A documented process to recover IT systems after an incident", "A backup hard drive", "An insurance policy"], correctIndex: 1 },
  ],
};

async function seedQuizzes() {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(process.env.MONGODB_URI);

  // Clear existing quizzes
  await Quiz.deleteMany({});
  console.log("✓ Cleared existing quizzes");

  const allCourses = await Course.find();
  let total = 0;

  for (const course of allCourses) {
    const lessons = await Lesson.find({ courseId: course._id }).sort({ order: 1 });
    for (const lesson of lessons) {
      const questions = QUIZ_DATA[lesson.title];
      if (!questions) {
        console.log(`  ⚠ No quiz data for: "${lesson.title}"`);
        continue;
      }
      await Quiz.create({
        lessonId: lesson._id,
        courseId: course._id,
        type: "lesson",
        questions,
        passMark: 70,
      });
      console.log(`  ✓ Quiz added: "${lesson.title}" (${questions.length} questions)`);
      total++;
    }
    console.log(`✓ Course done: "${course.title}"`);
  }

  console.log(`\n🎉 Seeded ${total} lesson quizzes.`);
}

seedQuizzes()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
