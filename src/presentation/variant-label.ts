import { zhTw } from "../locales/zh-TW";

export function isPrimalFormId(formId: string | null | undefined) {
  return formId === "382-hoenn" || formId === "383-hoenn";
}

export function primalNameZhTw(formId: string | null | undefined) {
  if (formId === "382-hoenn") return "原始蓋歐卡";
  if (formId === "383-hoenn") return "原始固拉多";
  return "原始回歸";
}

export function variantLabelZhTw(variantKey: string, formId?: string | null) {
  if (variantKey === "MEGA" && isPrimalFormId(formId)) return primalNameZhTw(formId);
  return zhTw.variant[variantKey as keyof typeof zhTw.variant] ?? variantKey;
}

export function variantShortLabelZhTw(variantKey: string, formId?: string | null) {
  if (variantKey === "MEGA" && isPrimalFormId(formId)) return "原始回歸";
  return variantLabelZhTw(variantKey, formId);
}
