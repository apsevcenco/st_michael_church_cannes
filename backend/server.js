const http = require("node:http");

const PORT = Number(process.env.PORT || 10000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";
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

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);

  response.writeHead(statusCode, {
    ...SECURITY_HEADERS,
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  });

  response.end(body);
}

const server = http.createServer((request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      ...SECURITY_HEADERS,
      "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    });
    response.end();
    return;
  }

  if (request.method !== "GET") {
    sendJson(response, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname === "/" || url.pathname === "/healthz") {
    sendJson(response, 200, { ok: true, service: "st-michael-cannes-backend" });
    return;
  }

  if (url.pathname === "/api/site") {
    sendJson(response, 200, siteInfo);
    return;
  }

  if (url.pathname === "/api/services") {
    sendJson(response, 200, {
      services: [],
      message: "The current service schedule is managed on the website through the CMS."
    });
    return;
  }

  sendJson(response, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
