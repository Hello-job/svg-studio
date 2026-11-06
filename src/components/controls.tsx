import { useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { NativeSelect } from "./ui/native-select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "./ui/dropdown-menu";
import { cn } from "../lib/utils";

export function IconButton({
  icon: Icon,
  label,
  active,
  className,
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(
        "icon-button text-muted-foreground",
        active &&
          "is-active bg-primary/15 text-[var(--theme-highlight)] hover:bg-primary/20 hover:text-[var(--theme-highlight)]",
        className,
      )}
      title={label}
      aria-label={label}
      aria-pressed={active}
      {...props}
    >
      <Icon size={17} strokeWidth={1.7} />
    </Button>
  );
}

export function NumberField({
  label,
  value,
  onCommit,
  suffix,
  min,
  max,
  disabled,
}: {
  label: string;
  value: number;
  onCommit(value: number): void;
  suffix?: string;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const cancelled = useRef(false);
  const display = Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;
  const commit = () => {
    if (cancelled.current) {
      cancelled.current = false;
      setDraft(null);
      return;
    }
    if (draft === null) return;
    const next = Number(draft);
    if (
      draft.trim() &&
      Number.isFinite(next) &&
      (min === undefined || next >= min) &&
      (max === undefined || next <= max)
    )
      onCommit(next);
    setDraft(null);
  };
  return (
    <label className={`number-field${disabled ? " is-disabled" : ""}`}>
      <span>{label}</span>
      <div>
        <Input
          className="h-full rounded-none border-0 bg-transparent px-2 text-[13px] shadow-none focus-visible:ring-0 dark:bg-transparent"
          type="number"
          step="1"
          aria-label={label}
          value={draft ?? display}
          disabled={disabled}
          min={min}
          max={max}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
            if (e.key === "Escape") {
              cancelled.current = true;
              e.currentTarget.blur();
            }
          }}
        />
        {suffix && <span className="field-unit">{suffix}</span>}
      </div>
    </label>
  );
}

export function Menu({
  label,
  children,
  className = "",
  ariaLabel,
  iconOnly = false,
  side = "bottom",
  contentClassName,
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  iconOnly?: boolean;
  side?: ComponentProps<typeof DropdownMenuContent>["side"];
  contentClassName?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={className === "export-trigger" ? "outline" : "ghost"}
          size={iconOnly ? "icon-xs" : "sm"}
          className={cn(
            iconOnly
              ? "menu-icon-trigger p-0"
              : "menu-trigger max-sm:gap-1 max-sm:px-1.5 max-sm:text-xs max-sm:has-[>svg]:px-1.5",
            className,
          )}
          aria-label={ariaLabel}
        >
          {label}
          {!iconOnly && <ChevronDown className="size-3" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn("z-[100] min-w-[210px]", contentClassName)}
        side={side}
        sideOffset={6}
        align="start"
        collisionPadding={8}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MenuItem({
  children,
  shortcut,
  onSelect,
  disabled,
  danger,
}: {
  children: ReactNode;
  shortcut?: string;
  onSelect(): void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <DropdownMenuItem
      className="justify-between gap-6"
      variant={danger ? "destructive" : "default"}
      disabled={disabled}
      onSelect={onSelect}
    >
      <span className="flex min-w-0 items-center gap-2 whitespace-nowrap">
        {children}
      </span>
      {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
    </DropdownMenuItem>
  );
}

export function MenuSeparator() {
  return <DropdownMenuSeparator />;
}

export function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  children: ReactNode;
}) {
  return (
    <NativeSelect
      size="sm"
      className="h-[30px] px-2 py-1 pr-7 text-xs"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </NativeSelect>
  );
}

function asHex(value: string) {
  if (/^#[\da-f]{6}$/i.test(value)) return value;
  const rgb = value.match(/^rgb\((\d+),?\s+(\d+),?\s+(\d+)\)/);
  if (rgb)
    return (
      "#" +
      rgb
        .slice(1)
        .map((number) => Number(number).toString(16).padStart(2, "0"))
        .join("")
    );
  return "#000000";
}

export function ColorField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: string;
  onCommit(value: string): void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <div className="color-field">
      <span>{label}</span>
      <div className="color-control">
        <label
          className={`color-swatch${value === "none" ? " no-color" : ""}`}
          style={{ backgroundColor: value === "none" ? "transparent" : value }}
          title={`选择${label}颜色`}
        >
          <input
            type="color"
            aria-label={`${label}颜色`}
            value={asHex(value)}
            onChange={(e) => onCommit(e.target.value)}
          />
        </label>
        <Input
          className="h-full rounded-none border-0 bg-transparent p-0 text-xs shadow-none focus-visible:ring-0 dark:bg-transparent"
          aria-label={`${label}色值`}
          value={draft ?? value.toUpperCase()}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            if (draft && (draft === "none" || CSS.supports("color", draft)))
              onCommit(draft);
            setDraft(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
        <button
          aria-label={`移除${label}`}
          title={`无${label}`}
          className="none-button"
          onClick={() => onCommit("none")}
        >
          ∅
        </button>
      </div>
    </div>
  );
}
