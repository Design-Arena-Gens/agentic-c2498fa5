/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState, useTransition } from "react";
import { clsx } from "clsx";

type FormState = {
  collectionName: string;
  polishColor: string;
  finish: string;
  mood: string;
  location: string;
  accessories: string;
  variations: number;
};

type GeneratedImage = {
  id: string;
  url: string;
  prompt: string;
  accent: string;
};

const FINISHES = [
  "glass shine",
  "velvet matte",
  "holographic shimmer",
  "pearlescent glow",
];

const MOODS = [
  "sunset Waikiki couture",
  "modern tropical minimalism",
  "midnight neon soirée",
  "ethereal editorial luxe",
];

const LOCATIONS = [
  "ocean-view penthouse terrace",
  "black sand beach runway",
  "glasshouse botanical atelier",
  "platinum VIP backstage lounge",
];

const ACCESSORIES = [
  "stacked gold rings",
  "pearl statement bracelet",
  "abalone clutch",
  "diamond tennis bracelet",
];

const COLOR_SWATCHES = [
  "#ff6f8e",
  "#fb8d3b",
  "#23b0a5",
  "#7053ff",
  "#cc73ff",
];

const DEFAULT_FORM: FormState = {
  collectionName: "Hibiscus Reverie",
  polishColor: COLOR_SWATCHES[0],
  finish: FINISHES[0],
  mood: MOODS[0],
  location: LOCATIONS[0],
  accessories: ACCESSORIES[0],
  variations: 3,
};

const NEGATIVE_PROMPT =
  "extra digits, disfigured hands, blurred nails, watermark, plain background, low-res, duplicated text, anatomy errors, cropped fingers";

export default function Home() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const curatedPrompt = useMemo(() => {
    return [
      "Editorial macro photography of manicured hands for Aloha Nails (alohanails.gr)",
      `Collection: ${form.collectionName}`,
      `Mood: ${form.mood}`,
      `Polish shade: ${form.polishColor} with ${form.finish}`,
      `Outfit palette perfectly color-matched to polish`,
      `Setting: ${form.location}, styled with ${form.accessories}`,
      "luxury lighting, hyperreal skin, immaculate nails, jewelry sparkle",
      "Shot for fashion magazine cover, cinematic depth of field, full frame",
      "Include full hands and nails, ensure high fidelity details",
    ].join(". ");
  }, [form]);

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            prompt: curatedPrompt,
            negativePrompt: NEGATIVE_PROMPT,
          }),
        });

        if (!response.ok) {
          const message = await response.json().catch(() => null);
          throw new Error(message?.error ?? "The creative suite is offline.");
        }

        const payload: { images: GeneratedImage[] } = await response.json();
        setImages(payload.images);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Failed to render looks. Retry."
        );
      }
    });
  };

  return (
    <div className="min-h-screen w-full pb-24">
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-16 sm:pt-20">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-black/70 shadow-sm">
          Aloha Nails Studio
        </span>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-[#150f0f] sm:text-5xl">
          AI Photoshoot Pro
        </h1>
        <p className="max-w-2xl text-balance text-lg leading-7 text-black/70">
          Curate flawless, campaign-ready manicure stories with art direction
          tuned for Aloha Nails. Every render keeps polish, wardrobe, and set in
          lockstep — and badges each frame with the safety promise
          <span className="font-semibold"> TPO FREE • HEMA FREE</span>.
        </p>
      </header>

      <main className="mx-auto mt-12 flex w-full max-w-6xl flex-col gap-10 px-6">
        <section className="glass-panel relative flex flex-col gap-8 rounded-3xl p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr,420px] lg:gap-10">
            <div className="space-y-6">
              <FormField
                label="Collection Title"
                description="Keeps every look anchored to your campaign storyline."
              >
                <input
                  value={form.collectionName}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      collectionName: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-3 text-base outline-none transition focus:border-black/30 focus:ring focus:ring-black/5"
                  placeholder="Example: Hibiscus Reverie"
                />
              </FormField>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  label="Signature Finish"
                  description="Refines lighting and nail surface texture."
                >
                  <SelectGrid
                    options={FINISHES}
                    activeValue={form.finish}
                    onSelect={(finish) =>
                      setForm((prev) => ({ ...prev, finish }))
                    }
                  />
                </FormField>

                <FormField
                  label="Editorial Mood"
                  description="Shapes the storytelling and styling direction."
                >
                  <SelectGrid
                    options={MOODS}
                    activeValue={form.mood}
                    onSelect={(mood) => setForm((prev) => ({ ...prev, mood }))}
                  />
                </FormField>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  label="Set Location"
                  description="Guides background architecture and ambient light."
                >
                  <SelectGrid
                    options={LOCATIONS}
                    activeValue={form.location}
                    onSelect={(location) =>
                      setForm((prev) => ({ ...prev, location }))
                    }
                  />
                </FormField>
                <FormField
                  label="Styling Accents"
                  description="Ensures hands feel editorial and on-brand."
                >
                  <SelectGrid
                    options={ACCESSORIES}
                    activeValue={form.accessories}
                    onSelect={(accessories) =>
                      setForm((prev) => ({ ...prev, accessories }))
                    }
                  />
                </FormField>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.18em] text-black/60">
                  <span>Signature Shade</span>
                  <span>{form.polishColor}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_SWATCHES.map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      className={clsx(
                        "h-12 w-12 rounded-full border-2 border-transparent transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-black",
                        form.polishColor === swatch
                          ? "ring-4 ring-black/10"
                          : "border-black/10"
                      )}
                      style={{ background: swatch }}
                      onClick={() =>
                        setForm((prev) => ({ ...prev, polishColor: swatch }))
                      }
                      aria-label={`Select shade ${swatch}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 rounded-3xl bg-white/80 p-6 shadow-[0_18px_40px_rgba(17,16,15,0.08)]">
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-black/50">
                Production Brief
              </h2>
              <div className="rounded-2xl border border-black/5 bg-white p-5 text-sm leading-6 text-black/70">
                {curatedPrompt}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
                  Looks Per Drop
                </span>
                <span className="text-base font-semibold">
                  {form.variations}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={6}
                value={form.variations}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    variations: Number(event.target.value),
                  }))
                }
                className="accent-[#171313]"
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="group relative flex items-center justify-center overflow-hidden rounded-2xl bg-black px-5 py-3 text-base font-semibold text-white transition hover:shadow-[0_18px_40px_rgba(23,19,19,0.35)] disabled:cursor-not-allowed disabled:bg-black/40"
              >
                <span className="relative z-10 tracking-wide uppercase">
                  {isPending ? "Rendering Looks…" : "Generate Shoot"}
                </span>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-[#171313] via-[#2d1616] to-[#171313] opacity-0 transition group-hover:opacity-100" />
              </button>
              {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : (
                <p className="text-xs text-black/45">
                  Tip: Adjust the shade to perfectly match your outfit board—the
                  AI syncs every textile swatch automatically.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#150f0f]">
                Editorial Reel
              </h2>
              <p className="text-sm text-black/60">
                {isPending
                  ? "Dialing lighting grids and wardrobe stylists…"
                  : images.length > 0
                    ? "Tap a card to download the full-resolution look."
                    : "Hand off a brief to begin the shoot."}
              </p>
            </div>
            {images.length > 0 && (
              <span className="rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                {images.length} Looks
              </span>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {isPending
              ? Array.from({ length: form.variations }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="relative h-[420px] overflow-hidden rounded-3xl bg-white shadow-[0_18px_40px_rgba(17,16,15,0.08)]"
                  >
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white via-[#f7f2f7] to-[#f1eff5]" />
                  </div>
                ))
              : images.map((image, index) => (
                  <GeneratedCard
                    key={image.id}
                    image={image}
                    index={index}
                    total={images.length}
                  />
                ))}
          </div>
        </section>
      </main>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  description: string;
  children: React.ReactNode;
};

function FormField({ label, description, children }: FormFieldProps) {
  return (
    <label className="flex flex-col gap-3">
      <span className="text-sm font-semibold uppercase tracking-[0.18em] text-black/60">
        {label}
      </span>
      <span className="text-sm text-black/50">{description}</span>
      {children}
    </label>
  );
}

type SelectGridProps = {
  options: string[];
  activeValue: string;
  onSelect: (value: string) => void;
};

function SelectGrid({ options, activeValue, onSelect }: SelectGridProps) {
  return (
    <div className="grid gap-3">
      {options.map((option) => {
        const active = activeValue === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={clsx(
              "rounded-2xl border px-4 py-3 text-left text-sm transition",
              active
                ? "border-black bg-black text-white shadow-[0_12px_32px_rgba(23,19,19,0.18)]"
                : "border-black/10 bg-white/70 text-black/70 hover:border-black/25 hover:bg-white"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

type GeneratedCardProps = {
  image: GeneratedImage;
  index: number;
  total: number;
};

function GeneratedCard({ image, index, total }: GeneratedCardProps) {
  return (
    <article className="group relative flex h-[440px] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_22px_48px_rgba(17,16,15,0.14)] transition hover:-translate-y-1 hover:shadow-[0_28px_56px_rgba(17,16,15,0.18)]">
      <img
        src={image.url}
        alt={image.prompt}
        className="h-full w-full object-cover"
        loading={index < 2 ? "eager" : "lazy"}
      />
      <a
        href={image.url}
        download={`aloha-nails-look-${index + 1}.png`}
        className="absolute inset-0"
        aria-label={`Download look ${index + 1} of ${total}`}
      />
      <div className="absolute inset-x-5 bottom-5 flex flex-col gap-3 rounded-3xl bg-black/65 p-4 text-white backdrop-blur-md">
        <span className="text-xs uppercase tracking-[0.24em] text-white/70">
          LOOK {String(index + 1).padStart(2, "0")}
        </span>
        <p className="line-clamp-2 text-sm font-medium leading-6">
          {image.prompt}
        </p>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs tracking-[0.16em]">
          Outfit Match · {image.accent}
        </span>
      </div>
      <div
        className="safety-badge"
        style={{
          background: `linear-gradient(140deg, ${image.accent} 0%, #171313 100%)`,
        }}
      >
        <span className="badge-ring" />
        TPO FREE • HEMA FREE
      </div>
    </article>
  );
}
