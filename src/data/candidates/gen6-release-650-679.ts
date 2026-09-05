import type {
  CandidateReleaseEvidence,
  CandidateReleaseVariantKey,
} from "./gen5-release-494-523";
import { forms650679 } from "./gen6-650-679";

const allFormIds = new Set<string>(forms650679.map((form) => form.id));

export const releasedNormalForms650679 = new Set<string>(forms650679.map((form) => form.id));
export const releasedShadowForms650679 = new Set<string>([
  "650-kalos", "651-kalos", "652-kalos",
  "653-kalos", "654-kalos", "655-kalos",
  "656-kalos", "657-kalos", "658-kalos",
  "659-kalos", "660-kalos",
  "661-kalos", "662-kalos", "663-kalos",
]);
export const releasedPurifiedForms650679 = new Set<string>(releasedShadowForms650679);
export const releasedMegaForms650679 = new Set<string>([
  "652-kalos", "655-kalos", "658-kalos",
]);
export const releasedDynamaxForms650679 = new Set<string>();
export const releasedGigantamaxForms650679 = new Set<string>();

function normalSource(formId: string): { sourceId: string; evidenceMode: CandidateReleaseEvidence["evidenceMode"]; note: string } {
  const dex = Number(formId.slice(0, 3));
  if (dex >= 664 && dex <= 666) {
    return {
      sourceId: "SECONDARY-SEREBII-VIVILLON-FORMS-20260905",
      evidenceMode: "CURRENT_ROSTER",
      note: "Serebii 的 Pokémon GO Vivillon 頁面逐一列出本資料模型採用的 18 種明信片花紋；同花紋 Scatterbug→Spewpa→Vivillon 譜系只在自身 lineage 內傳遞，不與其他花紋混用。",
    };
  }
  if (dex >= 669 && dex <= 671) {
    return {
      sourceId: "SECONDARY-SEREBII-FLABEBE-FORMS-20260905",
      evidenceMode: dex === 669 ? "CURRENT_ROSTER" : "EVOLUTION_DERIVED",
      note: dex === 669
        ? "Serebii Pokémon GO 頁面明列紅、黃、橙、藍、白五種花色皆為現行 Pokémon GO form；每一色獨立判定。"
        : "同色 Flabébé 已確認可取得，且本 candidate 的同色進化鏈已由 identity gate 固定；只沿同色 lineage 推導 Floette／Florges，不跨色借值。",
    };
  }
  if (dex === 676) {
    return {
      sourceId: "SECONDARY-SEREBII-FURFROU-FORMS-20260905",
      evidenceMode: "CURRENT_ROSTER",
      note: "Serebii Pokémon GO Form Change／Furfrou 頁面列出 Natural、Heart 與所有地區 Trim 的現行取得條件，因此十種造型逐 exact form 視為已推出。",
    };
  }
  return {
    sourceId: "SECONDARY-GOHUB-KALOS-ROSTER-20260905",
    evidenceMode: "CURRENT_ROSTER",
    note: "Pokémon GO Hub 2026-09-05 當前 Kalos Pokédex 明確標示此 ordinary／gender exact identity 為 Released: Yes。",
  };
}

function unknown(notesZhTw: string): CandidateReleaseEvidence {
  return { status: "UNKNOWN", sourceIds: [], evidenceMode: "UNKNOWN", notesZhTw };
}

export function candidateReleaseEvidence650679(
  formId: string,
  variantKey: CandidateReleaseVariantKey,
): CandidateReleaseEvidence {
  if (!allFormIds.has(formId)) throw new Error(`Unknown Gen6 #650-#679 candidate form: ${formId}.`);

  if (variantKey === "NORMAL") {
    const source = normalSource(formId);
    return {
      status: "RELEASED",
      sourceIds: [source.sourceId],
      evidenceMode: source.evidenceMode,
      notesZhTw: source.note,
    };
  }

  if (variantKey === "SHADOW") {
    if (releasedShadowForms650679.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-SEREBII-SHADOW-ROSTER-20260905"],
        evidenceMode: "CURRENT_ROSTER",
        notesZhTw: "Serebii 當前 Available Shadow Pokémon roster 明列此 exact ordinary form／其 Shadow 進化鏈；只確認 roster 中實際列出的 Kalos form。",
      };
    }
    return unknown("目前 Shadow roster 沒有本 exact form 的正面推出證據；PvPoke 的 Shadow battle identity 不能用來推定推出狀態。");
  }

  if (variantKey === "PURIFIED") {
    if (releasedPurifiedForms650679.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-SEREBII-SHADOW-ROSTER-20260905", "OFFICIAL-SHADOW-PURIFICATION-MECHANIC"],
        evidenceMode: "MECHANIC_DERIVED",
        notesZhTw: "只從同 exact form 已確認推出的 Shadow 加上官方淨化機制推導 Purified；不從普通版或其他 form 推導。",
      };
    }
    return unknown("同 exact form 的 Shadow 尚無正面推出證據，因此 Purified 維持 UNKNOWN。");
  }

  if (variantKey === "MEGA") {
    if (releasedMegaForms650679.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["SECONDARY-GOHUB-KALOS-ROSTER-20260905"],
        evidenceMode: "CURRENT_ROSTER",
        notesZhTw: "Pokémon GO Hub 當前 Kalos Pokédex 明列對應 Mega Evolution 為 Released: Yes。",
      };
    }
    return unknown("目前沒有足夠 exact-form 正面或明確否定證據可把此 base identity 的 Mega 狀態定為 RELEASED／UNRELEASED；species-level Mega 列不跨 gender／flower form 回灌。");
  }

  if (variantKey === "DYNAMAX") {
    return unknown("本批 #650-#679 沒有受控正面證據確認 exact Dynamax form；普通版推出不會自動推定 Dynamax。");
  }

  if (variantKey === "GIGANTAMAX") {
    return unknown("本批沒有受控正面證據確認 exact Gigantamax form；未出現在 roster 不等於 UNRELEASED。");
  }

  return unknown("目前沒有受控來源可判定此 exact form 的特殊版本推出狀態。");
}
