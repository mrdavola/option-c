"use client"

import { useState, useMemo } from "react"
import {
  COLOR_PALETTE,
  BODY_TYPES,
  HAIR_STYLES,
  ACCESSORIES,
  EXPRESSIONS,
  DEFAULT_CHARACTER,
  validateCharacterConfig,
  type CharacterConfig,
  type BodyType,
  type HairStyle,
  type Accessory,
  type Expression,
} from "@/lib/character-config"
import { renderCharacterSvg } from "@/lib/character-svg"

// Readable labels
const BODY_LABELS: Record<BodyType, string> = {
  stick: "Stick",
  round: "Round",
  tall: "Tall",
  small: "Small",
}

const HAIR_LABELS: Record<HairStyle, string> = {
  none: "None",
  short: "Short",
  spiky: "Spiky",
  long: "Long",
  curly: "Curly",
  ponytail: "Ponytail",
  mohawk: "Mohawk",
  bun: "Bun",
  cap: "Cap",
  crown: "Crown",
}

const ACCESSORY_LABELS: Record<Accessory, string> = {
  none: "None",
  glasses: "Glasses",
  scarf: "Scarf",
  cape: "Cape",
  crown: "Crown",
  headband: "Headband",
}

const EXPRESSION_LABELS: Record<Expression, string> = {
  happy: "Happy",
  determined: "Determined",
  cool: "Cool",
  silly: "Silly",
}

interface CharacterCreatorProps {
  initial?: Partial<CharacterConfig>
  onSave: (config: CharacterConfig) => void | Promise<void>
  saving?: boolean
}

export function CharacterCreator({
  initial,
  onSave,
  saving = false,
}: CharacterCreatorProps) {
  const [config, setConfig] = useState<CharacterConfig>(() =>
    validateCharacterConfig(initial ?? DEFAULT_CHARACTER)
  )

  const update = <K extends keyof CharacterConfig>(
    key: K,
    value: CharacterConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const svgString = useMemo(() => renderCharacterSvg(config), [config])

  const handleSave = () => {
    onSave(validateCharacterConfig(config))
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Preview */}
      <div className="flex flex-col items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-xl p-6">
        <div
          className="w-32 h-32 flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svgString }}
        />
        {config.name && (
          <p className="text-sm font-[Lexend] text-zinc-300">{config.name}</p>
        )}
      </div>

      {/* Name */}
      <Section title="Name">
        <input
          type="text"
          value={config.name}
          onChange={(e) => update("name", e.target.value.slice(0, 24))}
          placeholder="Give your character a name..."
          maxLength={24}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none font-[Lexend]"
        />
      </Section>

      {/* Body type */}
      <Section title="Body">
        <div className="grid grid-cols-4 gap-2">
          {BODY_TYPES.map((bt) => {
            const preview = renderCharacterSvg({ ...config, body: bt })
            return (
              <OptionButton
                key={bt}
                label={BODY_LABELS[bt]}
                selected={config.body === bt}
                onClick={() => update("body", bt)}
              >
                <div
                  className="w-12 h-12 mx-auto"
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              </OptionButton>
            )
          })}
        </div>
      </Section>

      {/* Color */}
      <Section title="Color">
        <div className="flex flex-wrap gap-2">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => update("color", c)}
              className={`w-9 h-9 rounded-full border-2 transition-all ${
                config.color === c
                  ? "border-blue-500 scale-110"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </Section>

      {/* Hair */}
      <Section title="Hair">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {HAIR_STYLES.map((h) => (
            <OptionButton
              key={h}
              label={HAIR_LABELS[h]}
              selected={config.hair === h}
              onClick={() => update("hair", h)}
              compact
            />
          ))}
        </div>
      </Section>

      {/* Accessory */}
      <Section title="Accessory">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {ACCESSORIES.map((a) => (
            <OptionButton
              key={a}
              label={ACCESSORY_LABELS[a]}
              selected={config.accessory === a}
              onClick={() => update("accessory", a)}
              compact
            />
          ))}
        </div>
      </Section>

      {/* Expression */}
      <Section title="Expression">
        <div className="grid grid-cols-4 gap-2">
          {EXPRESSIONS.map((ex) => (
            <OptionButton
              key={ex}
              label={EXPRESSION_LABELS[ex]}
              selected={config.expression === ex}
              onClick={() => update("expression", ex)}
            />
          ))}
        </div>
      </Section>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-sm font-semibold transition-colors font-[Lexend]"
      >
        {saving ? "Saving..." : "Save Character"}
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 font-[Space_Grotesk]">
        {title}
      </h3>
      {children}
    </div>
  )
}

function OptionButton({
  label,
  selected,
  onClick,
  compact,
  children,
}: {
  label: string
  selected: boolean
  onClick: () => void
  compact?: boolean
  children?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border-2 transition-all text-center ${
        compact ? "px-2 py-1.5" : "p-2"
      } ${
        selected
          ? "border-blue-500 bg-blue-500/10 text-white"
          : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 text-zinc-400"
      }`}
    >
      {children}
      <span className={`block ${compact ? "text-[10px]" : "text-xs"} font-[Lexend]`}>
        {label}
      </span>
    </button>
  )
}
