import { useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";

export function IconButton({
  icon: Icon,
  label,
  active,
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`icon-button${active ? " is-active" : ""}`}
      title={label}
      aria-label={label}
      aria-pressed={active}
      {...props}
    >
      <Icon size={17} strokeWidth={1.7} />
    </button>
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
        <input
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
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger
        className={`menu-trigger ${className}`}
        aria-label={ariaLabel}
      >
        {label}
        <ChevronDown size={12} />
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content
          className="menu-content"
          sideOffset={6}
          align="start"
          collisionPadding={8}
        >
          {children}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
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
    <Dropdown.Item
      className={`menu-item${danger ? " danger" : ""}`}
      disabled={disabled}
      onSelect={onSelect}
    >
      <span>{children}</span>
      {shortcut && <span className="shortcut">{shortcut}</span>}
    </Dropdown.Item>
  );
}

export function MenuSeparator() {
  return <Dropdown.Separator className="menu-separator" />;
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
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
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
        <input
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
