/** @jsxImportSource preact */
/**
 * The single generic calculator widget (PLAN §1). One island powers every
 * calculator. SSR-computed initial output renders immediately (no CLS, SEO
 * sees numbers), then lazy-loads THIS calculator's pure compute() — code-split
 * per calculator — to recompute live as inputs change.
 */
import { useMemo, useState } from "preact/hooks";
import type {
  CalcResult,
  ComputeCtx,
  InputSpec,
  InputValues,
} from "../calculators/_types";
import { countriesFor, getCountry, type CountryCode } from "../lib/countries";
import { formatCurrency, formatNumber, formatPercent } from "../lib/money";

type ComputeFn = (values: InputValues, ctx: ComputeCtx) => CalcResult;

const configModules = import.meta.glob("../calculators/*/config.ts");

interface Props {
  slug: string;
  inputs: InputSpec[];
  initialResult: CalcResult;
  countryCodes?: CountryCode[];
  initialCountry: CountryCode;
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
  const [result, setResult] = useState<CalcResult>(initialResult);

  const countryList = useMemo(
    () => (countryCodes ? countriesFor(countryCodes) : []),
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

  function onCountry(code: CountryCode) {
    setCountry(code);
    void recompute(values, code);
  }

  return (
    <div class="grid gap-4 md:grid-cols-2 md:items-start" data-slug={slug}>
      <form
        class="card flex flex-col gap-4 p-5"
        onSubmit={(e) => e.preventDefault()}
      >
        {countryList.length > 1 && (
          <label class="flex flex-col gap-1.5">
            <span class="text-[13px] font-medium text-ink">Country / region</span>
            <select
              class="field-control field-select tnum"
              name="country"
              autoComplete="country"
              value={country}
              onChange={(e) => onCountry(e.currentTarget.value as CountryCode)}
            >
              {countryList.map((c) => (
                <option value={c.code} key={c.code}>
                  {c.name} ({c.currency})
                </option>
              ))}
            </select>
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

      <Readout result={result} />
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
      <label class="flex flex-col gap-1.5" for={id}>
        <span class="text-[13px] font-medium text-ink">{input.label}</span>
        <select
          id={id}
          name={input.id}
          class="field-control field-select"
          value={String(value)}
          onChange={(e) => onInput(input.id, e.currentTarget.value)}
        >
          {input.options?.map((o) => (
            <option value={o.value} key={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {input.help && <span class="text-[13px] leading-snug text-mute">{input.help}</span>}
      </label>
    );
  }

  if (input.type === "toggle") {
    return (
      <label class="flex items-center gap-3" for={id}>
        <input
          id={id}
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
