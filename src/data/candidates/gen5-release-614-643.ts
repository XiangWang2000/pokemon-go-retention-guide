import type {
  CandidateReleaseEvidence,
  CandidateReleaseVariantKey,
} from "./gen5-release-494-523";
import { forms614643 } from "./gen5-614-643";

const allFormIds = new Set(forms614643.map((form) => form.id));

export const releasedNormalForms614643 = new Set(forms614643.map((form) => form.id));

const shadowRosterForms614643 = new Set([
  "616-unova",
  "617-unova",
  "622-unova",
  "623-unova",
  "633-unova",
  "634-unova",
  "635-unova",
]);

const directShadowEventSourceByForm614643 = new Map<string, string>([
  ["641-incarnate", "SECONDARY-GOHUB-PSYCHIC-SPECTACULAR-SHADOW-TORNADUS-20250915"],
  ["642-incarnate", "SECONDARY-GOHUB-PRECIOUS-PALS-SHADOW-THUNDURUS-20260123"],
  ["643-unova", "SECONDARY-GOHUB-FLYING-TAXI-SHADOW-RESHIRAM-20260625"],
]);

export const releasedShadowForms614643 = new Set([
  ...shadowRosterForms614643,
  ...directShadowEventSourceByForm614643.keys(),
]);

export const releasedPurifiedForms614643 = new Set(releasedShadowForms614643);

export const releasedDynamaxForms614643 = new Set([
  "615-unova",
  "633-unova",
  "634-unova",
  "635-unova",
]);

export const releasedGigantamaxForms614643 = new Set<string>();
export const explicitlyUnreleasedMegaForms614643 = new Set(["623-unova"]);

function unknown(notesZhTw: string): CandidateReleaseEvidence {
  return {
    status: "UNKNOWN",
    sourceIds: [],
    evidenceMode: "UNKNOWN",
    notesZhTw,
  };
}

export function candidateReleaseEvidence614643(
  formId: string,
  variantKey: CandidateReleaseVariantKey,
): CandidateReleaseEvidence {
  if (!allFormIds.has(formId)) {
    throw new Error(`Unknown Gen5 #614-#643 candidate form: ${formId}.`);
  }

  if (variantKey === "NORMAL") {
    return {
      status: "RELEASED",
      sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
      evidenceMode: "CURRENT_ROSTER",
      notesZhTw:
        "GO Hub 當前合眾 Pokédex 對此 exact Pokémon GO form 明確標示 Released: Yes；普通／伽勒爾泥巴魚、普通／洗翠勇士雄鷹及龍捲雲／雷電雲化身與靈獸型態逐 form 判定。",
    };
  }

  if (variantKey === "SHADOW") {
    if (shadowRosterForms614643.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-SEREBII-SHADOW-ROSTER-20260904"],
        evidenceMode: "CURRENT_ROSTER",
        notesZhTw:
          "Serebii 當前 Shadow Pokémon 名單正面列出此 ordinary exact form 或其同型態進化鏈；缺席者不反推為未推出。",
      };
    }

    const directSourceId = directShadowEventSourceByForm614643.get(formId);
    if (directSourceId) {
      return {
        status: "RELEASED",
        sourceIds: [directSourceId],
        evidenceMode: "DIRECT",
        notesZhTw:
          formId === "641-incarnate"
            ? "2025-09 Psychic Spectacular: Taken Over 的 Special Research 明確要求從 Giovanni 手中救出 Shadow Incarnate Forme Tornadus；只確認化身形態，不回灌靈獸形態。"
            : formId === "642-incarnate"
              ? "2026-01 Precious Pals: Taken Over 明確記錄 Giovanni 的 Shadow Incarnate Forme Thundurus；只確認化身形態，不回灌靈獸形態。"
              : "2026-06 Flying Taxi: Taken Over 明確宣告 Shadow Reshiram 在 Pokémon GO 首次登場。",
      };
    }

    return unknown(
      "目前沒有本批受控正面證據確認此 exact form 的 Shadow 已推出；PvPoke Shadow speciesId、普通版推出或同圖鑑另一 form 都不構成推出證據。",
    );
  }

  if (variantKey === "PURIFIED") {
    if (releasedPurifiedForms614643.has(formId)) {
      const shadow = candidateReleaseEvidence614643(formId, "SHADOW");
      return {
        status: "RELEASED",
        sourceIds: [...shadow.sourceIds, "OFFICIAL-SHADOW-PURIFICATION-MECHANIC"],
        evidenceMode: "MECHANIC_DERIVED",
        notesZhTw:
          "同 exact form 的 Shadow 已確認推出，且官方淨化機制允許 Shadow Pokémon 使用星塵與糖果進行淨化，因此 Purified 可取得。",
      };
    }
    return unknown("同 exact form 的 Shadow 尚未確認，因此 Purified 不自行推定。");
  }

  if (variantKey === "DYNAMAX") {
    if (releasedDynamaxForms614643.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
        evidenceMode: "CURRENT_ROSTER",
        notesZhTw:
          "GO Hub 當前合眾 Pokédex 對此 exact Dynamax form 明確標示 Released: Yes；只確認 Dynamax Cryogonal 與 Dynamax Deino／Zweilous／Hydreigon，不向其他 form 或家族擴散。",
      };
    }
    return unknown(
      "當前受控來源沒有明確確認此 exact form 的 Dynamax 版本；普通版、同圖鑑另一 form 或同家族推出不會自動推定 Dynamax。",
    );
  }

  if (variantKey === "GIGANTAMAX") {
    return unknown(
      "目前沒有受控來源確認本批 #614-#643 的 exact Gigantamax form；Dynamax 推出不會自動升格為 Gigantamax。",
    );
  }

  if (variantKey === "MEGA") {
    if (explicitlyUnreleasedMegaForms614643.has(formId)) {
      return {
        status: "UNRELEASED",
        sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
        evidenceMode: "EXPLICIT_UNRELEASED",
        notesZhTw: "GO Hub 當前合眾 Pokédex 對 Mega Golurk 明確標示 Released: No。",
      };
    }
    return unknown("目前沒有受控來源對此 exact form 的 Mega 版本提供明確推出或未推出結論。");
  }

  return unknown("目前沒有受控來源可判定此 exact form 的特殊版本推出狀態。");
}
