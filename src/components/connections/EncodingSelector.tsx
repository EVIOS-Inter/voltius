import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import { PickerSurface } from "@/components/shared/PickerSurface";

const ENCODING_GROUPS: { groupKey: string; options: string[] }[] = [
  { groupKey: "unicode", options: ["utf-16le", "utf-16be"] },
  { groupKey: "westernEuropean", options: ["iso-8859-1", "iso-8859-15", "windows-1252"] },
  { groupKey: "centralEuropean", options: ["iso-8859-2", "windows-1250"] },
  { groupKey: "cyrillic", options: ["iso-8859-5", "koi8-r", "koi8-u", "windows-1251", "ibm866"] },
  { groupKey: "greek", options: ["iso-8859-7", "windows-1253"] },
  { groupKey: "hebrew", options: ["iso-8859-8", "windows-1255"] },
  { groupKey: "arabic", options: ["iso-8859-6", "windows-1256"] },
  { groupKey: "turkish", options: ["iso-8859-9", "windows-1254"] },
  { groupKey: "baltic", options: ["iso-8859-13", "windows-1257"] },
  { groupKey: "vietnamese", options: ["windows-1258"] },
  { groupKey: "chineseSimplified", options: ["gbk", "gb18030"] },
  { groupKey: "chineseTraditional", options: ["big5"] },
  { groupKey: "japanese", options: ["shift-jis", "euc-jp"] },
  { groupKey: "korean", options: ["euc-kr"] },
];

const ALL_OPTION_VALUES = ENCODING_GROUPS.flatMap((g) => g.options);

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function EncodingSelector({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const optionLabel = (val: string) => t(`connections.encodingSelector.options.${val}`);
  const selectedLabel = value
    ? (ALL_OPTION_VALUES.includes(value) ? optionLabel(value) : value)
    : t("connections.encodingSelector.utf8Default");

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors"
        style={{
          background: "var(--t-bg-base)",
          border: "1px solid var(--t-border)",
          color: value ? "var(--t-text-primary)" : "var(--t-text-dim)",
        }}
      >
        <Icon icon="lucide:binary" width={14} className="text-(--t-text-dim) shrink-0" />
        <span className="flex-1 text-left truncate text-xs">{selectedLabel}</span>
        <span className="[&_path]:stroke-[2.5]">
          <Icon
            icon="lucide:chevron-down"
            width={14}
            className="text-(--t-text-dim) shrink-0"
            style={{ transition: "transform 150ms", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </span>
      </button>

      <PickerSurface open={open} onClose={() => setOpen(false)} anchorRef={buttonRef} title={t("connections.encodingSelector.title")}>
        {/* UTF-8 default */}
        <OptionButton
          icon="lucide:binary"
          label={t("connections.encodingSelector.utf8Default")}
          selected={!value}
          onClick={() => { onChange(""); setOpen(false); }}
        />

        {ENCODING_GROUPS.map((group) => (
          <div key={group.groupKey}>
            <div className="my-1 border-t border-t-(--t-bg-card-hover)" />
            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-(--t-text-dim)">
              {t(`connections.encodingSelector.groups.${group.groupKey}`)}
            </p>
            {group.options.map((opt) => (
              <OptionButton
                key={opt}
                icon="lucide:binary"
                label={optionLabel(opt)}
                selected={value === opt}
                onClick={() => { onChange(opt); setOpen(false); }}
              />
            ))}
          </div>
        ))}
      </PickerSurface>
    </div>
  );
}

function OptionButton({ icon, label, selected, onClick }: { icon: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors w-full"
      style={{ color: selected ? "var(--t-accent)" : "var(--t-text-secondary)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--t-bg-card-hover)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
    >
      <Icon icon={icon} width={13} className="shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      {selected && (
        <span className="[&_path]:stroke-[2.5]">
          <Icon icon="lucide:check" width={13} />
        </span>
      )}
    </button>
  );
}
