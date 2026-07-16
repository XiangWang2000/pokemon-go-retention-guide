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
          <h1 className="text-3xl font-black">資料審核佇列</h1>
        </div>
        <p className="mt-2 max-w-4xl leading-7 text-[var(--muted)]">
          每個問題都標示是否會影響最終結論。關鍵資料缺口可能產生「需要重新確認」；火箭隊缺少統一排名等次要缺口則保留正式結論，並列為不影響結論的待補資料。
        </p>
      </header>
      <ReviewTable issues={issues} />
    </div>
  );
}
