/** @jsxImportSource preact */
/**
 * The single generic calculator widget (PLAN §1). One island powers every
 * calculator. SSR-computed initial output renders immediately (no CLS, SEO
 * sees numbers), then lazy-loads THIS calculator's pure compute() — code-split
 * per calculator — to recompute live as inputs change.
 */
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import type {
  CalcResult,
  ComparisonResult,
  ComputeCtx,
  InputSpec,
  InputValues,
} from "../calculators/_types";
import { isComparisonResult } from "../calculators/_types";
import {
  COUNTRY_SEARCH_NAME,
  countriesFor,
  getCountry,
  type CountryCode,
} from "../lib/countries";
import { getPlatform } from "../config/platforms";
import { formatCurrency, formatNumber, formatPercent } from "../lib/money";

type CalcOutput = CalcResult | ComparisonResult;
type ComputeFn = (values: InputValues, ctx: ComputeCtx) => CalcOutput;

const configModules = import.meta.glob("../calculators/*/config.ts");

interface Props {
  slug: string;
  inputs: InputSpec[];
  initialResult: CalcOutput;
  countryCodes?: CountryCode[];
  initialCountry: CountryCode;
}

interface Option {
  value: string;
  label: string;
  search?: string;
}

function makeCtx(country: CountryCode): ComputeCtx {
  return {
    country,
    formatCurrency: (v, opts) => formatCurrency(v, country, opts),
    formatPercent: (v, dp) => formatPercent(v, dp),
    formatNumber: (v, dp) => formatNumber(v, country, dp),
  };
}

function defaultValues(inputs: InputSpec[]): InputValues {
  const v: InputValues = {};
  for (const i of inputs) v[i.id] = i.default;
  return v;
}

export default function CalculatorIsland({
  slug,
  inputs,
  initialResult,
  countryCodes,
  initialCountry,
}: Props) {
  const [values, setValues] = useState<InputValues>(() => defaultValues(inputs));
  const [country, setCountry] = useState<CountryCode>(initialCountry);
  const [compute, setCompute] = useState<ComputeFn | null>(null);
  const [result, setResult] = useState<CalcOutput>(initialResult);

  const countryOptions = useMemo<Option[]>(
    () =>
      (countryCodes ? countriesFor(countryCodes) : []).map((c) => ({
        value: c.code,
        label: `${c.name} (${c.currency})`,
        search: `${c.name} ${c.code} ${c.currency} ${COUNTRY_SEARCH_NAME[c.code] ?? ""}`,
      })),
    [countryCodes],
  );

  const currencySymbol = useMemo(() => {
    try {
      const c = getCountry(country);
      const parts = new Intl.NumberFormat(c.locale, {
        style: "currency",
        currency: c.currency,
      }).formatToParts(0);
      return parts.find((p) => p.type === "currency")?.value ?? "$";
    } catch {
      return "$";
    }
  }, [country]);

  async function ensureCompute(): Promise<ComputeFn | null> {
    if (compute) return compute;
    const entry = Object.entries(configModules).find(([path]) =>
      path.includes(`/${slug}/config`),
    );
    if (!entry) return null;
    const mod = (await entry[1]()) as Record<string, unknown>;
    const cfg = Object.values(mod).find(
      (v): v is { compute: ComputeFn } =>
        Boolean(v) && typeof (v as any).compute === "function",
    );
    const fn = cfg?.compute ?? null;
    if (fn) setCompute(() => fn);
    return fn;
  }

  async function recompute(nextValues: InputValues, nextCountry: CountryCode) {
    const fn = await ensureCompute();
    if (!fn) return;
    setResult(fn(nextValues, makeCtx(nextCountry)));
  }

  function onInput(id: string, raw: number | string | boolean) {
    const next = { ...values, [id]: raw };
    setValues(next);
    void recompute(next, country);
  }

  function onCountry(code: string) {
    const cc = code as CountryCode;
    setCountry(cc);
    void recompute(values, cc);
  }

  return (
    <div class="grid gap-4 md:grid-cols-2 md:items-start" data-slug={slug}>
      <form
        class="card flex flex-col gap-4 p-5"
        onSubmit={(e) => e.preventDefault()}
      >
        {countryOptions.length > 1 && (
          <label class="flex flex-col gap-1.5">
            <span class="text-[13px] font-medium text-ink">Country / region</span>
            <Select
              options={countryOptions}
              value={country}
              onChange={onCountry}
              ariaLabel="Country or region"
              searchable
            />
          </label>
        )}

        {inputs.map((input) => (
          <Field
            key={input.id}
            input={input}
            value={values[input.id]}
            currencySymbol={currencySymbol}
            onInput={onInput}
          />
        ))}
      </form>

      {isComparisonResult(result) ? (
        <ComparisonReadout result={result} />
      ) : (
        <Readout result={result} />
      )}
    </div>
  );
}

/* ---- Custom dropdown ----------------------------------------------------- */
function Select({
  options,
  value,
  onChange,
  ariaLabel,
  searchable = false,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    if (!query) return options;
    const q = query.toLowerCase();
    return options.filter((o) => (o.search ?? o.label).toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (searchable) searchRef.current?.focus();
    setActive(Math.max(0, filtered.findIndex((o) => o.value === value)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function choose(v: string) {
    onChange(v);
    setOpen(false);
    setQuery("");
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const o = filtered[active];
      if (o) choose(o.value);
    }
  }

  return (
    <div class="relative" ref={rootRef}>
      <button
        type="button"
        class="select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
      >
        <span class="truncate">{selected?.label ?? "Select…"}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div class="select-popover" onKeyDown={onKey}>
          {searchable && (
            <div class="select-search">
              <input
                ref={searchRef}
                type="text"
                inputMode="search"
                placeholder="Search countries…"
                value={query}
                onInput={(e) => {
                  setQuery(e.currentTarget.value);
                  setActive(0);
                }}
              />
            </div>
          )}
          <ul class="select-list" role="listbox" aria-label={ariaLabel}>
            {filtered.length === 0 && <li class="select-empty">No matches</li>}
            {filtered.map((o, i) => (
              <li key={o.value} role="option" aria-selected={o.value === value}>
                <button
                  type="button"
                  class={`select-option ${o.value === value ? "is-selected" : ""} ${i === active ? "is-active" : ""}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(o.value)}
                >
                  <span class="truncate">{o.label}</span>
                  {o.value === value && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---- Field --------------------------------------------------------------- */
function Field({
  input,
  value,
  currencySymbol,
  onInput,
}: {
  input: InputSpec;
  value: number | string | boolean;
  currencySymbol: string;
  onInput: (id: string, raw: number | string | boolean) => void;
}) {
  const id = `f-${input.id}`;

  if (input.type === "select") {
    return (
      <label class="flex flex-col gap-1.5">
        <span class="text-[13px] font-medium text-ink">{input.label}</span>
        <Select
          options={(input.options ?? []).map((o) => ({ value: o.value, label: o.label }))}
          value={String(value)}
          onChange={(v) => onInput(input.id, v)}
          ariaLabel={input.label}
        />
        {input.help && <span class="text-[13px] leading-snug text-mute">{input.help}</span>}
      </label>
    );
  }

  if (input.type === "toggle") {
    return (
      <label class="flex items-center gap-3" for={id}>
        <input
          id={id}
          name={input.id}
          type="checkbox"
          class="size-[18px] shrink-0 cursor-pointer accent-ink"
          checked={Boolean(value)}
          onChange={(e) => onInput(input.id, e.currentTarget.checked)}
        />
        <span class="text-[14px] text-ink">{input.label}</span>
        {input.help && (
          <span class="text-[13px] leading-snug text-mute">{input.help}</span>
        )}
      </label>
    );
  }

  const isPercent = input.type === "percent";
  const affix = input.type === "currency" ? currencySymbol : isPercent ? "%" : input.prefix ?? input.suffix ?? "";
  const suffixSide = isPercent || Boolean(input.suffix);

  return (
    <label class="flex flex-col gap-1.5" for={id}>
      <span class="text-[13px] font-medium text-ink">{input.label}</span>
      <span class="relative flex items-center">
        {affix && (
          <span
            class={`pointer-events-none absolute text-mute ${suffixSide ? "right-3" : "left-3"}`}
          >
            {affix}
          </span>
        )}
        <input
          id={id}
          name={input.id}
          autoComplete="off"
          class={`field-control tnum ${affix ? (suffixSide ? "pr-8" : "pl-7") : ""}`}
          type="number"
          inputMode="decimal"
          value={value === "" ? "" : Number(value)}
          min={input.min}
          max={input.max}
          step={input.step ?? "any"}
          placeholder={input.placeholder}
          onInput={(e) => {
            const v = e.currentTarget.value;
            onInput(input.id, v === "" ? "" : Number(v));
          }}
        />
      </span>
      {input.help && <span class="text-[13px] leading-snug text-mute">{input.help}</span>}
    </label>
  );
}

/* ---- Readout ------------------------------------------------------------- */
function Readout({ result }: { result: CalcResult }) {
  return (
    <output class="card sticky top-4 block min-h-[14rem] p-5" aria-live="polite">
      <div class="mb-3 flex flex-col gap-1 border-b border-hairline pb-4">
        <span class="eyebrow">{result.headline.label}</span>
        <span class="tnum text-accent text-[clamp(2rem,1.6rem+1.8vw,3rem)] font-semibold leading-none tracking-tight">
          {result.headline.display}
        </span>
        {result.headline.sub && (
          <span class="text-[13px] text-mute">{result.headline.sub}</span>
        )}
      </div>
      <dl class="flex flex-col">
        {result.rows.map((row, i) => {
          const net = row.kind === "net";
          const ded = row.kind === "deduction";
          return (
            <div
              class={`flex items-baseline justify-between gap-3 py-1.5 text-[15px] ${
                net ? "mt-2 border-t border-hairline pt-3" : ""
              }`}
              key={i}
            >
              <dt class={`flex min-w-0 flex-col ${net ? "font-semibold text-ink" : "text-body"}`}>
                <span>{row.label}</span>
                {row.hint && <span class="text-[12px] text-mute">{row.hint}</span>}
              </dt>
              <dd
                class={`tnum shrink-0 whitespace-nowrap font-medium ${
                  net ? "text-[17px] font-semibold text-ink" : ded ? "text-error" : "text-ink"
                }`}
              >
                {ded ? "−" : ""}
                {row.display}
              </dd>
            </div>
          );
        })}
      </dl>
    </output>
  );
}

/* ---- Comparison readout (kind:"comparison") ------------------------------ */
function accentStyleFor(platform: string): string | undefined {
  const p = getPlatform(platform);
  if (!p) return undefined;
  return `--accent-l:${p.color};--accent-d:${p.colorDark ?? p.color}`;
}

function ComparisonReadout({ result }: { result: ComparisonResult }) {
  const winner = result.columns.find((c) => c.isWinner);
  const tie = !winner;
  return (
    <output class="sticky top-4 block" aria-live="polite">
      <div
        class={`calc-accent mb-3 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[15px] font-medium ${
          tie
            ? "border-hairline bg-canvas-soft text-body"
            : "border-accent/30 bg-accent/5 text-ink"
        }`}
        style={winner ? accentStyleFor(winner.platform) : undefined}
      >
        {!tie && (
          <svg class="size-5 shrink-0 text-accent" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
        <span class="min-w-0">
          {result.verdict.text}
          {result.verdict.sub && (
            <span class="block text-[13px] font-normal text-mute">{result.verdict.sub}</span>
          )}
        </span>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        {result.columns.map((col) => (
          <div
            key={col.platform}
            class={`calc-accent card flex flex-col p-4 ${col.isWinner ? "ring-1 ring-accent/40" : ""}`}
            style={accentStyleFor(col.platform)}
          >
            <div class="mb-2 flex items-center justify-between gap-2">
              <span class="eyebrow" translate="no">{col.name}</span>
              {col.isWinner && (
                <span class="rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
                  Cheaper
                </span>
              )}
            </div>
            <span class="text-[13px] text-mute">{col.netLabel}</span>
            <span class="tnum text-accent text-[clamp(1.6rem,1.3rem+1.4vw,2.4rem)] font-semibold leading-none tracking-tight">
              {col.net}
            </span>
            <dl class="mt-3 flex flex-col gap-1.5 border-t border-hairline pt-3 text-[14px]">
              <div class="flex items-baseline justify-between gap-2">
                <dt class="min-w-0 text-body">Fee ({col.rateLabel})</dt>
                <dd class="tnum shrink-0 whitespace-nowrap font-medium text-error">−{col.fee}</dd>
              </div>
              <div class="flex items-baseline justify-between gap-2">
                <dt class="text-body">Effective rate</dt>
                <dd class="tnum shrink-0 font-medium text-ink">{col.effective}</dd>
              </div>
            </dl>
            {col.note && (
              <p class="mt-3 text-[12px] leading-snug text-mute">
                {col.note.text}{" "}
                <a class="font-medium text-accent underline-offset-2 hover:underline" href={col.note.href}>
                  Open the {col.name} calculator
                </a>
                .
              </p>
            )}
          </div>
        ))}
      </div>
    </output>
  );
}
