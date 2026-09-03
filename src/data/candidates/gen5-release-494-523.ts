export type CandidateReleaseStatus = "RELEASED" | "UNRELEASED" | "UNKNOWN";
export type CandidateReleaseVariantKey =
  | "NORMAL"
  | "SHADOW"
  | "PURIFIED"
  | "MEGA"
  | "DYNAMAX"
  | "GIGANTAMAX";

export type CandidateReleaseEvidence = {
  status: CandidateReleaseStatus;
  sourceIds: readonly string[];
  evidenceMode:
    | "DIRECT"
    | "EVOLUTION_DERIVED"
    | "MECHANIC_DERIVED"
    | "CURRENT_ROSTER"
    | "EXPLICIT_UNRELEASED"
    | "UNKNOWN";
  notesZhTw: string;
};

const allForms = Array.from({ length: 30 }, (_, index) =>
  `${String(494 + index).padStart(3, "0")}-unova`,
);

export const releasedNormalForms494523 = new Set(allForms);

export const releasedShadowForms494523 = new Set([
  "495-unova",
  "496-unova",
  "497-unova",
  "498-unova",
  "499-unova",
  "500-unova",
  "501-unova",
  "502-unova",
  "503-unova",
  "504-unova",
  "505-unova",
  "509-unova",
  "510-unova",
  "519-unova",
  "520-unova",
  "521-unova",
  "522-unova",
  "523-unova",
]);

export const releasedPurifiedForms494523 = new Set(releasedShadowForms494523);

export const releasedDynamaxForms494523 = new Set([
  "519-unova",
  "520-unova",
  "521-unova",
]);

const launchDirectNormal = new Set([
  "495-unova",
  "498-unova",
  "501-unova",
  "504-unova",
  "506-unova",
  "509-unova",
  "511-unova",
  "513-unova",
  "515-unova",
  "519-unova",
  "522-unova",
]);

const launchDerivedNormal = new Set([
  "496-unova",
  "497-unova",
  "499-unova",
  "500-unova",
  "502-unova",
  "503-unova",
  "505-unova",
  "507-unova",
  "508-unova",
  "510-unova",
  "512-unova",
  "514-unova",
  "516-unova",
  "520-unova",
  "521-unova",
  "523-unova",
]);

function normalEvidence(formId: string): CandidateReleaseEvidence {
  if (formId === "494-unova") {
    return {
      status: "RELEASED",
      sourceIds: ["OFFICIAL-GOFEST-2020-VICTINI"],
      evidenceMode: "DIRECT",
      notesZhTw: "官方 GO Fest 2020 回顧明列訓練家可遇見比克提尼。",
    };
  }
  if (formId === "517-unova" || formId === "518-unova") {
    return {
      status: "RELEASED",
      sourceIds: ["OFFICIAL-VALENTINES-2021-MUNNA"],
      evidenceMode: "DIRECT",
      notesZhTw: "官方 2021 情人節公告明列食夢夢與夢夢蝕在 Pokémon GO 首度登場。",
    };
  }
  if (launchDirectNormal.has(formId)) {
    return {
      status: "RELEASED",
      sourceIds: ["OFFICIAL-UNOVA-LAUNCH-2019"],
      evidenceMode: "DIRECT",
      notesZhTw: "官方 2019 合眾首波公告直接列出此基本型態的野外、蛋或團體戰取得方式。",
    };
  }
  if (launchDerivedNormal.has(formId)) {
    return {
      status: "RELEASED",
      sourceIds: ["OFFICIAL-UNOVA-LAUNCH-2019", "POKEAPI-CANONICAL-UNOVA-494-523"],
      evidenceMode: "EVOLUTION_DERIVED",
      notesZhTw: "由官方已推出基本型態與本批 canonical 進化路徑推導已可取得此進化型態。",
    };
  }
  throw new Error(`Missing NORMAL release evidence for ${formId}.`);
}

export function candidateReleaseEvidence494523(
  formId: string,
  variantKey: CandidateReleaseVariantKey,
): CandidateReleaseEvidence {
  if (!allForms.includes(formId)) {
    throw new Error(`Unknown Gen5 #494-#523 candidate form: ${formId}.`);
  }

  if (variantKey === "NORMAL") return normalEvidence(formId);

  if (variantKey === "SHADOW") {
    if (releasedShadowForms494523.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-SEREBII-SHADOW-ROSTER-20260904"],
        evidenceMode: "CURRENT_ROSTER",
        notesZhTw: "目前 Shadow 完整名單明列此型態；不以 PvPoke 排名存在性推定。",
      };
    }
    return {
      status: "UNKNOWN",
      sourceIds: [],
      evidenceMode: "UNKNOWN",
      notesZhTw: "目前沒有本批受控證據確認 Shadow 已推出；名單未列不在此階段反推為未推出。",
    };
  }

  if (variantKey === "PURIFIED") {
    if (releasedPurifiedForms494523.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: [
          "SECONDARY-SEREBII-SHADOW-ROSTER-20260904",
          "OFFICIAL-SHADOW-PURIFICATION-MECHANIC",
        ],
        evidenceMode: "MECHANIC_DERIVED",
        notesZhTw: "同型態 Shadow 已確認推出，且官方說明 Shadow Pokémon 可被淨化，因此 Purified 可取得。",
      };
    }
    return {
      status: "UNKNOWN",
      sourceIds: [],
      evidenceMode: "UNKNOWN",
      notesZhTw: "Shadow 尚未由本批證據確認推出，因此不自行宣告 Purified 狀態。",
    };
  }

  if (variantKey === "DYNAMAX") {
    if (releasedDynamaxForms494523.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: [
          "OFFICIAL-MAX-FINALE-2025-PIDOVE",
          "OFFICIAL-DYNAMAX-EVOLUTION-RULE",
        ],
        evidenceMode: formId === "519-unova" ? "DIRECT" : "EVOLUTION_DERIVED",
        notesZhTw:
          formId === "519-unova"
            ? "官方 Max Finale 2025 直接列出 Dynamax Pidove。"
            : "官方規則明確指出 Max Battle 捕獲的 Pokémon 及其進化形都可 Dynamax。",
      };
    }
    return {
      status: "UNKNOWN",
      sourceIds: [],
      evidenceMode: "UNKNOWN",
      notesZhTw: "目前沒有本批受控證據確認此型態具 Dynamax 資格；不以缺席名單反推未推出。",
    };
  }

  if (variantKey === "MEGA" && formId === "500-unova") {
    return {
      status: "UNRELEASED",
      sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
      evidenceMode: "EXPLICIT_UNRELEASED",
      notesZhTw: "GO Hub 當前合眾 Pokédex 對 Mega Emboar 明確標示 Released: No。",
    };
  }

  return {
    status: "UNKNOWN",
    sourceIds: [],
    evidenceMode: "UNKNOWN",
    notesZhTw: "目前候選資料沒有足夠受控證據判定此特殊版本推出狀態。",
  };
}
