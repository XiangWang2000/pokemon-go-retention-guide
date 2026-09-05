import type {
  CandidateReleaseEvidence,
  CandidateReleaseVariantKey,
} from "./gen5-release-494-523";
import { forms680709 } from "./gen6-680-709";

const allFormIds = new Set<string>(forms680709.map((form) => form.id));

export const explicitlyUnreleasedNormalForms680709 = new Set<string>(["706-hisui"]);
export const unknownNormalForms680709 = new Set<string>(["705-hisui"]);
export const releasedNormalForms680709 = new Set<string>(
  forms680709
    .map((form) => form.id)
    .filter((id) => !explicitlyUnreleasedNormalForms680709.has(id) && !unknownNormalForms680709.has(id)),
);
export const releasedShadowForms680709 = new Set<string>([
  "686-kalos", "687-kalos",
  "694-kalos", "695-kalos",
  "696-kalos", "697-kalos",
  "698-kalos", "699-kalos",
]);
export const releasedPurifiedForms680709 = new Set<string>(releasedShadowForms680709);
export const releasedMegaForms680709 = new Set<string>(["687-kalos"]);
export const explicitlyUnreleasedMegaForms680709 = new Set<string>([
  "689-kalos", "691-kalos", "701-kalos",
]);
export const releasedDynamaxForms680709 = new Set<string>([
  "686-kalos", "687-kalos", "700-kalos",
]);
export const releasedGigantamaxForms680709 = new Set<string>();

function unknown(notesZhTw: string): CandidateReleaseEvidence {
  return { status: "UNKNOWN", sourceIds: [], evidenceMode: "UNKNOWN", notesZhTw };
}

export function candidateReleaseEvidence680709(
  formId: string,
  variantKey: CandidateReleaseVariantKey,
): CandidateReleaseEvidence {
  if (!allFormIds.has(formId)) throw new Error(`Unknown Gen6 #680-#709 candidate form: ${formId}.`);

  if (variantKey === "NORMAL") {
    if (explicitlyUnreleasedNormalForms680709.has(formId)) {
      return {
        status: "UNRELEASED",
        sourceIds: ["SECONDARY-GOHUB-HISUIAN-GOODRA-UNRELEASED-20260905"],
        evidenceMode: "EXPLICIT_UNRELEASED",
        notesZhTw: "Pokémon GO Hub 的 Hisuian Goodra exact page 明確顯示 Pokémon not available yet，因此只把 #706 Hisuian Goodra 設為 UNRELEASED；不反向推定 #705 Hisuian Sliggoo。",
      };
    }
    if (unknownNormalForms680709.has(formId)) {
      return unknown("Hisuian Sliggoo 在資料來源中有 form identity／battle stats，但目前缺少足以證明已推出或明確未推出的 exact release evidence，因此維持 UNKNOWN。");
    }
    return {
      status: "RELEASED",
      sourceIds: ["SECONDARY-GOHUB-KALOS-ROSTER-20260905"],
      evidenceMode: "CURRENT_ROSTER",
      notesZhTw: formId.startsWith("681-")
        ? "Pokémon GO Hub 2026-09-05 Kalos Pokédex 分別列出 Aegislash Shield Forme 與 Sword/Blade Forme 為 Released: Yes；兩姿態逐 form 判定。"
        : "Pokémon GO Hub 2026-09-05 當前 Kalos Pokédex 明確標示此 ordinary form 為 Released: Yes。",
    };
  }

  if (variantKey === "SHADOW") {
    if (releasedShadowForms680709.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-SEREBII-SHADOW-ROSTER-20260905"],
        evidenceMode: "CURRENT_ROSTER",
        notesZhTw: "Serebii 當前 Available Shadow Pokémon roster 正面列出此 ordinary form／其 Shadow evolution；不把 pinned battle identity 當成 release evidence。",
      };
    }
    return unknown("Shadow roster 未提供本 exact form 的正面推出證據，因此維持 UNKNOWN。");
  }

  if (variantKey === "PURIFIED") {
    if (releasedPurifiedForms680709.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-SEREBII-SHADOW-ROSTER-20260905", "OFFICIAL-SHADOW-PURIFICATION-MECHANIC"],
        evidenceMode: "MECHANIC_DERIVED",
        notesZhTw: "Purified 只從同 exact form 已確認 Shadow 加官方淨化機制推導。",
      };
    }
    return unknown("同 exact form Shadow 尚未確認，Purified 不自行推定。");
  }

  if (variantKey === "MEGA") {
    if (releasedMegaForms680709.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-GOHUB-KALOS-ROSTER-20260905", "SECONDARY-SEREBII-GOTOUR-KALOS-2026"],
        evidenceMode: "CURRENT_ROSTER",
        notesZhTw: "GO Tour: Kalos 2026 已推出 Mega Malamar，且當前 Kalos roster 明列 Mega Malamar Released: Yes。",
      };
    }
    if (explicitlyUnreleasedMegaForms680709.has(formId)) {
      return {
        status: "UNRELEASED",
        sourceIds: ["SECONDARY-GOHUB-KALOS-ROSTER-20260905"],
        evidenceMode: "EXPLICIT_UNRELEASED",
        notesZhTw: "Pokémon GO Hub 當前 Kalos roster 對此對應 Mega Evolution 明確標示 Released: No；只寫入能直接對應 ordinary exact base form 的項目。",
      };
    }
    return unknown("目前沒有可安全綁到此 exact base form 的 Mega release 結論；不把其他 form 或 species-level 模糊條目回灌。");
  }

  if (variantKey === "DYNAMAX") {
    if (releasedDynamaxForms680709.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-GOHUB-KALOS-ROSTER-20260905"],
        evidenceMode: "CURRENT_ROSTER",
        notesZhTw: "Pokémon GO Hub 當前 Kalos Pokédex 明列對應 Dynamax identity 為 Released: Yes；Inkay、Malamar、Sylveon 分別記錄。",
      };
    }
    return unknown("目前沒有本 exact form 的正面 Dynamax release evidence；普通版可取得不代表可 Dynamax。");
  }

  if (variantKey === "GIGANTAMAX") {
    return unknown("本批沒有受控正面 Gigantamax release evidence；roster absence 不作為 UNRELEASED 證據。");
  }

  return unknown("目前沒有受控來源可判定此 exact form 的特殊版本推出狀態。");
}
