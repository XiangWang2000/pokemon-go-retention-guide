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
          這是供開發者與後續 Codex
          研究維護資料的管理頁，不要求一般使用者判斷寶可夢價值。每個問題都會說明是否影響目前建議、暫定結論與下一步研究方式。
        </p>
      </header>
      <ReviewTable issues={issues} />
    </div>
  );
}
