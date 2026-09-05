import type {
  CandidateReleaseEvidence,
  CandidateReleaseVariantKey,
} from "./gen5-release-494-523";
import { forms710721 } from "./gen6-710-721";

const allFormIds = new Set<string>(forms710721.map((form) => form.id));

export const releasedNormalForms710721 = new Set<string>(forms710721.map((form) => form.id));
export const releasedShadowForms710721 = new Set<string>(["714-kalos", "715-kalos"]);
export const releasedPurifiedForms710721 = new Set<string>(releasedShadowForms710721);
export const releasedMegaForms710721 = new Set<string>(["719-kalos"]);
export const releasedDynamaxForms710721 = new Set<string>();
export const releasedGigantamaxForms710721 = new Set<string>();

function unknown(notesZhTw: string): CandidateReleaseEvidence {
  return { status: "UNKNOWN", sourceIds: [], evidenceMode: "UNKNOWN", notesZhTw };
}

export function candidateReleaseEvidence710721(
  formId: string,
  variantKey: CandidateReleaseVariantKey,
): CandidateReleaseEvidence {
  if (!allFormIds.has(formId)) throw new Error(`Unknown Gen6 #710-#721 candidate form: ${formId}.`);

  if (variantKey === "NORMAL") {
    return {
      status: "RELEASED",
      sourceIds: ["SECONDARY-GOHUB-KALOS-ROSTER-20260905"],
      evidenceMode: "CURRENT_ROSTER",
      notesZhTw: formId.startsWith("710-") || formId.startsWith("711-")
        ? "Pokémon GO Hub 當前 Kalos Pokédex 分別列出 Pumpkaboo／Gourgeist 的 Small、Average、Large、Super 四尺寸為 Released: Yes；尺寸不互相借值。"
        : formId.startsWith("718-")
          ? "Pokémon GO Hub 當前 Kalos Pokédex 分別列出 Zygarde 10%、50% 與 Complete 為 Released: Yes；三種 exact form 各自記錄。"
          : formId.startsWith("720-")
            ? "Pokémon GO Hub 當前 Kalos Pokédex 分別列出 Hoopa Confined 與 Hoopa Unbound 為 Released: Yes；Form Change 不視為進化。"
            : "Pokémon GO Hub 2026-09-05 當前 Kalos Pokédex 明確標示此 exact ordinary/regional form 為 Released: Yes。",
    };
  }

  if (variantKey === "SHADOW") {
    if (releasedShadowForms710721.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-SEREBII-SHADOW-ROSTER-20260905"],
        evidenceMode: "CURRENT_ROSTER",
        notesZhTw: "Serebii 當前 Available Shadow Pokémon roster 明列 Shadow Noibat 與由其進化的 Shadow Noivern。",
      };
    }
    return unknown("Shadow roster 沒有本 exact form 的正面推出證據；普通、Legendary/Mythical、PvPoke identity 都不能替代 Shadow release evidence。");
  }

  if (variantKey === "PURIFIED") {
    if (releasedPurifiedForms710721.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-SEREBII-SHADOW-ROSTER-20260905", "OFFICIAL-SHADOW-PURIFICATION-MECHANIC"],
        evidenceMode: "MECHANIC_DERIVED",
        notesZhTw: "同 exact form 的 Shadow 已確認，故只依官方淨化機制推導 Purified Noibat／Noivern。",
      };
    }
    return unknown("同 exact form Shadow 尚未確認，因此 Purified 維持 UNKNOWN。");
  }

  if (variantKey === "MEGA") {
    if (releasedMegaForms710721.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-GOHUB-KALOS-ROSTER-20260905"],
        evidenceMode: "CURRENT_ROSTER",
        notesZhTw: "Pokémon GO Hub 當前 Kalos roster 明列 Mega Diancie Released: Yes。",
      };
    }
    return unknown("Mega Zygarde 等 species-level 條目若無法安全綁定到 10%／50%／Complete 的 exact base identity，就不回灌；其餘亦需正面 exact evidence。");
  }

  if (variantKey === "DYNAMAX") {
    return unknown("本批沒有當前 Kalos roster 的正面 Dynamax identity；Max Battle counter 模擬頁本身不是 release evidence。");
  }

  if (variantKey === "GIGANTAMAX") {
    return unknown("本批沒有受控正面 Gigantamax release evidence；未列出不等於明確 UNRELEASED。");
  }

  return unknown("目前沒有受控來源可判定此 exact form 的特殊版本推出狀態。");
}
