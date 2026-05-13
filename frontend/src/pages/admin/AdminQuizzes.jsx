import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { courses, quizzes as quizApi } from "../../api/api";
import { useToast } from "../../context/ToastContext";

const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15 transition";

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
      {children}
    </div>
  );
}

const EMPTY_Q = { question: "", options: ["", "", "", ""], correctIndex: 0 };

export default function AdminQuizzes() {
  const toast = useToast();
  const navigate = useNavigate();

  const [allCourses, setAllCourses]   = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons]         = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [quiz, setQuiz]               = useState(null);
  const [passMark, setPassMark]       = useState(70);
  const [questions, setQuestions]     = useState([]);
  const [editingQ, setEditingQ]       = useState(null);   // null = new, index = editing
  const [qForm, setQForm]             = useState({ ...EMPTY_Q });
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);

  // Load all courses
  useEffect(() => {
    courses.getAll().then((d) => setAllCourses(d.courses || [])).catch(() => {});
  }, []);

  // Load lessons when course selected
  async function selectCourse(course) {
    setSelectedCourse(course);
    setSelectedLesson(null);
    setQuiz(null);
    setQuestions([]);
    try {
      const d = await courses.getOne(course._id);
      setLessons((d.lessons || []).slice().sort((a, b) => a.order - b.order));
    } catch { setLessons([]); }
  }

  // Load quiz when lesson selected
  async function selectLesson(lesson) {
    setSelectedLesson(lesson);
    setQuiz(null);
    setQuestions([]);
    setEditingQ(null);
    setQForm({ ...EMPTY_Q });
    setLoading(true);
    try {
      const d = await quizApi.getForAdmin(lesson._id);
      if (d.quiz) {
        setQuiz(d.quiz);
        setPassMark(d.quiz.passMark ?? 70);
        setQuestions(d.quiz.questions || []);
      } else {
        setQuiz(null);
        setPassMark(70);
        setQuestions([]);
      }
    } catch { toast("Failed to load quiz", "error"); }
    finally { setLoading(false); }
  }

  // Save entire quiz (questions + passMark)
  async function saveAll(updatedQuestions, updatedPassMark) {
    if (!selectedLesson || !selectedCourse) return;
    setSaving(true);
    try {
      const d = await quizApi.save(selectedLesson._id, {
        courseId: selectedCourse._id,
        questions: updatedQuestions,
        passMark: updatedPassMark ?? passMark,
      });
      setQuiz(d.quiz);
      setQuestions(d.quiz.questions || []);
      return d.quiz;
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to save quiz", "error");
    } finally { setSaving(false); }
  }

  // Add or update question
  async function saveQuestion() {
    if (!qForm.question.trim() || qForm.options.some((o) => !o.trim())) {
      toast("Fill in the question and all 4 options.", "warning");
      return;
    }
    let updated;
    if (editingQ !== null) {
      updated = questions.map((q, i) => i === editingQ ? { ...qForm } : q);
    } else {
      updated = [...questions, { ...qForm }];
    }
    const saved = await saveAll(updated, passMark);
    if (saved) {
      toast(editingQ !== null ? "Question updated" : "Question added", "success");
      setEditingQ(null);
      setQForm({ ...EMPTY_Q });
    }
  }

  // Delete question
  async function deleteQuestion(idx) {
    const updated = questions.filter((_, i) => i !== idx);
    const saved = await saveAll(updated, passMark);
    if (saved) toast("Question deleted", "success");
    if (editingQ === idx) { setEditingQ(null); setQForm({ ...EMPTY_Q }); }
  }

  // Start editing a question
  function startEdit(idx) {
    setEditingQ(idx);
    setQForm({ ...questions[idx], options: [...questions[idx].options] });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  // Delete entire quiz
  async function deleteQuiz() {
    if (!selectedLesson) return;
    try {
      await quizApi.remove(selectedLesson._id);
      setQuiz(null);
      setQuestions([]);
      setPassMark(70);
      toast("Quiz deleted", "success");
    } catch { toast("Failed to delete quiz", "error"); }
  }

  // Update pass mark
  async function updatePassMark(val) {
    setPassMark(val);
    if (questions.length > 0) await saveAll(questions, val);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Quiz Management</h1>
        <p className="mt-1 text-sm text-white/40">Create and manage quizzes for each lesson</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">

        {/* ── Left: Course + Lesson selector ── */}
        <div className="space-y-4">
          {/* Course list */}
          <div className="card p-4">
            <p className="section-label mb-3">Select Course</p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {allCourses.map((c) => (
                <button key={c._id} type="button"
                  onClick={() => selectCourse(c)}
                  className={["w-full text-left rounded-xl px-3 py-2.5 text-sm font-semibold transition border",
                    selectedCourse?._id === c._id
                      ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
                      : "border-white/8 bg-white/3 text-white/70 hover:bg-white/8"].join(" ")}>
                  {c.title}
                </button>
              ))}
              {allCourses.length === 0 && <p className="text-xs text-white/30 py-2">No courses yet.</p>}
            </div>
          </div>

          {/* Lesson list */}
          {selectedCourse && (
            <div className="card p-4">
              <p className="section-label mb-3">Select Lesson</p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {lessons.map((l) => (
                  <button key={l._id} type="button"
                    onClick={() => selectLesson(l)}
                    className={["w-full text-left rounded-xl px-3 py-2.5 text-sm font-semibold transition border",
                      selectedLesson?._id === l._id
                        ? "border-violet-500/40 bg-violet-500/10 text-violet-400"
                        : "border-white/8 bg-white/3 text-white/70 hover:bg-white/8"].join(" ")}>
                    <span className="text-white/30 mr-2 text-xs">{l.order}.</span>{l.title}
                  </button>
                ))}
                {lessons.length === 0 && <p className="text-xs text-white/30 py-2">No lessons in this course.</p>}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Quiz editor ── */}
        <div className="space-y-5">
          {!selectedLesson && (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-sm font-bold text-white">Select a course and lesson</p>
              <p className="mt-1 text-xs text-white/40">to create or edit its quiz</p>
            </div>
          )}

          {selectedLesson && loading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 rounded-full border-2 border-white/10 border-t-violet-400 animate-spin-slow" />
            </div>
          )}

          {selectedLesson && !loading && (
            <>
              {/* Quiz header */}
              <div className="card p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-extrabold text-white">{selectedLesson.title}</p>
                    <p className="text-xs mt-0.5 text-white/40">{selectedCourse?.title}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Pass Mark</label>
                      <select value={passMark}
                        onChange={(e) => updatePassMark(Number(e.target.value))}
                        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white">
                        {[50, 60, 70, 80, 90, 100].map((v) => <option key={v} value={v}>{v}%</option>)}
                      </select>
                    </div>
                    {questions.length > 0 && (
                      <button type="button" onClick={deleteQuiz}
                        className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition">
                        🗑 Delete Quiz
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`badge ${questions.length > 0 ? "badge-violet" : "badge-muted"}`}>
                    {questions.length} question{questions.length !== 1 ? "s" : ""}
                  </span>
                  {quiz && <span className="badge badge-green">Quiz Active</span>}
                  {!quiz && <span className="badge badge-muted">No Quiz Yet</span>}
                </div>
              </div>

              {/* Existing questions */}
              {questions.length > 0 && (
                <div className="space-y-3">
                  <p className="section-label">Questions</p>
                  {questions.map((q, qi) => (
                    <div key={qi}
                      className={["card p-4 space-y-3 transition",
                        editingQ === qi ? "border-violet-500/40 bg-violet-500/5" : ""].join(" ")}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-white">
                          <span className="text-violet-400 mr-1.5">Q{qi + 1}.</span>{q.question}
                        </p>
                        <div className="flex shrink-0 gap-2">
                          <button type="button" onClick={() => startEdit(qi)}
                            className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-400 hover:bg-orange-500/20">
                            Edit
                          </button>
                          <button type="button" onClick={() => deleteQuestion(qi)}
                            className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400 hover:bg-red-500/20">
                            Del
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {q.options.map((opt, oi) => (
                          <div key={oi}
                            className={["rounded-xl px-3 py-2 text-sm border",
                              oi === q.correctIndex
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold"
                                : "border-white/8 bg-white/3 text-white/50"].join(" ")}>
                            <span className="font-bold mr-1.5">{String.fromCharCode(65 + oi)}.</span>{opt}
                            {oi === q.correctIndex && <span className="ml-1 text-xs">✓</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add / Edit question form */}
              <div className={["card p-5 space-y-4",
                editingQ !== null ? "border-violet-500/30 bg-violet-500/5" : ""].join(" ")}>
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-white">
                    {editingQ !== null ? `✏ Editing Question ${editingQ + 1}` : "➕ Add New Question"}
                  </p>
                  {editingQ !== null && (
                    <button type="button"
                      onClick={() => { setEditingQ(null); setQForm({ ...EMPTY_Q }); }}
                      className="text-xs font-bold text-white/30 hover:text-white/60 transition">
                      ✕ Cancel
                    </button>
                  )}
                </div>

                <Field label="Question">
                  <input value={qForm.question}
                    onChange={(e) => setQForm((p) => ({ ...p, question: e.target.value }))}
                    className={inputCls} placeholder="e.g. What does HTML stand for?" />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {qForm.options.map((opt, i) => (
                    <Field key={i} label={`Option ${String.fromCharCode(65 + i)}${qForm.correctIndex === i ? " ✓ Correct" : ""}`}>
                      <input value={opt}
                        onChange={(e) => setQForm((p) => {
                          const options = [...p.options];
                          options[i] = e.target.value;
                          return { ...p, options };
                        })}
                        className={[inputCls, qForm.correctIndex === i ? "border-emerald-500/40" : ""].join(" ")}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                    </Field>
                  ))}
                </div>

                <Field label="Correct Answer">
                  <select value={qForm.correctIndex}
                    onChange={(e) => setQForm((p) => ({ ...p, correctIndex: Number(e.target.value) }))}
                    className={inputCls}>
                    {qForm.options.map((opt, i) => (
                      <option key={i} value={i}>
                        {String.fromCharCode(65 + i)}. {opt || `Option ${String.fromCharCode(65 + i)}`}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="flex justify-end">
                  <button type="button"
                    disabled={saving || !qForm.question.trim() || qForm.options.some((o) => !o.trim())}
                    onClick={saveQuestion}
                    className="btn-brand rounded-xl px-6 py-2.5 text-sm">
                    {saving ? "Saving…" : editingQ !== null ? "Update Question" : "Add Question"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
