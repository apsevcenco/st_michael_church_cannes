const http = require("node:http");

const PORT = Number(process.env.PORT || 10000);
const RELEASE_ID = "translate-diagnostics-2026-09-22";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'self'"
};

const siteInfo = {
  parish: "Parish of St Michael the Archangel in Cannes",
  city: "Cannes",
  address: "40 boulevard Alexandre III, 06400 Cannes, France",
  status: "published",
  updatedAt: new Date().toISOString()
};

const STATUS_PATHS = new Set([
  "/api/translate/status",
  "/translate/status",
  "/api/status",
  "/status"
]);

function normalizeOrigin(value) {
  if (!value || value === "*") return value || "";
  try {
    return new URL(value).origin;
  } catch {
    return String(value).replace(/\/$/, "");
  }
}

function allowedOrigin(request) {
  const origin = normalizeOrigin(request.headers.origin || "");
  const configuredOrigin = normalizeOrigin(FRONTEND_ORIGIN);
  const allowed = new Set([
    configuredOrigin,
    "https://st-michael-church-cannes-frontend.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ]);

  if (configuredOrigin === "*") return origin || "*";
  if (allowed.has(origin)) return origin;
  return configuredOrigin || "https://st-michael-church-cannes-frontend.onrender.com";
}

function corsHeaders(request) {
  return {
    "Access-Control-Allow-Origin": allowedOrigin(request),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin"
  };
}

function sendJson(request, response, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);

  response.writeHead(statusCode, {
    ...SECURITY_HEADERS,
    ...corsHeaders(request),
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });

  response.end(body);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 250000) {
        request.destroy();
        reject(new Error("Request body is too large"));
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    request.on("error", reject);
  });
}

async function verifyAdmin(request) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { ok: false, status: 401, error: "Missing admin session" };
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, status: 503, error: "Supabase admin verification is not configured" };
  }

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`
    }
  });

  if (!userResponse.ok) return { ok: false, status: 401, error: "Invalid admin session" };
  const user = await userResponse.json();
  if (!user?.id) return { ok: false, status: 401, error: "Invalid admin user" };

  const adminResponse = await fetch(`${SUPABASE_URL}/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  });

  if (!adminResponse.ok) {
    const details = await adminResponse.text().catch(() => "");
    return { ok: false, status: 403, error: `Cannot verify admin access${details ? `: ${details.slice(0, 180)}` : ""}` };
  }
  const rows = await adminResponse.json();
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, status: 403, error: "Admin access required" };

  return { ok: true, userId: user.id };
}

function normalizeTranslationPayload(body) {
  const sourceLanguage = ["ru", "fr", "en"].includes(body.sourceLanguage) ? body.sourceLanguage : "ru";
  const targets = Array.isArray(body.targets)
    ? body.targets.filter((language) => ["ru", "fr", "en"].includes(language) && language !== sourceLanguage)
    : ["fr", "en"].filter((language) => language !== sourceLanguage);
  const fields = body.fields && typeof body.fields === "object" ? body.fields : {};
  const normalizedFields = {};

  Object.entries(fields).forEach(([key, value]) => {
    const safeKey = String(key).replace(/[^a-z0-9_-]/gi, "");
    if (!safeKey) return;
    normalizedFields[safeKey] = String(value || "").slice(0, 30000);
  });

  return {
    sourceLanguage,
    targets: [...new Set(targets)],
    context: String(body.context || "Orthodox parish website content").slice(0, 500),
    fields: normalizedFields
  };
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    const match = String(value || "").match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("OpenAI returned invalid translation JSON");
  }
}

async function translateWithOpenAI(payload) {
  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You translate Orthodox parish website CMS blocks. Return only valid JSON. Preserve simple HTML tags and inline formatting. Do not add commentary, Markdown fences, or new facts. Keep liturgical names reverent and natural for each language."
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Translate every field into every target language. Keep the same field keys. Return exactly { translations: { fr: { field: string }, en: { field: string } } } for requested targets only.",
            sourceLanguage: payload.sourceLanguage,
            targetLanguages: payload.targets,
            context: payload.context,
            fields: payload.fields
          })
        }
      ]
    })
  });

  const text = await openaiResponse.text();
  const openaiPayload = text ? safeJsonParse(text) : {};
  if (!openaiResponse.ok) {
    throw new Error(openaiPayload.error?.message || `OpenAI translation failed with status ${openaiResponse.status}`);
  }

  const content = openaiPayload.choices?.[0]?.message?.content || "{}";
  const parsed = safeJsonParse(content);
  return parsed.translations || {};
}

async function translateBlock(request, response) {
  const admin = await verifyAdmin(request);
  if (!admin.ok) {
    sendJson(request, response, admin.status, { ok: false, error: admin.error });
    return;
  }
  if (!OPENAI_API_KEY) {
    sendJson(request, response, 503, { ok: false, error: "OpenAI API key is not configured" });
    return;
  }

  const body = await readJson(request);
  const payload = normalizeTranslationPayload(body);
  if (!payload.targets.length) {
    sendJson(request, response, 400, { ok: false, error: "No target languages requested" });
    return;
  }
  if (!Object.values(payload.fields).some((value) => String(value).trim())) {
    sendJson(request, response, 400, { ok: false, error: "Nothing to translate" });
    return;
  }

  try {
    const translations = await translateWithOpenAI(payload);
    sendJson(request, response, 200, { ok: true, translations });
  } catch (error) {
    sendJson(request, response, 502, { ok: false, error: error.message || "OpenAI translation failed" });
  }
}

function translationStatusPayload() {
  return {
    ok: true,
    service: "st-michael-cannes-backend",
    releaseId: RELEASE_ID,
    routes: ["/healthz", "/api/translate", "/api/translate/status", "/status"],
    translation: {
      openaiApiKeyConfigured: Boolean(OPENAI_API_KEY),
      openaiModel: OPENAI_MODEL,
      supabaseUrlConfigured: Boolean(SUPABASE_URL),
      supabaseAnonKeyConfigured: Boolean(SUPABASE_ANON_KEY),
      supabaseServiceRoleKeyConfigured: Boolean(SUPABASE_SERVICE_ROLE_KEY),
      frontendOrigin: normalizeOrigin(FRONTEND_ORIGIN),
      localOriginsAllowed: true
    }
  };
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        ...SECURITY_HEADERS,
        ...corsHeaders(request)
      });
      response.end();
      return;
    }

    const url = new URL(request.url, `http://${request.headers.host}`);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "POST" && pathname === "/api/translate") {
      await translateBlock(request, response);
      return;
    }

    if (request.method !== "GET") {
      sendJson(request, response, 405, { ok: false, error: "Method not allowed", releaseId: RELEASE_ID });
      return;
    }

    if (pathname === "/" || pathname === "/healthz") {
      sendJson(request, response, 200, {
        ok: true,
        service: "st-michael-cannes-backend",
        releaseId: RELEASE_ID
      });
      return;
    }

    if (STATUS_PATHS.has(pathname)) {
      sendJson(request, response, 200, translationStatusPayload());
      return;
    }

    if (pathname === "/api/site") {
      sendJson(request, response, 200, { ...siteInfo, releaseId: RELEASE_ID });
      return;
    }

    if (pathname === "/api/services") {
      sendJson(request, response, 200, {
        releaseId: RELEASE_ID,
        services: [],
        message: "The current service schedule is managed on the website through the CMS."
      });
      return;
    }

    sendJson(request, response, 404, {
      ok: false,
      error: "Route not found in st-michael-cannes-backend",
      releaseId: RELEASE_ID,
      path: pathname,
      availableRoutes: ["/healthz", "/api/site", "/api/services", "/api/translate/status", "/status", "POST /api/translate"]
    });
  } catch (error) {
    sendJson(request, response, 500, {
      ok: false,
      error: error.message || "Internal server error",
      releaseId: RELEASE_ID
    });
  }
});

server.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT} (${RELEASE_ID})`);
});
