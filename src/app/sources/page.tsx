import { Database, ExternalLink } from "lucide-react";
import { getSources } from "@/lib/data";
import { zhTw } from "@/locales/zh-TW";

export default async function SourcesPage() {
  const sources = await getSources();
  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <Database aria-hidden size={28} className="text-[var(--primary)]" />
          <h1 className="text-3xl font-black">資料來源</h1>
        </div>
        <p className="mt-2 max-w-3xl leading-7 text-[var(--muted)]">
          保留原始頁面標題、網址、語言、查閱日期、版本與中文摘要。來源標題不以翻譯文字取代。
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        {sources.map((source) => (
          <article key={source.id} className="surface rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full border px-2 py-1 text-xs font-bold">
                {zhTw.sourceType[source.sourceType]}
              </span>
              <span className="font-mono text-xs text-[var(--muted)]">
                {source.dataVersion ?? "未標示版本"}
              </span>
            </div>
            <h2 className="mt-3 text-lg font-bold">{source.sourceTitleOriginal}</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {source.sourceName} · {source.sourceLanguage} · 查閱{" "}
              {new Date(source.accessedAt).toLocaleDateString("zh-TW")}
            </p>
            <p className="mt-3 leading-6">{source.sourceSummaryZhTw}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              引用評估：{source.evaluationCount}；資料涵蓋：
              {source.referencedPokemon.length ? source.referencedPokemon.join("、") : "尚未連結"}
            </p>
            {source.linkedEvidence.length ? (
              <div className="mt-3 rounded-xl bg-[var(--surface-muted)] p-3">
                <p className="text-sm font-black">具體綁定</p>
                <ul className="mt-2 space-y-2 text-sm leading-6">
                  {source.linkedEvidence.map((evidence) => (
                    <li key={`${evidence.kind}-${evidence.target}-${evidence.usageZhTw}`}>
                      <span className="font-bold">
                        {evidence.target} · {evidence.kind}
                      </span>
                      ：{evidence.usageZhTw}
                    </li>
                  ))}
                </ul>
                {source.linkedEvidenceCount > source.linkedEvidence.length ? (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    另有 {source.linkedEvidenceCount - source.linkedEvidence.length}{" "}
                    筆綁定，完整資料保留於 Excel 匯出。
                  </p>
                ) : null}
              </div>
            ) : null}
            <a
              href={source.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-bold text-[var(--accent)] hover:bg-[var(--surface-muted)]"
            >
              開啟原始頁面 <ExternalLink aria-hidden size={16} />
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
