import { useEffect, useMemo, useState } from "react";
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
        <div className="sticky top-0 flex items-center justify-between border-b border-white/8 bg-[#111116] px-6 py-4">
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
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", instructor: "", category: "General", level: "Beginner", price: 0, durationHours: 0 });
  const [lessons, setLessons] = useState([]);
  const [lessonForm, setLessonForm] = useState({ title: "", videoUrl: "", order: 1 });
  const [editingLesson, setEditingLesson] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null); // { type: "course"|"lesson", id, courseId? }

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
    setForm({ title: "", description: "", instructor: "", category: "General", level: "Beginner", price: 0, durationHours: 0 });
    setLessons([]);
    setLessonForm({ title: "", videoUrl: "", order: 1 });
    setEditingLesson(null);
    setOpen(true);
  }

  async function openEdit(course) {
    setEditing(course);
    setForm({ title: course.title, description: course.description, instructor: course.instructor, category: course.category || "General", level: course.level || "Beginner", price: course.price || 0, durationHours: course.durationHours || 0 });
    setEditingLesson(null);
    try {
      const d = await courses.getOne(course._id);
      setLessons(d.lessons || []);
    } catch {
      setLessons([]);
    }
    setOpen(true);
  }

  async function saveCourse(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await courses.update(editing._id, form);
        toast("Course updated successfully", "success");
      } else {
        const d = await courses.create(form);
        setEditing(d.course);
        toast("Course created! Now add lessons below.", "success");
      }
      await refresh();
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to save course", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteCourse() {
    try {
      await courses.remove(confirm.id);
      toast("Course deleted", "success");
      await refresh();
    } catch {
      toast("Failed to delete course", "error");
    } finally {
      setConfirm(null);
    }
  }

  async function saveLesson(e) {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    try {
      if (editingLesson) {
        await courses.updateLesson(editing._id, editingLesson._id, lessonForm);
        toast("Lesson updated", "success");
      } else {
        await courses.addLesson(editing._id, lessonForm);
        toast("Lesson added", "success");
      }
      const d = await courses.getOne(editing._id);
      setLessons(d.lessons || []);
      setLessonForm({ title: "", videoUrl: "", order: (lessonForm.order || 1) + 1 });
      setEditingLesson(null);
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to save lesson", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteLesson() {
    try {
      await courses.deleteLesson(confirm.courseId, confirm.id);
      toast("Lesson deleted", "success");
      const d = await courses.getOne(confirm.courseId);
      setLessons(d.lessons || []);
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Courses</h1>
          <p className="mt-1 text-sm text-white/40">{all.length} course{all.length !== 1 ? "s" : ""} total</p>
        </div>
        <div className="flex items-center gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses..." className="w-56 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-orange-500/60 transition" />
          <button onClick={openCreate} className="btn-brand rounded-xl px-4 py-2 text-sm">+ New Course</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <div key={c._id} className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/3 p-5 hover:border-white/15 transition">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-extrabold text-white leading-snug">{c.title}</div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">{c.price ? `$${c.price}` : "Free"}</span>
            </div>
            <p className="text-xs text-white/40 line-clamp-2">{c.description}</p>
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/50">{c.category}</span>
              <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-orange-400">{c.level}</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/50">👤 {c.instructor}</span>
              {c.durationHours > 0 && <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/50">⏱ {c.durationHours}h</span>}
            </div>
            <div className="mt-auto flex gap-2 pt-1">
              <button onClick={() => openEdit(c)} className="flex-1 rounded-xl border border-orange-500/30 bg-orange-500/10 py-2 text-xs font-bold text-orange-400 hover:bg-orange-500/20 transition">✏ Edit</button>
              <button onClick={() => setConfirm({ type: "course", id: c._id })} className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition">🗑 Delete</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-white/8 bg-white/3 p-10 text-center text-sm text-white/30">
            {q ? "No courses match your search." : "No courses yet. Create your first course."}
          </div>
        )}
      </div>

      <Modal open={open} title={editing ? `Editing: ${editing.title}` : "Create New Course"} onClose={() => setOpen(false)}>
        <form onSubmit={saveCourse} className="grid gap-4 sm:grid-cols-2">
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
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={busy} className="btn-brand rounded-xl px-6 py-2.5 text-sm">
              {busy ? "Saving…" : editing ? "Save Changes" : "Create Course"}
            </button>
          </div>
        </form>

        {editing && (
          <div className="mt-8 border-t border-white/8 pt-6">
            <div className="mb-4 text-xs font-extrabold uppercase tracking-widest text-white/30">Lessons ({lessons.length})</div>
            <div className="space-y-2 mb-5">
              {lessons.slice().sort((a, b) => a.order - b.order).map((l) => (
                <div key={l._id} className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/3 px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-white">{l.title}</div>
                    <div className="text-xs text-white/30">Order {l.order}{l.videoUrl ? " · has video" : " · no video"}</div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => { setEditingLesson(l); setLessonForm({ title: l.title, videoUrl: l.videoUrl || "", order: l.order }); }} className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-bold text-orange-400 hover:bg-orange-500/20">Edit</button>
                    <button onClick={() => setConfirm({ type: "lesson", id: l._id, courseId: editing._id })} className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400 hover:bg-red-500/20">Del</button>
                  </div>
                </div>
              ))}
              {lessons.length === 0 && <div className="text-sm text-white/30">No lessons yet. Add one below.</div>}
            </div>

            <form onSubmit={saveLesson} className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-3">
              <div className="text-xs font-bold text-white/50">{editingLesson ? `Editing lesson: ${editingLesson.title}` : "Add New Lesson"}</div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Field label="Lesson Title"><input required value={lessonForm.title} onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="Lesson title" /></Field>
                </div>
                <Field label="Order"><input type="number" min={1} value={lessonForm.order} onChange={(e) => setLessonForm((p) => ({ ...p, order: Number(e.target.value) }))} className={inputCls} /></Field>
                <div className="sm:col-span-3">
                  <Field label="Video URL (optional)"><input value={lessonForm.videoUrl} onChange={(e) => setLessonForm((p) => ({ ...p, videoUrl: e.target.value }))} className={inputCls} placeholder="https://youtube.com/embed/..." /></Field>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                {editingLesson && (
                  <button type="button" onClick={() => { setEditingLesson(null); setLessonForm({ title: "", videoUrl: "", order: lessons.length + 1 }); }} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/50 hover:bg-white/10">Cancel</button>
                )}
                <button type="submit" disabled={busy} className="btn-brand rounded-xl px-5 py-2 text-xs">{editingLesson ? "Update Lesson" : "Add Lesson"}</button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
