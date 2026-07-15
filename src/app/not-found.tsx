import Link from "next/link";

export default function NotFound() {
  return (
    <div className="surface mx-auto max-w-xl rounded-3xl p-8 text-center">
      <h1 className="text-3xl font-black">找不到此評估資料</h1>
      <p className="mt-3 text-[var(--muted)]">可能尚未匯入該型態，或穩定 ID 已變更。</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[var(--primary)] px-4 font-bold text-[var(--primary-contrast)]"
      >
        返回圖鑑評估
      </Link>
    </div>
  );
}
