import { useState } from "react";
import { Check, Palette, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  applyTheme,
  DEFAULT_THEME,
  normalizeHex,
  readTheme,
  THEME_COLORS,
  THEME_KEY,
} from "../lib/theme";
import type { ThemeSettings as Preferences } from "../lib/theme";

export function ThemeSettings() {
  const [settings, setSettings] = useState(readTheme);
  const [hex, setHex] = useState(settings.customColor);
  const [invalid, setInvalid] = useState(false);
  const [persistent, setPersistent] = useState(true);

  const update = (next: Preferences) => {
    setSettings(next);
    setInvalid(false);
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify(next));
      setPersistent(true);
    } catch {
      setPersistent(false);
    }
  };
  const commitHex = () => {
    const next = normalizeHex(hex);
    if (!next) {
      setInvalid(true);
      return;
    }
    setHex(next);
    update({ color: "custom", customColor: next });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="外观设置"
          title="外观设置"
        >
          <Palette />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        aria-label="外观设置"
        className="z-[150] w-72 max-w-[calc(100vw-24px)] space-y-4"
        onKeyDown={(event) => event.stopPropagation()}
      >
        <div className="space-y-1">
          <h2 className="text-sm font-medium">外观设置</h2>
          <p className="text-xs text-muted-foreground">调整编辑器的主题色。</p>
        </div>
        <fieldset className="space-y-2">
          <legend className="mb-2 text-xs text-muted-foreground">主题色</legend>
          <div className="grid grid-cols-3 gap-2">
            {THEME_COLORS.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                size="sm"
                aria-pressed={settings.color === item.id}
                className="justify-start px-2 text-xs aria-pressed:border-ring"
                onClick={() => update({ ...settings, color: item.id })}
              >
                <span
                  className="flex size-3.5 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: item.value }}
                >
                  {settings.color === item.id && (
                    <Check className="size-2.5 text-black" />
                  )}
                </span>
                {item.label}
              </Button>
            ))}
          </div>
        </fieldset>
        <div className="space-y-2">
          <label htmlFor="theme-hex" className="text-xs text-muted-foreground">
            自定义颜色
          </label>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              commitHex();
            }}
          >
            <input
              type="color"
              aria-label="选择自定义主题色"
              className="theme-color-picker h-8 w-8 shrink-0 rounded-md border border-input bg-transparent p-1"
              value={settings.customColor}
              onChange={(event) => {
                setHex(event.target.value);
                update({ color: "custom", customColor: event.target.value });
              }}
            />
            <Input
              id="theme-hex"
              value={hex}
              className="h-8 font-mono text-xs"
              spellCheck={false}
              autoComplete="off"
              maxLength={7}
              aria-invalid={invalid}
              aria-describedby={invalid ? "theme-hex-error" : undefined}
              onChange={(event) => {
                setHex(event.target.value);
                setInvalid(false);
              }}
            />
            <Button type="submit" variant="secondary" size="sm">
              应用
            </Button>
          </form>
          {invalid && (
            <p
              id="theme-hex-error"
              role="alert"
              className="text-xs text-destructive"
            >
              请输入有效的 HEX 色值，如 #3b82f6。
            </p>
          )}
        </div>
        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-xs text-muted-foreground">
            {persistent ? "设置保存在此浏览器" : "存储不可用，仅本次生效"}
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setHex(DEFAULT_THEME.customColor);
              update(DEFAULT_THEME);
            }}
          >
            <RotateCcw />
            重置
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
