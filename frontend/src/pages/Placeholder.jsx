import { Card, PageTitle } from "../components/ui";

export default function Placeholder() {
  return (
    <div>
      <PageTitle title="Placeholder" subtitle="Stub pages listed in ARCHITECTURE.md (HR links etc.)." />
      <Card>
        <div className="text-sm text-white/70">
          This page is a placeholder. We’ll keep it here to match the sidebar structure from the mockups.
        </div>
      </Card>
    </div>
  );
}

