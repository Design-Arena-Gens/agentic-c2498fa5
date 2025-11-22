import crypto from "node:crypto";
import { NextRequest } from "next/server";
import * as fal from "@fal-ai/serverless-client";
import { z } from "zod";
import { accentFromBase } from "@/lib/palette";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const requestSchema = z.object({
  collectionName: z.string().min(1),
  polishColor: z.string().min(4),
  finish: z.string().min(1),
  mood: z.string().min(1),
  location: z.string().min(1),
  accessories: z.string().min(1),
  variations: z.number().int().min(1).max(6),
  prompt: z.string().min(20),
  negativePrompt: z.string().min(10),
});

type FalImage = {
  url: string;
};

const FAL_MODEL = process.env.FAL_MODEL_ID ?? "fal-ai/flux-pro/v1.1-ultra";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);

  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid creative brief supplied." },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (!process.env.FAL_KEY) {
    return Response.json(
      {
        images: fallbackLooks(data.polishColor, data.prompt, data.variations),
        warning:
          "FAL_KEY missing. Returned curated fallback photography references.",
      },
      { status: 200 }
    );
  }

  fal.config({
    credentials: process.env.FAL_KEY,
  });

  try {
    const result = await fal.subscribe(FAL_MODEL, {
      input: {
        prompt: data.prompt,
        negative_prompt: data.negativePrompt,
        guidance_scale: 3.8,
        steps: 28,
        num_images: data.variations,
        enable_safety_checker: true,
        seed: Math.floor(Math.random() * 99999999),
      },
    });

    const images = normalizeFalImages(result);

    if (images.length === 0) {
      throw new Error("No imagery returned from the render engine.");
    }

    return Response.json({
      images: images.map((image, index) => ({
        id: crypto.randomUUID(),
        url: image.url,
        prompt: data.prompt,
        accent: accentFromBase(data.polishColor, index, images.length),
      })),
    });
  } catch (error) {
    console.error("[generate] fal error", error);
    return Response.json(
      {
        images: fallbackLooks(data.polishColor, data.prompt, data.variations),
        error:
          "The live render queue is unavailable. Served curated fallback photography instead.",
      },
      { status: 200 }
    );
  }
}

function normalizeFalImages(result: unknown): FalImage[] {
  if (!result) return [];

  if (Array.isArray(result)) {
    return result.flatMap((entry) => normalizeFalImages(entry));
  }

  if (typeof result === "object") {
    const record = result as Record<string, unknown>;

    const directImages = parseImages(record.images);
    if (directImages.length > 0) return directImages;

    if (Array.isArray(record.output)) {
      const nested = record.output.flatMap((item) => normalizeFalImages(item));
      if (nested.length > 0) return nested;
    }

    if (record.output && typeof record.output === "object") {
      const nested = normalizeFalImages(record.output);
      if (nested.length > 0) return nested;
    }

    if (record.image && typeof record.image === "object") {
      const nested = normalizeFalImages(record.image);
      if (nested.length > 0) return nested;
    }
  }

  return [];
}

function parseImages(value: unknown): FalImage[] {
  if (!value) return [];
  if (!Array.isArray(value)) return [];
  const normalized = value.map((item) => {
    if (typeof item === "string") {
      return { url: item };
    }
    if (item && typeof item === "object" && "url" in item) {
      const url = (item as Record<string, unknown>).url;
      if (typeof url === "string") {
        return { url };
      }
    }
    return null;
  });
  return normalized.filter((entry): entry is FalImage => Boolean(entry));
}

function fallbackLooks(color: string, prompt: string, count: number) {
  const curated = [
    {
      url: "https://images.unsplash.com/photo-1522333140766-8fa2960ecb30?auto=format&fit=crop&w=720&q=90",
    },
    {
      url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=720&q=90",
    },
    {
      url: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=720&q=90",
    },
    {
      url: "https://images.unsplash.com/photo-1520341280432-4749d4d7bcf9?auto=format&fit=crop&w=720&q=90",
    },
    {
      url: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=720&q=90",
    },
  ];

  return Array.from({ length: count }).map((_, index) => {
    const image = curated[index % curated.length];
    return {
      id: `fallback-${index + 1}`,
      url: image.url,
      prompt,
      accent: accentFromBase(color, index, count),
    };
  });
}
