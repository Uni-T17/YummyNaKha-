// TC5 capture proxy: sits between the app (OCR_SERVICE_URL=http://127.0.0.1:8766)
// and our PaddleOCR service (127.0.0.1:8765). Records every request's method, path,
// headers and a summary of the body (size, SHA-256, magic bytes, printable-text scan),
// then forwards it unchanged. Usage: node ocr-capture-proxy.mjs <out.jsonl>
import http from "node:http";
import { createHash } from "node:crypto";
import { appendFileSync } from "node:fs";

const OUT = process.argv[2] ?? "ocr-capture.jsonl";
const UPSTREAM = { host: "127.0.0.1", port: 8765 };

http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks);
    // Printable ASCII runs ≥ 6 chars: where an email, name, token or JSON field would show up.
    const ascii = body.toString("latin1").match(/[\x20-\x7e]{6,}/g) ?? [];
    appendFileSync(OUT, JSON.stringify({
      at: new Date().toISOString(),
      method: req.method,
      path: req.url,
      headers: req.headers,
      body: {
        bytes: body.length,
        sha256: createHash("sha256").update(body).digest("hex"),
        magic: body.subarray(0, 4).toString("hex"),
        containsAt: body.includes("@"),
        containsJsonBrace: body.subarray(0, 1).toString() === "{",
        printableRunsSample: ascii.slice(0, 12),
        printableRunsCount: ascii.length,
      },
    }) + "\n");
    const up = http.request({ ...UPSTREAM, method: req.method, path: req.url, headers: req.headers }, (ur) => {
      res.writeHead(ur.statusCode ?? 502, ur.headers);
      ur.pipe(res);
    });
    up.on("error", () => { res.writeHead(502); res.end(); });
    up.end(body);
  });
}).listen(8766, "127.0.0.1", () => console.log("capture proxy on 127.0.0.1:8766 → 8765"));
