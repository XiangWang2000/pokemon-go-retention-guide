import type {
  CandidateReleaseEvidence,
  CandidateReleaseVariantKey,
} from "./gen5-release-494-523";
import { forms644649 } from "./gen5-644-649";

const allFormIds = new Set(forms644649.map((form) => form.id));

export const explicitlyUnreleasedNormalForms644649 = new Set(["648-pirouette"]);
export const releasedNormalForms644649 = new Set(
  forms644649
    .map((form) => form.id)
    .filter((formId) => !explicitlyUnreleasedNormalForms644649.has(formId)),
);

const directNormalSourceByForm644649 = new Map<string, string>([
  ["644-unova", "OFFICIAL-KYUREM-FUSION-RAID-DAY-2026"],
  ["645-incarnate", "OFFICIAL-GOFEST-2026-GLOBAL-SUNDAY-UPDATE"],
  ["645-therian", "OFFICIAL-GOFEST-2026-GLOBAL-SUNDAY-UPDATE"],
  ["646-unova", "OFFICIAL-KYUREM-FUSION-RAID-DAY-2026"],
  ["646-black", "OFFICIAL-KYUREM-FUSION-RAID-DAY-2026"],
  ["646-white", "OFFICIAL-KYUREM-FUSION-RAID-DAY-2026"],
  ["649-unova", "OFFICIAL-GOFEST-2026-GLOBAL-SUNDAY-UPDATE"],
  ["649-shock", "OFFICIAL-GOFEST-2026-GLOBAL-SUNDAY-UPDATE"],
  ["649-burn", "OFFICIAL-GOFEST-2026-GLOBAL-SUNDAY-UPDATE"],
  ["649-chill", "OFFICIAL-GOFEST-2026-GLOBAL-SUNDAY-UPDATE"],
  ["649-douse", "OFFICIAL-GOFEST-2026-GLOBAL-SUNDAY-UPDATE"],
]);

export const releasedShadowForms644649 = new Set(["645-incarnate"]);
export const releasedPurifiedForms644649 = new Set(releasedShadowForms644649);
export const releasedDynamaxForms644649 = new Set<string>();
export const releasedGigantamaxForms644649 = new Set<string>();

function unknown(notesZhTw: string): CandidateReleaseEvidence {
  return {
    status: "UNKNOWN",
    sourceIds: [],
    evidenceMode: "UNKNOWN",
    notesZhTw,
  };
}

export function candidateReleaseEvidence644649(
  formId: string,
  variantKey: CandidateReleaseVariantKey,
): CandidateReleaseEvidence {
  if (!allFormIds.has(formId)) {
    throw new Error(`Unknown Gen5 #644-#649 candidate form: ${formId}.`);
  }

  if (variantKey === "NORMAL") {
    if (explicitlyUnreleasedNormalForms644649.has(formId)) {
      return {
        status: "UNRELEASED",
        sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
        evidenceMode: "EXPLICIT_UNRELEASED",
        notesZhTw:
          "GO Hub 當前合眾 Pokédex 對 Pirouette Forme Meloetta 明確標示 Released: No；PvPoke 即使存在 battle identity 也不能改寫推出狀態。",
      };
    }

    const directSourceId = directNormalSourceByForm644649.get(formId);
    if (directSourceId) {
      return {
        status: "RELEASED",
        sourceIds: [directSourceId],
        evidenceMode: "DIRECT",
        notesZhTw:
          directSourceId === "OFFICIAL-KYUREM-FUSION-RAID-DAY-2026"
            ? "官方 2026 酋雷姆合體團體戰日直接列出捷克羅姆、酋雷姆、闇黑酋雷姆與焰白酋雷姆，並說明酋雷姆與捷克羅姆／萊希拉姆的可逆合體機制。"
            : "官方 Pokémon GO Fest 2026 Global Sunday 更新直接列出土地雲化身／靈獸形態，以及無卡帶與 Burn／Chill／Douse／Shock Drive 蓋諾賽克特。",
      };
    }

    return {
      status: "RELEASED",
      sourceIds: ["SECONDARY-GOHUB-UNOVA-ROSTER-20260904"],
      evidenceMode: "CURRENT_ROSTER",
      notesZhTw:
        "GO Hub 當前合眾 Pokédex 對此 exact Pokémon GO form 明確標示 Released: Yes；凱路迪歐平常／覺悟、美洛耶塔歌聲形態等逐 form 判定，不由同圖鑑其他 form 推導。",
    };
  }

  if (variantKey === "SHADOW") {
    if (releasedShadowForms644649.has(formId)) {
      return {
        status: "RELEASED",
        sourceIds: ["OFFICIAL-STEELED-RESOLVE-TAKEN-OVER-2026"],
        evidenceMode: "DIRECT",
        notesZhTw:
          "官方 Steeled Resolve: Taken Over 明確要求從 Giovanni 手中救出 Shadow Incarnate Forme Landorus；只確認化身形態，不回灌靈獸形態。",
      };
    }
    return unknown(
      "目前沒有本批受控正面證據確認此 exact form 的 Shadow 已推出；PvPoke battle identity、普通版推出或同圖鑑另一 form 都不構成推出證據。",
    );
  }

  if (variantKey === "PURIFIED") {
    if (releasedPurifiedForms644649.has(formId)) {
      const shadow = candidateReleaseEvidence644649(formId, "SHADOW");
      return {
        status: "RELEASED",
        sourceIds: [...shadow.sourceIds, "OFFICIAL-SHADOW-PURIFICATION-MECHANIC"],
        evidenceMode: "MECHANIC_DERIVED",
        notesZhTw:
          "同 exact form 的 Shadow 已確認推出，且官方淨化機制允許 Shadow Pokémon 使用星塵與糖果進行淨化，因此只對化身土地雲推導 Purified 可取得。",
      };
    }
    return unknown("同 exact form 的 Shadow 尚未確認，因此 Purified 不自行推定。");
  }

  if (variantKey === "DYNAMAX") {
    return unknown(
      "目前沒有受控正面證據確認本批 #644-#649 的 exact Dynamax form；普通／融合／特殊 form 推出不會自動推定 Dynamax。",
    );
  }

  if (variantKey === "GIGANTAMAX") {
    return unknown(
      "目前沒有受控正面證據確認本批 #644-#649 的 exact Gigantamax form；Dynamax 與一般推出狀態都不會自動推定 Gigantamax。",
    );
  }

  if (variantKey === "MEGA") {
    return unknown(
      "目前沒有受控來源對本批 #644-#649 的 exact Mega 版本提供明確推出或未推出結論。",
    );
  }

  return unknown("目前沒有受控來源可判定此 exact form 的特殊版本推出狀態。");
}
