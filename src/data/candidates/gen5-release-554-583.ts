import type {
  CandidateReleaseEvidence,
  CandidateReleaseVariantKey,
} from "./gen5-release-494-523";
import { forms554583 } from "./gen5-554-583";

const allFormIds = new Set(forms554583.map((form) => form.id));

export const explicitlyUnreleasedNormalForms554583 = new Set([
  "555-unova-zen",
  "555-galar-zen",
]);

export const releasedNormalForms554583 = new Set(
  forms554583
    .map((form) => form.id)
    .filter((formId) => !explicitlyUnreleasedNormalForms554583.has(formId)),
);

export const releasedShadowForms554583 = new Set([
  "554-unova",
  "555-unova-standard",
  "557-unova",
  "558-unova",
  "564-unova",
  "565-unova",
  "566-unova",
  "567-unova",
  "568-unova",
  "569-unova",
  "574-unova",
  "575-unova",
  "576-unova",
  "577-unova",
  "578-unova",
  "579-unova",
  "580-unova",
  "581-unova",
]);

export const releasedPurifiedForms554583 = new Set(releasedShadowForms554583);

export const releasedDynamaxForms554583 = new Set([
  "554-unova",
  "555-unova-standard",
  "568-unova",
  "569-unova",
]);

export const releasedGigantamaxForms554583 = new Set(["569-unova"]);
export const explicitlyUnreleasedMegaForms554583 = new Set(["560-unova"]);

function unknown(notesZhTw: string): CandidateReleaseEvidence {
  return {
    status: "UNKNOWN",
    sourceIds: [],
    evidenceMode: "UNKNOWN",
    notesZhTw,
  };
}

export function candidateReleaseEvidence554583(
  formId: string,
  variantKey: CandidateReleaseVariantKey,
): CandidateReleaseEvidence {
  if (!allFormIds.has(formId)) {
    throw new Error(`Unknown Gen5 #554-#583 candidate form: ${formId}.`);
  }

  if (variantKey === "NORMAL") {
    if (explicitlyUnreleasedNormalForms554583.has(formId)) {
      return {
        status: "UNRELEASED",
        sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
        evidenceMode: "EXPLICIT_UNRELEASED",
        notesZhTw:
          formId === "555-unova-zen"
            ? "GO Hub 當前合眾 Pokédex 對 Zen Mode Darmanitan 明確標示 Released: No。"
            : "GO Hub 當前合眾 Pokédex 對 Galarian Zen Mode Darmanitan 明確標示 Released: No。",
      };
    }
    return {
      status: "RELEASED",
      sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
      evidenceMode: "CURRENT_ROSTER",
      notesZhTw:
        "GO Hub 當前合眾 Pokédex 對此 exact Pokémon GO form 明確標示 Released: Yes；地區型態與 Standard Mode 都逐 form 判定。",
    };
  }

  if (variantKey === "SHADOW") {
    if (releasedShadowForms554583.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-SEREBII-SHADOW-ROSTER-20260904"],
        evidenceMode: "CURRENT_ROSTER",
        notesZhTw:
          "Serebii 當前 Shadow Pokémon 名單正面列出此 ordinary exact form 或其同型態進化來源；不把 PvPoke Shadow ID 當推出證據。",
      };
    }
    return unknown(
      "目前沒有本批受控正面證據確認此 exact form 的 Shadow 已推出；即使 PvPoke 存在 Shadow speciesId，也保持 UNKNOWN。",
    );
  }

  if (variantKey === "PURIFIED") {
    if (releasedPurifiedForms554583.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: [
          "SECONDARY-SEREBII-SHADOW-ROSTER-20260904",
          "OFFICIAL-SHADOW-PURIFICATION-MECHANIC",
        ],
        evidenceMode: "MECHANIC_DERIVED",
        notesZhTw:
          "同 exact form 的 Shadow 已確認推出，且官方淨化機制允許 Shadow Pokémon 被淨化，因此 Purified 可取得。",
      };
    }
    return unknown("同 exact form 的 Shadow 尚未確認，因此 Purified 不自行推定。");
  }

  if (variantKey === "DYNAMAX") {
    if (releasedDynamaxForms554583.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds:
          formId === "554-unova"
            ? [
                "OFFICIAL-MAX-FINALE-2025-DARUMAKA",
                "SECONDARY-GOHUB-UNOVA-ROSTER-20260904",
              ]
            : ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
        evidenceMode: formId === "554-unova" ? "DIRECT" : "CURRENT_ROSTER",
        notesZhTw:
          formId === "554-unova"
            ? "Pokémon GO Fest 2025: Max Finale 官方活動頁直接列出 Dynamax Darumaka，現行 roster 亦標示 Released: Yes。"
            : "GO Hub 當前合眾 Pokédex 對此 exact Dynamax form 明確標示 Released: Yes；不向伽勒爾／Zen 或其他家族 form 回灌。",
      };
    }
    return unknown(
      "當前受控來源沒有明確確認此 exact form 的 Dynamax 版本；不因普通、地區型態、同家族或 PvPoke 資料而推定。",
    );
  }

  if (variantKey === "GIGANTAMAX") {
    if (releasedGigantamaxForms554583.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["OFFICIAL-GIGANTAMAX-GARBODOR-2025"],
        evidenceMode: "DIRECT",
        notesZhTw:
          "Pokémon GO 官方公告確認 Gigantamax Garbodor 於 2025-11-01 的 Max Battle Day 首度登場。",
      };
    }
    return unknown(
      "目前沒有受控來源確認此 exact form 的 Gigantamax 版本；Dynamax 推出不會自動升格為 Gigantamax。",
    );
  }

  if (variantKey === "MEGA") {
    if (explicitlyUnreleasedMegaForms554583.has(formId)) {
      return {
        status: "UNRELEASED",
        sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
        evidenceMode: "EXPLICIT_UNRELEASED",
        notesZhTw: "GO Hub 當前合眾 Pokédex 對 Mega Scrafty 明確標示 Released: No。",
      };
    }
    return unknown("目前沒有受控來源對此 exact form 的 Mega 版本提供明確推出或未推出結論。");
  }

  return unknown("目前沒有受控來源可判定此 exact form 的特殊版本推出狀態。");
}
