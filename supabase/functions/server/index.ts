// @ts-nocheck
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

const app = new Hono();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const requestCounters = new Map<string, { count: number; windowStart: number }>();

const sanitizeText = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

const normalizeTags = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6);
  }
  return [];
};

const validateRecommendations = (value: unknown) => {
  if (!Array.isArray(value)) {
    throw new Error("Recommendation payload must be an array.");
  }

  return value.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`Recommendation at index ${index} is not an object.`);
    }

    const candidate = item as Record<string, unknown>;
    const title = sanitizeText(candidate.title, "Fresh idea");
    const description = sanitizeText(candidate.description, "Take a step away from your screen.");
    const duration = sanitizeText(candidate.duration, "20 min");
    const setting = candidate.setting === "Outdoor" ? "Outdoor" : "Indoor";
    const tags = normalizeTags(candidate.tags);
    const reason = sanitizeText(candidate.reason, "A gentle reset for your current rhythm.");

    return {
      title,
      description,
      duration,
      setting,
      tags: tags.length ? tags : [setting, "Personalized"],
      reason,
      distance: typeof candidate.distance === "string" ? candidate.distance : setting === "Outdoor" ? "Starts nearby" : "At home",
    };
  });
};

const getClientKey = (c: any) => {
  return (
    c.req.header("x-forwarded-for") ??
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-real-ip") ??
    "anonymous"
  );
};

const checkRateLimit = (c: any) => {
  const clientKey = getClientKey(c);
  const now = Date.now();
  const current = requestCounters.get(clientKey);

  if (!current || now - current.windowStart > RATE_LIMIT_WINDOW_MS) {
    requestCounters.set(clientKey, { count: 1, windowStart: now });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  current.count += 1;
  return true;
};

const fetchNearbyPlaces = async (latitude: number, longitude: number, apiKey: string) => {
  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.types",
      },
      body: JSON.stringify({
        includedTypes: [
          "park",
          "library",
          "museum",
          "cafe",
          "recreational_space",
          "gym",
          "shopping_mall",
          "sports_complex",
          "bowling_alley",
          "movie_theater",
          "restaurant",
        ],
        maxResultCount: 8,
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: 5000,
          },
        },
      }),
    });

    if (!response.ok) {
      console.error("Google Places request failed", { status: response.status });
      return [];
    }

    const payload = await response.json();
    const places = Array.isArray(payload.places) ? payload.places : [];

    return places
      .map((place: any) => ({
        name: sanitizeText(place?.displayName?.text, "Nearby place"),
        address: sanitizeText(place?.formattedAddress, "Local area"),
        types: Array.isArray(place?.types) ? place.types : [],
      }))
      .filter((place) => place.name && place.address && place.name !== "Nearby place");
  } catch (error) {
    console.error("Google Places lookup failed", error);
    return [];
  }
};

const fallbackRecommendations = [
  {
    title: "Take a short walk around your block",
    description: "A gentle reset that gets you out of the house and away from your screen for a few minutes.",
    duration: "20 min",
    setting: "Outdoor",
    tags: ["Fresh air", "Movement"],
    reason: "A low-effort reset that matches your current energy and time.",
  },
  {
    title: "Make tea and read ten pages",
    description: "Give your brain a lower-stimulation activity and let your nervous system settle.",
    duration: "20 min",
    setting: "Indoor",
    tags: ["Quiet", "Recharge"],
    reason: "Useful when your attention is fried and you want a calmer transition.",
  },
  {
    title: "Stretch and reset your shoulders",
    description: "A brief movement break will help you feel more physically grounded before you decide whether to keep playing.",
    duration: "10 min",
    setting: "Indoor",
    tags: ["Movement", "Quick reset"],
    reason: "A simple win when you want to keep the break short but effective.",
  },
];

const generateOpenAIRecommendations = async (payload: Record<string, unknown>) => {
  const openAIKey = Deno.env.get("OPENAI_API_KEY");
  if (!openAIKey) {
    throw new Error("OpenAI is not configured on this deployment.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAIKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.8,
      input: [
        {
          role: "system",
          content:
            "You are a thoughtful coach helping someone reduce gaming friction by recommending realistic activities. Return only valid JSON matching the provided schema. Suggest real and useful options grounded in the user's time, interests, location, and preferences. Avoid repetitive suggestions. Prefer activities that fit the current local time and day of week. Favor activities already liked and avoid activities the user has explicitly passed on.",
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "activity_recommendations",
          strict: true,
          schema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    duration: { type: "string" },
                    setting: { type: "string", enum: ["Indoor", "Outdoor"] },
                    tags: {
                      type: "array",
                      items: { type: "string" },
                    },
                    reason: { type: "string" },
                    distance: { type: "string" },
                  },
                  required: ["title", "description", "duration", "setting", "tags", "reason"],
                  additionalProperties: false,
                },
              },
            },
            required: ["recommendations"],
            additionalProperties: false,
          },
        },
      },
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error?.message || "OpenAI request failed.");
  }

  const outputText =
    typeof result.output_text === "string"
      ? result.output_text
      : typeof result.output?.[0]?.content?.[0]?.text === "string"
        ? result.output[0].content[0].text
        : "";

  if (!outputText) {
    throw new Error("OpenAI returned an empty recommendation payload.");
  }

  const parsed = JSON.parse(outputText);
  return validateRecommendations(parsed.recommendations);
};

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/health", (c: any) => {
  return c.json({ status: "ok" });
});

app.post("/recommendations", async (c: any) => {
  if (!checkRateLimit(c)) {
    return c.json({ error: "Too many requests. Please wait a moment and try again." }, 429);
  }

  try {
    const body = await c.req.json();
    if (!body || typeof body !== "object") {
      return c.json({ error: "Request body is required." }, 400);
    }

    const payload = body as Record<string, unknown>;
    const googlePlacesApiKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    const latitude = typeof payload.latitude === "number" ? payload.latitude : null;
    const longitude = typeof payload.longitude === "number" ? payload.longitude : null;
    const locationEnabled = Boolean(payload.locationEnabled) && latitude !== null && longitude !== null;

    const nearbyPlaces = locationEnabled && googlePlacesApiKey
      ? await fetchNearbyPlaces(latitude, longitude, googlePlacesApiKey)
      : [];

    const activityPayload = {
      ...payload,
      locationEnabled,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      nearbyPlaces,
      preferences: {
        activitySetting: payload.activitySetting ?? "Either",
        interests: Array.isArray(payload.interests) ? payload.interests : [],
        selectedGame: sanitizeText(payload.selectedGame, "your current game"),
        localTime: sanitizeText(payload.localTime, "now"),
        dayOfWeek: sanitizeText(payload.dayOfWeek, "today"),
      },
      previous: {
        likedActivities: Array.isArray(payload.likedActivities) ? payload.likedActivities : [],
        passedActivities: Array.isArray(payload.passedActivities) ? payload.passedActivities : [],
      },
    };

    const recommendations = await generateOpenAIRecommendations(activityPayload);

    if (!recommendations.length) {
      return c.json({ recommendations: fallbackRecommendations });
    }

    return c.json({ recommendations: recommendations.slice(0, 5) });
  } catch (error) {
    console.error("recommendation route failed", error);
    return c.json({
      recommendations: fallbackRecommendations,
      error: "Fresh recommendations are temporarily unavailable, so we used fallback ideas instead.",
    });
  }
});

Deno.serve(app.fetch);