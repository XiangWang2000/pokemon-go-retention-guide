import type {
  CandidateReleaseEvidence,
  CandidateReleaseVariantKey,
} from "./gen5-release-494-523";
import { forms584613 } from "./gen5-584-613";

const allFormIds = new Set(forms584613.map((form) => form.id));

export const releasedNormalForms584613 = new Set(forms584613.map((form) => form.id));

const shadowRosterForms584613 = new Set([
  "588-unova",
  "589-unova",
  "590-unova",
  "591-unova",
  "595-unova",
  "596-unova",
  "597-unova",
  "598-unova",
  "607-unova",
  "608-unova",
  "609-unova",
]);

const directShadowEventForms584613 = new Set(["610-unova"]);
const evolutionDerivedShadowForms584613 = new Set(["611-unova", "612-unova"]);

export const releasedShadowForms584613 = new Set([
  ...shadowRosterForms584613,
  ...directShadowEventForms584613,
  ...evolutionDerivedShadowForms584613,
]);

export const releasedPurifiedForms584613 = new Set(releasedShadowForms584613);
export const releasedDynamaxForms584613 = new Set<string>();
export const releasedGigantamaxForms584613 = new Set<string>();
export const explicitlyUnreleasedMegaForms584613 = new Set([
  "604-unova",
  "609-unova",
]);

function unknown(notesZhTw: string): CandidateReleaseEvidence {
  return {
    status: "UNKNOWN",
    sourceIds: [],
    evidenceMode: "UNKNOWN",
    notesZhTw,
  };
}

function shadowSourceIds(formId: string): readonly string[] {
  if (shadowRosterForms584613.has(formId)) {
    return ["SECONDARY-SEREBII-SHADOW-ROSTER-20260904"];
  }
  if (directShadowEventForms584613.has(formId)) {
    return ["SECONDARY-GOHUB-FLYING-TAXI-SHADOW-AXEW-20260629"];
  }
  if (evolutionDerivedShadowForms584613.has(formId)) {
    return [
      "SECONDARY-GOHUB-FLYING-TAXI-SHADOW-AXEW-20260629",
      "OFFICIAL-SHADOW-EVOLUTION-MECHANIC",
    ];
  }
  return [];
}

export function candidateReleaseEvidence584613(
  formId: string,
  variantKey: CandidateReleaseVariantKey,
): CandidateReleaseEvidence {
  if (!allFormIds.has(formId)) {
    throw new Error(`Unknown Gen5 #584-#613 candidate form: ${formId}.`);
  }

  if (variantKey === "NORMAL") {
    return {
      status: "RELEASED",
      sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
      evidenceMode: "CURRENT_ROSTER",
      notesZhTw:
        "GO Hub 當前合眾 Pokédex 對此 exact Pokémon GO form 明確標示 Released: Yes；四季鹿／萌芽鹿四季型態與輕飄飄／胖嘟嘟性別型態逐 form 判定。",
    };
  }

  if (variantKey === "SHADOW") {
    if (shadowRosterForms584613.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: shadowSourceIds(formId),
        evidenceMode: "CURRENT_ROSTER",
        notesZhTw:
          "Serebii 當前 Shadow Pokémon 名單正面列出此 ordinary exact form 或其同型態進化鏈；未明列的季節／性別／其他 form 不會被回灌。",
      };
    }
    if (directShadowEventForms584613.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: shadowSourceIds(formId),
        evidenceMode: "DIRECT",
        notesZhTw:
          "Pokémon GO Hub 對 2026-06 Flying Taxi: Taken Over 的活動分析明確記錄 Rocket Leader Cliff 使用 Shadow Axew，提供 Shadow 牙牙已推出的正面證據。",
      };
    }
    if (evolutionDerivedShadowForms584613.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: shadowSourceIds(formId),
        evidenceMode: "EVOLUTION_DERIVED",
        notesZhTw:
          "Shadow Axew 已由 2026-06 活動證據確認，且 Pokémon GO 官方明確允許 Shadow Pokémon 進化，因此同一進化線的 Shadow Fraxure／Haxorus 可由機制安全推導；不向其他家族或型態擴散。",
      };
    }
    return unknown(
      "目前沒有本批受控正面證據確認此 exact form 的 Shadow 已推出；PvPoke Shadow speciesId、普通版推出或同圖鑑其他 form 都不構成推出證據。",
    );
  }

  if (variantKey === "PURIFIED") {
    if (releasedPurifiedForms584613.has(formId)) {
      const shadow = candidateReleaseEvidence584613(formId, "SHADOW");
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

  if (variantKey === "MEGA") {
    if (explicitlyUnreleasedMegaForms584613.has(formId)) {
      return {
        status: "UNRELEASED",
        sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
        evidenceMode: "EXPLICIT_UNRELEASED",
        notesZhTw:
          formId === "604-unova"
            ? "GO Hub 當前合眾 Pokédex 對 Mega Eelektross 明確標示 Released: No。"
            : "GO Hub 當前合眾 Pokédex 對 Mega Chandelure 明確標示 Released: No。",
      };
    }
    return unknown("目前沒有受控來源對此 exact form 的 Mega 版本提供明確推出或未推出結論。");
  }

  if (variantKey === "DYNAMAX") {
    return unknown(
      "當前受控來源沒有正面列出本批 #584-#613 的 exact Dynamax form；普通版推出或其他批次的 Max roster 不會被回灌。",
    );
  }

  if (variantKey === "GIGANTAMAX") {
    return unknown(
      "目前沒有受控來源確認本批 exact form 的 Gigantamax 版本；普通版或 Dynamax 狀態不會自動升格為 Gigantamax。",
    );
  }

  return unknown("目前沒有受控來源可判定此 exact form 的特殊版本推出狀態。");
}
