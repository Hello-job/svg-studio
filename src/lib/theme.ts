export const THEME_KEY = "svg-studio:theme:v1";

export const THEME_COLORS = [
  { id: "neutral", label: "默认", value: "#e5e5e5" },
  { id: "blue", label: "蓝色", value: "#3b82f6" },
  { id: "violet", label: "紫色", value: "#8b5cf6" },
  { id: "green", label: "绿色", value: "#22c55e" },
  { id: "orange", label: "橙色", value: "#f97316" },
  { id: "rose", label: "玫红", value: "#f43f5e" },
] as const;

type Preset = (typeof THEME_COLORS)[number]["id"];
export type ThemeSettings = { color: Preset | "custom"; customColor: string };
export const DEFAULT_THEME: ThemeSettings = {
  color: "neutral",
  customColor: "#3b82f6",
};

export function normalizeHex(value: string): string | null {
  const hex = value.trim().replace(/^#/, "");
  if (/^[\da-f]{6}$/i.test(hex)) return `#${hex.toLowerCase()}`;
  if (/^[\da-f]{3}$/i.test(hex))
    return `#${[...hex]
      .map((char) => char.repeat(2))
      .join("")
      .toLowerCase()}`;
  return null;
}

export function readTheme(): ThemeSettings {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(THEME_KEY) ?? "null");
    if (!raw || typeof raw !== "object") return DEFAULT_THEME;
    const { color, customColor } = raw as Record<string, unknown>;
    if (
      typeof customColor !== "string" ||
      !normalizeHex(customColor) ||
      (color !== "custom" && !THEME_COLORS.some((item) => item.id === color))
    )
      return DEFAULT_THEME;
    return {
      color: color as ThemeSettings["color"],
      customColor: normalizeHex(customColor)!,
    };
  } catch {
    return DEFAULT_THEME;
  }
}

function luminance(hex: string) {
  const channels = hex
    .slice(1)
    .match(/../g)!
    .map((part) => {
      const value = parseInt(part, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function themeTokens(settings: ThemeSettings) {
  const primary =
    settings.color === "custom"
      ? settings.customColor
      : THEME_COLORS.find((item) => item.id === settings.color)!.value;
  const lightness = luminance(primary);
  // 自动选择黑白文字，避免任意自定义色导致主按钮文字不可读。
  const foreground = lightness > 0.179 ? "#000000" : "#ffffff";
  const highlight =
    lightness < 0.2 ? `color-mix(in srgb, ${primary} 50%, #ffffff)` : primary;
  return {
    "--primary": primary,
    "--primary-foreground":
      settings.color === "neutral" ? "#171717" : foreground,
    "--ring": settings.color === "neutral" ? "#737373" : highlight,
    "--theme-highlight": highlight,
    // 画板通常是白色，浅主题色的选框使用更深的同色调。
    "--selection-color":
      lightness > 0.45
        ? `color-mix(in srgb, ${primary} 55%, #000000)`
        : primary,
  };
}

export function applyTheme(settings: ThemeSettings) {
  document.documentElement.classList.add("dark");
  for (const [property, value] of Object.entries(themeTokens(settings)))
    document.documentElement.style.setProperty(property, value);
}
