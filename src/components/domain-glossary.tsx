const quickTerms = [
  {
    term: "PvE",
    full: "Player versus Environment（玩家對環境）",
    description: "本站的 PvE 評價主要指團體戰攻擊手；道館、火箭隊與 Max Battle 另行評估。",
  },
  {
    term: "PvP",
    full: "Player versus Player（玩家對戰）",
    description: "訓練家對戰。物種排名代表這隻寶可夢在聯盟中的位置，不是你手上個體的 IV 排名。",
  },
  {
    term: "IV",
    full: "Individual Values（個體值）",
    description: "攻擊／防禦／HP 各 0～15，總 IV 百分比用三項合計除以 45；用途與招式仍比漂亮 IV 更優先。",
  },
  {
    term: "CP",
    full: "Combat Power（戰鬥力）",
    description: "由物種能力、等級與 IV 共同形成的戰力數字；CP 高不代表一定值得長期投資。",
  },
] as const;

const extendedTerms = [
  ["GL／UL／ML", "超級／高級／大師聯盟；CP 上限分別是 1500／2500／不限。"],
  [
    "個體 IV Rank／PR",
    "同物種、同型態、同聯盟的個體排序／能力乘積百分位。這和 PvPoke 的物種排名是兩件事。",
  ],
  ["DPS", "Damage per Second，每秒傷害；越高通常代表輸出速度越快。"],
  ["TDO", "Total Damage Output，倒下前預期造成的總傷害；會同時受到輸出與耐久影響。"],
  ["HP", "Hit Points（體力）；與防禦、等級一起影響實戰耐久。"],
  ["CMP", "Charged Move Priority（蓄力招式優先權）；同回合發招時通常由實際攻擊較高者先出手。"],
  ["STAB", "Same-Type Attack Bonus（屬性一致加成）；使用與自身屬性相同的招式會有傷害加成。"],
  ["Tier", "同一套榜單中的強度分級；不同網站、賽制或模擬條件的 Tier 不能直接混用。"],
  ["XL 糖果", "把寶可夢強化到 40 級以上所需的糖果；屬於高成本資源。"],
  ["Elite TM", "厲害招式學習器；可取得部分限定招式，投入前仍要確認該招式是否真的必要。"],
  ["Mega／Primal", "Mega 進化／原始回歸；與普通、暗影版本分開評估，通常只需少量投資候選。"],
  ["Dynamax／Gigantamax", "極巨化／超極巨化；只有具 Max 能力的個體才能參加 Max Battle，普通舊個體不會自動取得。"],
] as const;

export function DomainGlossary({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <details className="surface rounded-2xl p-4" data-testid="domain-glossary">
        <summary className="cursor-pointer font-black">看懂 PvE、PvP、IV 與排名縮寫</summary>
        <GlossaryContent />
      </details>
    );
  }

  return (
    <section
      className="surface rounded-2xl p-4 sm:p-5"
      aria-labelledby="domain-glossary-title"
      data-testid="domain-glossary"
    >
      <h2 id="domain-glossary-title" className="text-lg font-black">
        縮寫與數字怎麼看
      </h2>
      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
        先分清楚「物種有沒有用途」與「你手上哪一隻 IV 較好」；兩種排名不能互相代替。
      </p>
      <GlossaryContent />
    </section>
  );
}

function GlossaryContent() {
  return (
    <div className="mt-4">
      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickTerms.map((item) => (
          <div key={item.term} className="rounded-xl border bg-[var(--surface-muted)] p-3">
            <dt className="font-black">
              <abbr title={item.full} className="no-underline">
                {item.term}
              </abbr>
            </dt>
            <dd className="mt-1 text-xs font-bold text-[var(--muted)]">{item.full}</dd>
            <dd className="mt-2 text-sm leading-6">{item.description}</dd>
          </div>
        ))}
      </dl>
      <details className="mt-3 rounded-xl border px-3 py-2.5">
        <summary className="cursor-pointer text-sm font-black">
          更多名詞：GL／UL／ML、Rank／PR、DPS／TDO、CMP／STAB、Tier、XL、Elite TM
        </summary>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          {extendedTerms.map(([term, description]) => (
            <div key={term} className="rounded-lg bg-[var(--surface-muted)] p-3">
              <dt className="text-sm font-black">{term}</dt>
              <dd className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  );
}
