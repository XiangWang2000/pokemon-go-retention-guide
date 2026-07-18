import { ClipboardList } from "lucide-react";
import { ReviewTable } from "@/components/review-table";
import { getReviewIssues } from "@/lib/data";

export default async function ReviewPage() {
  const issues = await getReviewIssues();
  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <ClipboardList aria-hidden size={28} className="text-[var(--primary)]" />
          <h1 className="text-3xl font-black">資料待補清單</h1>
        </div>
        <p className="mt-2 max-w-4xl leading-7 text-[var(--muted)]">
          首頁統計以進化家族為單位；本頁每筆紀錄則以單一戰鬥版本為單位。只有標示「影響家族總結」的項目，才會改變首頁保留建議。
        </p>
      </header>
      <ReviewTable issues={issues} />
    </div>
  );
}
