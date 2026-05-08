export function Card({ children, className = "" }) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/10 bg-white/5 p-5 text-white shadow-[0_16px_40px_-30px_rgba(0,0,0,.9)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function PageTitle({ title, subtitle, right }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-white/60">{subtitle}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={[
        "rounded-xl bg-[hsl(var(--brand))] px-4 py-2 text-sm font-extrabold text-black hover:bg-[hsl(var(--brand-2))] disabled:opacity-50",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none ring-0 focus:border-[hsl(var(--brand))]",
        className,
      ].join(" ")}
    />
  );
}

export function Label({ children }) {
  return <div className="mb-1 text-xs font-bold uppercase tracking-wide text-white/60">{children}</div>;
}

