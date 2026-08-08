const REPLACEMENT_CHARACTER = String.fromCharCode(0xfffd);
const QUESTION_MARK_RUN = /\?{2,}/;
const URL_PATH = /(?:^|\.)(?:sourceUrl|url|href)$/i;
const VISIBLE_KEY = /(?:ZhTw|name|title|summary|note|method|availability|conclusion|strategy|reason|description|message|action|target|formName|alias|label|detail|review|pve|pvp|gym|mega|max|rocket|evolution|family|member|status|supports|text|scope)/i;

export interface TextIntegrityIssue {
  path: string;
  value: string;
}

export function findTextIntegrityIssues(value: unknown, path = "$", visible = false): TextIntegrityIssue[] {
  const issues: TextIntegrityIssue[] = [];
  const visit = (current: unknown, currentPath: string, isVisible: boolean) => {
    if (typeof current === "string") {
      if (URL_PATH.test(currentPath)) return;
      if (current.includes(REPLACEMENT_CHARACTER) || QUESTION_MARK_RUN.test(current)) {
        issues.push({ path: currentPath, value: current });
      }
      return;
    }
    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, `${currentPath}[${index}]`, isVisible));
      return;
    }
    if (current && typeof current === "object") {
      for (const [key, item] of Object.entries(current)) {
        const childPath = `${currentPath}.${key}`;
        visit(item, childPath, isVisible || VISIBLE_KEY.test(key));
      }
    }
  };
  visit(value, path, visible);
  return issues;
}

export function assertNoTextIntegrityIssues(value: unknown, label: string) {
  const issues = findTextIntegrityIssues(value);
  if (issues.length) {
    const sample = issues.slice(0, 8).map((issue) => `${issue.path}: ${issue.value}`).join("\n");
    throw new Error(`${label} contains corrupted text fields (${issues.length}):\n${sample}`);
  }
}
