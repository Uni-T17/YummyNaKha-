// Preloaded into the Next.js server (NODE_OPTIONS=--require ...). Logs every outbound
// connection the server opens, to NET_LOG_FILE, so outside calls can be listed:
//  - kind "socket": net.Socket#connect (pg, http, https)
//  - kind "net.client.socket": Node's diagnostics channel for every client TCP socket
//  - kind "fetch": undici diagnostics channel (Node's built-in fetch), origin + path + method
// It records destinations only, never payloads.
const net = require("node:net");
const fs = require("node:fs");
const dc = require("node:diagnostics_channel");
const file = process.env.NET_LOG_FILE;
const log = (o) => { try { if (file) fs.appendFileSync(file, JSON.stringify({ at: new Date().toISOString(), pid: process.pid, ...o }) + "\n"); } catch {} };
const orig = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const o = typeof args[0] === "object" && args[0] !== null ? args[0] : { port: args[0], host: args[1] };
  if (o.port || o.host) log({ kind: "socket", host: o.host ?? "localhost", port: o.port ?? null });
  return orig.apply(this, args);
};
dc.subscribe("net.client.socket", ({ socket }) => {
  socket.once("connect", () => log({ kind: "net.client.socket", host: socket.remoteAddress, port: socket.remotePort }));
});
dc.subscribe("undici:request:create", ({ request }) => log({ kind: "fetch", method: request.method, origin: String(request.origin), path: String(request.path).split("?")[0] }));
