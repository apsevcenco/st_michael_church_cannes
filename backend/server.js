const http = require("node:http");

const PORT = Number(process.env.PORT || 10000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "*";

const siteInfo = {
  parish: "Parish of Archangel Michael in Cannes",
  city: "Cannes",
  address: "40 boulevard Alexandre III, 06400 Cannes, France",
  status: "prototype",
  updatedAt: new Date().toISOString()
};

const services = [
  {
    date: "Sunday",
    time: "10:00",
    title: "Divine Liturgy",
    note: "Prototype schedule. Confirm with the parish before publication."
  },
  {
    date: "Saturday",
    time: "17:00",
    title: "Vigil",
    note: "Prototype schedule. Confirm with the parish before publication."
  }
];

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store"
  });

  response.end(body);
}

const server = http.createServer((request, response) => {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": FRONTEND_ORIGIN,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    response.end();
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
    sendJson(response, 200, { services });
    return;
  }

  sendJson(response, 404, { ok: false, error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
