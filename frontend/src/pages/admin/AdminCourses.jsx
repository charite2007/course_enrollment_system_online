import { useEffect, useMemo, useRef, useState } from "react";
import { courses } from "../../api/api";
import { useToast } from "../../context/ToastContext";

const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/15 transition";
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
      {children}
    </div>
  );
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#111116] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-white/8 bg-[#111116] px-6 py-4 z-10">
          <div className="text-sm font-extrabold text-white">{title}</div>
          <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-white/60 hover:bg-white/10">✕ Close</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111116] p-6 shadow-2xl">
        <div className="text-base font-extrabold text-white">Are you sure?</div>
        <div className="mt-2 text-sm text-white/50">{message}</div>
        <div className="mt-5 flex gap-3 justify-end">
          <button onClick={onCancel} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/60 hover:bg-white/10">Cancel</button>
          <button onClick={onConfirm} className="rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/25">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCourses() {
  const toast = useToast();
  const lessonFormRef = useRef(null);

  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", instructor: "", category: "General", level: "Beginner", price: 0, durationHours: 0, thumbnail: "" });
  const [lessons, setLessons] = useState([]);
  const [lessonForm, setLessonForm] = useState({ title: "", videoUrl: "", order: 1 });
  const [editingLesson, setEditingLesson] = useState(null);
  const [busyCourse, setBusyCourse] = useState(false);
  const [busyLesson, setBusyLesson] = useState(false);
  const [confirm, setConfirm] = useState(null);

  async function refresh() {
    const d = await courses.getAll();
    setAll(d.courses || []);
  }

  useEffect(() => { refresh().catch(() => {}); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? all.filter((c) => c.title.toLowerCase().includes(s) || c.instructor.toLowerCase().includes(s)) : all;
  }, [all, q]);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", description: "", instructor: "", category: "General", level: "Beginner", price: 0, durationHours: 0, thumbnail: "" });
    setLessons([]);
    setLessonForm({ title: "", videoUrl: "", order: 1 });
    setEditingLesson(null);
    setOpen(true);
  }

  async function openEdit(course) {
    setEditing(course);
    setForm({ title: course.title, description: course.description, instructor: course.instructor, category: course.category || "General", level: course.level || "Beginner", price: course.price || 0, durationHours: course.durationHours || 0, thumbnail: course.thumbnail || "" });
    setEditingLesson(null);
    setLessonForm({ title: "", videoUrl: "", order: 1 });
    try {
      const d = await courses.getOne(course._id);
      const sorted = (d.lessons || []).slice().sort((a, b) => a.order - b.order);
      setLessons(sorted);
      setLessonForm({ title: "", videoUrl: "", order: sorted.length + 1 });
    } catch {
      setLessons([]);
    }
    setOpen(true);
  }

  async function saveCourse(e) {
    e.preventDefault();
    setBusyCourse(true);
    try {
      if (editing) {
        const d = await courses.update(editing._id, form);
        setEditing(d.course);
        toast("Course updated successfully", "success");
      } else {
        const d = await courses.create(form);
        setEditing(d.course);
        setLessonForm({ title: "", videoUrl: "", order: 1 });
        toast("Course created! Now add lessons below.", "success");
      }
      await refresh();
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to save course", "error");
    } finally {
      setBusyCourse(false);
    }
  }

  async function handleDeleteCourse() {
    try {
      await courses.remove(confirm.id);
      toast("Course deleted", "success");
      setOpen(false);
      await refresh();
    } catch {
      toast("Failed to delete course", "error");
    } finally {
      setConfirm(null);
    }
  }

  function startEditLesson(lesson) {
    setEditingLesson(lesson);
    setLessonForm({ title: lesson.title, videoUrl: lesson.videoUrl || "", order: lesson.order });
    // scroll lesson form into view
    setTimeout(() => lessonFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }

  function cancelEditLesson() {
    setEditingLesson(null);
    setLessonForm({ title: "", videoUrl: "", order: lessons.length + 1 });
  }

  async function saveLesson(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!editing) return;
    setBusyLesson(true);
    try {
      if (editingLesson) {
        await courses.updateLesson(editing._id, editingLesson._id, lessonForm);
        toast("Lesson updated", "success");
      } else {
        await courses.addLesson(editing._id, lessonForm);
        toast("Lesson added", "success");
      }
      const d = await courses.getOne(editing._id);
      const sorted = (d.lessons || []).slice().sort((a, b) => a.order - b.order);
      setLessons(sorted);
      setEditingLesson(null);
      setLessonForm({ title: "", videoUrl: "", order: sorted.length + 1 });
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to save lesson", "error");
    } finally {
      setBusyLesson(false);
    }
  }

  async function handleDeleteLesson() {
    try {
      await courses.deleteLesson(confirm.courseId, confirm.id);
      toast("Lesson deleted", "success");
      const d = await courses.getOne(confirm.courseId);
      const sorted = (d.lessons || []).slice().sort((a, b) => a.order - b.order);
      setLessons(sorted);
      setLessonForm({ title: "", videoUrl: "", order: sorted.length + 1 });
    } catch {
      toast("Failed to delete lesson", "error");
    } finally {
      setConfirm(null);
    }
  }

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={!!confirm}
        message={confirm?.type === "course" ? "This will permanently delete the course and all its lessons." : "This will permanently delete this lesson."}
        onConfirm={confirm?.type === "course" ? handleDeleteCourse : handleDeleteLesson}
        onCancel={() => setConfirm(null)}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Courses</h1>
          <p className="mt-1 text-sm text-white/40">{all.length} course{all.length !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex items-center gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses..." className="w-full sm:w-56 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-orange-500/60 transition" />
          <button onClick={openCreate} className="btn-brand shrink-0 rounded-xl px-4 py-2 text-sm">+ New Course</button>
        </div>
      </div>

      {/* Course grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <div key={c._id} className="card flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-extrabold text-white leading-snug">{c.title}</div>
              <span className="badge badge-orange shrink-0">{c.price ? `$${c.price}` : "Free"}</span>
            </div>
            <p className="text-xs text-white/40 line-clamp-2">{c.description}</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="badge badge-muted">{c.category}</span>
              <span className="badge badge-orange">{c.level}</span>
              <span className="badge badge-muted">👤 {c.instructor}</span>
              {c.durationHours > 0 && <span className="badge badge-muted">⏱ {c.durationHours}h</span>}
            </div>
            <div className="mt-auto flex gap-2 pt-1">
              <button onClick={() => openEdit(c)} className="flex-1 rounded-xl border border-orange-500/30 bg-orange-500/10 py-2 text-xs font-bold text-orange-400 hover:bg-orange-500/20 transition">✏ Edit</button>
              <button onClick={() => setConfirm({ type: "course", id: c._id })} className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition">🗑 Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full card p-10 text-center text-sm text-white/30">
            {q ? "No courses match your search." : "No courses yet. Create your first course."}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={open} title={editing ? `Editing: ${editing.title}` : "Create New Course"} onClose={() => setOpen(false)}>

        {/* ── COURSE FORM ── */}
        {!editing && (
          <div className="mb-4 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-xs text-orange-300">
            ⚡ Step 1 — Fill in the details and click <strong>Create Course</strong>. Lessons unlock in Step 2.
          </div>
        )}
        <form id="course-form" onSubmit={saveCourse} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Title"><input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="Course title" /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description"><textarea required value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className={inputCls + " resize-none"} placeholder="What will students learn?" /></Field>
          </div>
          <Field label="Instructor"><input required value={form.instructor} onChange={(e) => setForm((p) => ({ ...p, instructor: e.target.value }))} className={inputCls} placeholder="Instructor name" /></Field>
          <Field label="Category"><input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={inputCls} placeholder="e.g. Development" /></Field>
          <Field label="Level">
            <select value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} className={inputCls}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label="Price ($)"><input type="number" min={0} value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))} className={inputCls} /></Field>
          <Field label="Duration (hours)"><input type="number" min={0} value={form.durationHours} onChange={(e) => setForm((p) => ({ ...p, durationHours: Number(e.target.value) }))} className={inputCls} /></Field>
          <div className="sm:col-span-2">
            <Field label="Thumbnail URL (optional)"><input value={form.thumbnail} onChange={(e) => setForm((p) => ({ ...p, thumbnail: e.target.value }))} className={inputCls} placeholder="https://..." /></Field>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" form="course-form" disabled={busyCourse} className="btn-brand rounded-xl px-6 py-2.5 text-sm">
              {busyCourse ? "Saving…" : editing ? "Save Changes" : "Create Course"}
            </button>
          </div>
        </form>

        {/* ── LESSONS SECTION ── */}
        {editing && (
          <div className="mt-8 border-t border-white/8 pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-white/30">Lessons ({lessons.length})</span>
              <span className="badge badge-orange">Step 2</span>
            </div>

            {/* Lesson list */}
            <div className="space-y-2">
              {lessons.map((l) => (
                <div key={l._id} className={["flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 transition", editingLesson?._id === l._id ? "border-orange-500/40 bg-orange-500/8" : "border-white/8 bg-white/3"].join(" ")}>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{l.title}</div>
                    <div className="text-xs text-white/30">Order {l.order} · {l.videoUrl ? "has video" : "no video"}</div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEditLesson(l)}
                      className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-400 hover:bg-orange-500/20"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirm({ type: "lesson", id: l._id, courseId: editing._id })}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400 hover:bg-red-500/20"
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
              {lessons.length === 0 && <p className="text-sm text-white/30">No lessons yet. Add one below.</p>}
            </div>

            {/* Lesson form — completely separate from course form */}
            <div ref={lessonFormRef} className={["rounded-xl border p-4 space-y-3 transition", editingLesson ? "border-orange-500/30 bg-orange-500/5" : "border-white/8 bg-white/3"].join(" ")}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white/60">
                  {editingLesson ? `✏ Editing: "${editingLesson.title}"` : "➕ Add New Lesson"}
                </p>
                {editingLesson && (
                  <button type="button" onClick={cancelEditLesson} className="text-xs text-white/30 hover:text-white/60 transition">
                    ✕ Cancel
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Field label="Lesson Title">
                    <input
                      required
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))}
                      className={inputCls}
                      placeholder="Lesson title"
                    />
                  </Field>
                </div>
                <Field label="Order">
                  <input
                    type="number"
                    min={1}
                    value={lessonForm.order}
                    onChange={(e) => setLessonForm((p) => ({ ...p, order: Number(e.target.value) }))}
                    className={inputCls}
                  />
                </Field>
                <div className="sm:col-span-3">
                  <Field label="Video URL (optional)">
                    <input
                      value={lessonForm.videoUrl}
                      onChange={(e) => setLessonForm((p) => ({ ...p, videoUrl: e.target.value }))}
                      className={inputCls}
                      placeholder="https://www.youtube.com/embed/..."
                    />
                  </Field>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={busyLesson || !lessonForm.title.trim()}
                  onClick={saveLesson}
                  className="btn-brand rounded-xl px-5 py-2 text-xs"
                >
                  {busyLesson ? "Saving…" : editingLesson ? "Update Lesson" : "Add Lesson"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
