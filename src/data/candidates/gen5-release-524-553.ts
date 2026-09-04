import type {
  CandidateReleaseEvidence,
  CandidateReleaseVariantKey,
} from "./gen5-release-494-523";
import { forms524553 } from "./gen5-524-553";

const allFormIds = new Set(forms524553.map((form) => form.id));

export const releasedNormalForms524553 = new Set(forms524553.map((form) => form.id));

export const releasedShadowForms524553 = new Set([
  "524-unova",
  "525-unova",
  "526-unova",
  "529-unova",
  "530-unova",
  "532-unova",
  "533-unova",
  "534-unova",
  "538-unova",
  "539-unova",
  "543-unova",
  "544-unova",
  "545-unova",
]);

export const releasedPurifiedForms524553 = new Set(releasedShadowForms524553);

export const releasedDynamaxForms524553 = new Set([
  "524-unova",
  "525-unova",
  "526-unova",
  "527-unova",
  "528-unova",
  "529-unova",
  "530-unova",
]);

export const releasedMegaForms524553 = new Set(["531-unova"]);
export const explicitlyUnreleasedMegaForms524553 = new Set(["530-unova", "545-unova"]);

function unknown(notesZhTw: string): CandidateReleaseEvidence {
  return {
    status: "UNKNOWN",
    sourceIds: [],
    evidenceMode: "UNKNOWN",
    notesZhTw,
  };
}

export function candidateReleaseEvidence524553(
  formId: string,
  variantKey: CandidateReleaseVariantKey,
): CandidateReleaseEvidence {
  if (!allFormIds.has(formId)) {
    throw new Error(`Unknown Gen5 #524-#553 candidate form: ${formId}.`);
  }

  if (variantKey === "NORMAL") {
    return {
      status: "RELEASED",
      sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
      evidenceMode: "CURRENT_ROSTER",
      notesZhTw:
        "GO Hub 當前合眾 Pokédex 對此 exact Pokémon GO form 明確標示 Released: Yes；包含普通／洗翠裙兒小姐與野蠻鱸魚各條紋型態。",
    };
  }

  if (variantKey === "SHADOW") {
    if (releasedShadowForms524553.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds:
          formId === "526-unova"
            ? [
                "SECONDARY-SEREBII-SHADOW-ROSTER-20260904",
                "SECONDARY-SEREBII-GALAR-EXPEDITION-TAKEN-OVER-2024",
              ]
            : ["SECONDARY-SEREBII-SHADOW-ROSTER-20260904"],
        evidenceMode: "CURRENT_ROSTER",
        notesZhTw:
          formId === "526-unova"
            ? "Serebii 目前 Shadow 名單與 2024 Galarian Expedition: Taken Over 活動資料共同確認 Shadow Gigalith。"
            : "Serebii 目前 Shadow 名單明列此 exact form；只採正面列名，不把缺席推成未推出。",
      };
    }
    return unknown(
      "目前沒有本批受控正面證據確認此 exact form 的 Shadow 已推出；名單缺席保持 UNKNOWN。",
    );
  }

  if (variantKey === "PURIFIED") {
    if (releasedPurifiedForms524553.has(formId)) {
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
    if (releasedDynamaxForms524553.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
        evidenceMode: "CURRENT_ROSTER",
        notesZhTw:
          "GO Hub 當前合眾 Pokédex 對此 exact Dynamax form 明確標示 Released: Yes；Max 推出狀態與普通版本分開保存。",
      };
    }
    return unknown(
      "當前受控來源沒有明確確認此 exact form 的 Dynamax 版本；不因同家族或其他版本已推出而回灌。",
    );
  }

  if (variantKey === "MEGA") {
    if (releasedMegaForms524553.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["OFFICIAL-MEGA-AUDINO-RAID-DAY-2025"],
        evidenceMode: "DIRECT",
        notesZhTw: "Pokémon GO 官方公告確認 Mega Audino 於 2025-04-05 團體戰日首度登場。",
      };
    }
    if (explicitlyUnreleasedMegaForms524553.has(formId)) {
      return {
        status: "UNRELEASED",
        sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
        evidenceMode: "EXPLICIT_UNRELEASED",
        notesZhTw:
          formId === "530-unova"
            ? "GO Hub 當前合眾 Pokédex 對 Mega Excadrill 明確標示 Released: No。"
            : "GO Hub 當前合眾 Pokédex 對 Mega Scolipede 明確標示 Released: No。",
      };
    }
    return unknown("目前沒有受控來源對此 form 的 Mega 版本提供明確推出或未推出結論。");
  }

  return unknown(
    "目前沒有受控來源對此 exact form 的 Gigantamax 版本提供明確推出狀態；不由物種、Dynamax 或其他版本推定。",
  );
}
