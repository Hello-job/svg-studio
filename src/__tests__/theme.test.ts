import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_THEME,
  normalizeHex,
  readTheme,
  THEME_KEY,
  themeTokens,
} from "../lib/theme";

afterEach(() => {
  localStorage.removeItem(THEME_KEY);
  vi.restoreAllMocks();
});

describe("主题偏好", () => {
  it("只接受完整 HEX 颜色，支持缩写和大小写", () => {
    expect(normalizeHex(" #AbC ")).toBe("#aabbcc");
    expect(normalizeHex("FF8800")).toBe("#ff8800");
    for (const value of ["red", "#1234", "url(test)", "#12345g", ""])
      expect(normalizeHex(value)).toBeNull();
  });

  it("恢复自定义主题，不读取或覆盖文档草稿", () => {
    localStorage.setItem("svg-studio:draft:v1", "existing artwork");
    localStorage.setItem(
      THEME_KEY,
      JSON.stringify({ color: "custom", customColor: "#ABC" }),
    );
    expect(readTheme()).toEqual({ color: "custom", customColor: "#aabbcc" });
    expect(localStorage.getItem("svg-studio:draft:v1")).toBe(
      "existing artwork",
    );
    localStorage.removeItem("svg-studio:draft:v1");
  });

  it("损坏、未知主题和无效颜色都回到默认主题", () => {
    for (const value of [
      "not json",
      "null",
      '{"color":"unknown","customColor":"#123456"}',
      '{"color":"custom","customColor":"red"}',
    ]) {
      localStorage.setItem(THEME_KEY, value);
      expect(readTheme()).toEqual(DEFAULT_THEME);
    }
  });

  it("浏览器禁止存储时也能打开编辑器", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readTheme()).toEqual(DEFAULT_THEME);
  });

  it("深浅自定义色采用可读的主按钮文字", () => {
    expect(
      themeTokens({ color: "custom", customColor: "#ffffff" })[
        "--primary-foreground"
      ],
    ).toBe("#000000");
    expect(
      themeTokens({ color: "custom", customColor: "#000000" })[
        "--primary-foreground"
      ],
    ).toBe("#ffffff");
    expect(
      themeTokens({ color: "custom", customColor: "#000000" })["--ring"],
    ).not.toBe("#000000");
    expect(themeTokens(DEFAULT_THEME)["--primary"]).toBe("#e5e5e5");
  });
});
