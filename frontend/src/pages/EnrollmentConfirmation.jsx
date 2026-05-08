import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { courses } from "../api/api";
import { Card, PageTitle, PrimaryButton } from "../components/ui";

export default function EnrollmentConfirmation() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    let alive = true;
    courses
      .getOne(id)
      .then((d) => alive && setCourse(d.course))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <div>
      <PageTitle title="Enrollment Confirmation" subtitle="You’re successfully enrolled." />
      <Card className="text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[hsl(var(--brand))] text-3xl font-black text-black">
          ✓
        </div>
        <div className="mt-4 text-lg font-extrabold text-white">Enrollment Successful!</div>
        <div className="mt-1 text-sm text-white/60">
          {course?.title ? (
            <>
              You’re now enrolled in <span className="font-extrabold text-white">{course.title}</span>.
            </>
          ) : (
            "You’re now enrolled."
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <PrimaryButton onClick={() => (window.location.href = `/lesson/${id}`)}>Go to Lessons</PrimaryButton>
          <button
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-extrabold text-white hover:bg-white/10"
            onClick={() => (window.location.href = "/find-courses")}
          >
            Back to All Courses
          </button>
        </div>
      </Card>
    </div>
  );
}

