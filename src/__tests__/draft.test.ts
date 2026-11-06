import { beforeEach, describe, expect, it } from "vitest";
import { readDraft, saveDraft } from "../editor/draft";
describe("本机草稿", () => {
  beforeEach(() => localStorage.clear());
  it("保存并还原文件名和矢量内容", () => {
    const draft = {
      name: "设计.svg",
      svg: '<svg xmlns="http://www.w3.org/2000/svg"/>',
    };
    saveDraft(draft);
    expect(readDraft()).toEqual(draft);
  });
  it("未保存时返回空值，损坏草稿交给调用方显示错误", () => {
    expect(readDraft()).toBeNull();
    localStorage.setItem("svg-studio:draft:v1", '{"name":42,"svg":false}');
    expect(() => readDraft()).toThrow();
  });
});
