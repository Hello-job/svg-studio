const DRAFT_KEY = "svg-studio:draft:v1";
export interface Draft {
  name: string;
  svg: string;
}

export function readDraft(): Draft | null {
  const stored = localStorage.getItem(DRAFT_KEY);
  if (!stored) return null;
  const value: unknown = JSON.parse(stored);
  if (
    !value ||
    typeof value !== "object" ||
    !("name" in value) ||
    !("svg" in value) ||
    typeof value.name !== "string" ||
    typeof value.svg !== "string"
  ) {
    throw new Error("本机草稿格式无效，已打开示例文件。");
  }
  return { name: value.name, svg: value.svg };
}

export function saveDraft(draft: Draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}
