export function SummaryCell({ text, muted = false }: { text: string; muted?: boolean }) {
  return (
    <p
      title={text}
      className={`line-clamp-2 text-sm leading-5 ${muted ? "text-[var(--muted)]" : "font-semibold"}`}
    >
      {text || "—"}
    </p>
  );
}
