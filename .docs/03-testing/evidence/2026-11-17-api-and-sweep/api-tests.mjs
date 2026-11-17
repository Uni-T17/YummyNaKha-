// API-level test run for TC1, TC2 (upload validation), TC3, TC4, TC6, TC14.
// Runs against the local test server + disposable test DB only.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://127.0.0.1:3100";
const FX = new URL("./fx/", import.meta.url).pathname;
const run = Date.now().toString(36);
const results = [];
const check = (tc, name, ok, detail = "") => { results.push({ tc, name, ok: !!ok, detail }); };
const sql = (q) =>
  execFileSync("docker", ["exec", "ynk-test-db", "psql", "-U", "ynk", "-d", "ynk_test", "-At", "-F", "|", "-c", q], { encoding: "utf8" }).trim();

class Client {
  constructor() { this.cookie = ""; }
  async req(method, path, body, extra = {}) {
    const headers = { ...(this.cookie ? { cookie: this.cookie } : {}), ...(extra.headers ?? {}) };
    let payload = body;
    if (body && !(body instanceof FormData)) { headers["content-type"] = "application/json"; payload = JSON.stringify(body); }
    const res = await fetch(BASE + path, { method, headers, body: payload, redirect: "manual" });
    const set = res.headers.getSetCookie?.() ?? [];
    for (const c of set) {
      const [pair] = c.split(";");
      const [k] = pair.split("=");
      const jar = Object.fromEntries(this.cookie.split("; ").filter(Boolean).map((x) => [x.split("=")[0], x]));
      jar[k] = pair;
      this.cookie = Object.values(jar).filter((x) => !x.endsWith("=")).join("; ");
    }
    this.lastSetCookie = set;
    let data = null;
    const text = await res.text();
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, data };
  }
}
const upload = (c, file, name, type = "image/jpeg") => {
  const fd = new FormData();
  fd.append("file", new Blob([readFileSync(FX + file)], { type }), name ?? file);
  return c.req("POST", "/api/images", fd);
};
const REQUIRED = ["terms", "privacy", "ai-disclaimer"];

// ---------- TC1: account + ordinary profile ----------
const A = new Client(), B = new Client();
const emailA = `tc-a-${run}@example.test`, emailB = `tc-b-${run}@example.test`;
const PW = `Tst-${run}-pw`;
let r = await A.req("POST", "/api/auth/register", { name: "Tester A", email: emailA, password: PW });
check("TC1", "Register account A", r.status === 201, `HTTP ${r.status}`);
const cookieLine = (A.lastSetCookie ?? []).join(" ");
check("TC1", "Session cookie is HttpOnly + SameSite (Secure only in production build)", /HttpOnly/i.test(cookieLine) && /SameSite=lax/i.test(cookieLine), cookieLine.replace(/=[^;]+/, "=<redacted>").slice(0, 120));
await B.req("POST", "/api/auth/register", { name: "Tester B", email: emailB, password: PW });
const userA = sql(`select id from "User" where email='${emailA}'`);
r = await A.req("POST", "/api/preferences/favorite", { name: "Chicken" });
check("TC1", "Save Chicken as a favourite", r.status < 300, `HTTP ${r.status}`);
r = await A.req("POST", "/api/preferences/dislike", { name: "Mushroom", reason: "dislike" });
check("TC1", "Save Mushroom as an ordinary dislike (no health consent needed)", r.status < 300, `HTTP ${r.status}`);
r = await A.req("DELETE", "/api/preferences/dislike", { name: "Mushroom" });
check("TC1", "Remove Mushroom", r.status < 300, `HTTP ${r.status}`);
await A.req("POST", "/api/auth/logout");
r = await A.req("GET", "/api/preferences");
check("TC1", "Signed-out request is refused", r.status === 401, `HTTP ${r.status}`);
r = await A.req("POST", "/api/auth/login", { email: emailA, password: "wrong-password" });
check("TC1", "Wrong password is refused", r.status === 401 || r.status === 422, `HTTP ${r.status}`);
r = await A.req("POST", "/api/auth/login", { email: emailA, password: PW });
check("TC1", "Sign back in", r.status === 200, `HTTP ${r.status}`);
r = await A.req("GET", "/api/preferences");
const prof = r.data?.profile;
check("TC1", "Favourite persisted, removed dislike stays removed", prof?.favs?.includes("Chicken") && !prof?.avoid?.some((a) => a.name === "Mushroom"), JSON.stringify(prof));
r = await B.req("GET", "/api/preferences");
check("TC1", "Account B cannot see A's profile", !JSON.stringify(r.data).includes("Chicken"), JSON.stringify(r.data?.profile));
const pw = sql(`select "passwordHash" from "User" where id='${userA}'`);
check("TC1", "Password stored only as salted scrypt hash", pw.startsWith("scrypt$") && !pw.includes(PW), pw.split("$").slice(0, 4).join("$") + "$…");
const tokenCookie = (A.cookie.match(/=([^;]+)/) ?? [])[1] ?? "";
const sessions = sql(`select * from "Session" where "userId"='${userA}'`);
check("TC1", "Session token stored hashed (raw cookie value not in DB)", sessions.length > 0 && tokenCookie && !sessions.includes(decodeURIComponent(tokenCookie)), `${sessions.split("\n").length} session row(s)`);
r = await A.req("GET", "/api/auth/google", undefined);
check("TC1", "Google OAuth sign-in configured", r.status === 302 || r.status === 307, `HTTP ${r.status} — no GOOGLE_CLIENT_ID in test env`);

// ---------- TC4: terms gate before processing ----------
r = await upload(A, "menu1.jpg");
const imgA = r.data?.image?.id;
check("TC2", "Valid JPG upload accepted", r.status === 201 && imgA, `HTTP ${r.status}`);
r = await A.req("POST", "/api/ai/analyze", { imageIds: [imgA] });
check("TC4", "Analyze refused with no acceptances (CONSENT_REQUIRED)", r.status === 403 && JSON.stringify(r.data).includes("CONSENT_REQUIRED"), `HTTP ${r.status} ${JSON.stringify(r.data).slice(0, 80)}`);
for (const missing of REQUIRED) {
  const C = new Client();
  await C.req("POST", "/api/auth/register", { name: "Gate", email: `tc-gate-${missing}-${run}@example.test`, password: PW });
  await C.req("POST", "/api/consents", { documents: REQUIRED.filter((d) => d !== missing) });
  const up = await upload(C, "menu1.jpg");
  const res = await C.req("POST", "/api/ai/analyze", { imageIds: [up.data?.image?.id] });
  check("TC4", `Analyze refused when '${missing}' is missing`, res.status === 403, `HTTP ${res.status}`);
}
{
  const C = new Client();
  await C.req("POST", "/api/auth/register", { name: "Old", email: `tc-old-${run}@example.test`, password: PW });
  const uid = sql(`select id from "User" where email='tc-old-${run}@example.test'`);
  for (const d of REQUIRED) sql(`insert into "ConsentRecord"(id,"userId",document,version,action) values ('old${d.replace(/-/g, "")}${run}','${uid}','${d}','0.0-old','ACCEPTED')`);
  const up = await upload(C, "menu1.jpg");
  const res = await C.req("POST", "/api/ai/analyze", { imageIds: [up.data?.image?.id] });
  check("TC4", "Analyze refused when acceptances are an outdated version", res.status === 403, `HTTP ${res.status}`);
}
r = await A.req("POST", "/api/consents", { documents: REQUIRED });
check("TC4", "Accept all current documents", r.status === 201, `HTTP ${r.status}`);
const recs = r.data?.records ?? [];
check("TC4", "Records keep user, document, version, timestamp, action", recs.length >= 3 && recs.every((x) => x.userId && x.document && x.version && x.timestamp && x.action), JSON.stringify(recs[0]));
r = await A.req("POST", "/api/consents", { documents: ["terms"], userId: "someone-else", version: "9.9" });
const latest = r.data?.records?.[0];
check("TC4", "Server stamps version/user itself (client values ignored)", latest && latest.version !== "9.9" && latest.userId === userA, JSON.stringify(latest));

// ---------- TC3: separate sensitive opt-in ----------
const S = new Client();
await S.req("POST", "/api/auth/register", { name: "Sens", email: `tc-s-${run}@example.test`, password: PW });
const userS = sql(`select id from "User" where email='tc-s-${run}@example.test'`);
r = await S.req("GET", "/api/preferences");
check("TC3", "Fresh profile has no health flag", !JSON.stringify(r.data).match(/allergy|doctor/), JSON.stringify(r.data?.profile));
r = await S.req("POST", "/api/preferences/dislike", { name: "Peanut", reason: "allergy" });
check("TC3", "Allergy write blocked before opt-in (direct API)", r.status >= 400 && r.status < 500, `HTTP ${r.status} ${r.data?.error?.code ?? ""}`);
check("TC3", "Nothing stored after the blocked write", sql(`select count(*) from "UserPreference" where "userId"='${userS}' and reason is not null`) === "0");
r = await S.req("POST", "/api/preferences/dislike", { name: "Shellfish", reason: "doctor" });
check("TC3", "Doctor-advised write blocked before opt-in", r.status >= 400 && r.status < 500, `HTTP ${r.status}`);
r = await S.req("POST", "/api/preferences/favorite", { name: "Chicken" });
check("TC3", "Ordinary favourite needs no health consent", r.status < 300, `HTTP ${r.status}`);
r = await S.req("POST", "/api/consents", { documents: ["health-data"] });
check("TC3", "Separate health-data opt-in is recorded", r.status === 201 && r.data.records.some((x) => x.document === "health-data" && x.action === "accepted"), `HTTP ${r.status}`);
r = await S.req("POST", "/api/preferences/dislike", { name: "Peanut", reason: "allergy" });
const r2 = await S.req("POST", "/api/preferences/dislike", { name: "Shellfish", reason: "doctor" });
check("TC3", "Allergy + doctor items saved after opt-in", r.status < 300 && r2.status < 300, `HTTP ${r.status}/${r2.status}`);
r = await S.req("DELETE", "/api/preferences/dislike", { name: "Shellfish" });
const p3 = (await S.req("GET", "/api/preferences")).data?.profile;
check("TC3", "Sensitive item can be deleted", r.status < 300 && !p3.avoid.some((a) => a.name === "Shellfish") && p3.avoid.some((a) => a.name === "Peanut" && a.reason === "allergy"), JSON.stringify(p3.avoid));

// ---------- TC6: withdrawal ----------
r = await S.req("POST", "/api/consents/withdraw", { document: "health-data" });
check("TC6", "Health consent can be withdrawn", r.status === 200, `HTTP ${r.status}`);
const hist = (await S.req("GET", "/api/consents")).data?.records ?? [];
const w = hist.find((x) => x.document === "health-data" && x.action === "withdrawn");
check("TC6", "Withdrawal is in history with user, version, timestamp, action", w && w.userId === userS && w.version && w.timestamp, JSON.stringify(w));
const p6 = (await S.req("GET", "/api/preferences")).data?.profile;
check("TC6", "Stored allergy reason deleted on withdrawal (food kept, no reason)", p6.avoid.some((a) => a.name === "Peanut" && !a.reason), JSON.stringify(p6.avoid));
check("TC6", "DB holds no allergy/doctor reason after withdrawal", sql(`select count(*) from "UserPreference" where "userId"='${userS}' and reason in ('ALLERGY','DOCTOR')`) === "0");
r = await S.req("POST", "/api/preferences/dislike", { name: "Egg", reason: "allergy" });
check("TC6", "New sensitive write blocked after withdrawal", r.status >= 400 && r.status < 500, `HTTP ${r.status}`);
check("TC6", "Ordinary preferences still usable", p6.favs.includes("Chicken"));
r = await A.req("POST", "/api/consents/withdraw", { document: "terms" });
check("TC6", "Terms cannot be withdrawn on its own (ends with account)", r.status === 400, `HTTP ${r.status}`);

// ---------- TC2: upload validation ----------
r = await upload(A, "menu1.png", "menu1.png", "image/png");
check("TC2", "Valid PNG upload accepted", r.status === 201, `HTTP ${r.status}`);
r = await upload(A, "empty.jpg");
check("TC2", "Zero-byte file rejected with readable error", r.status === 400 && r.data?.error?.message, `HTTP ${r.status} "${r.data?.error?.message}"`);
r = await upload(A, "fake.jpg");
check("TC2", "Text file renamed .jpg rejected", r.status === 415, `HTTP ${r.status} "${r.data?.error?.message}"`);
r = await upload(A, "big.jpg");
check("TC2", "8 MiB + 1 byte rejected", r.status === 413, `HTTP ${r.status} "${r.data?.error?.message}"`);
check("TC2", "Rejected files leave no image row", sql(`select count(*) from "MenuImage" where "userId"='${userA}'`) === "2");

// ---------- TC14: account deletion + traffic log ----------
const D = new Client();
await D.req("POST", "/api/auth/register", { name: "Del", email: `tc-d-${run}@example.test`, password: PW });
const userD = sql(`select id from "User" where email='tc-d-${run}@example.test'`);
await D.req("POST", "/api/consents", { documents: REQUIRED });
await D.req("POST", "/api/preferences/favorite", { name: "Pork" });
await upload(D, "menu1.jpg");
const logsBefore = Number(sql(`select count(*) from "AccessLog" where "userId"='${userD}'`));
r = await D.req("DELETE", "/api/auth/me", { confirm: "wrong" });
check("TC14", "Deletion needs the password again", r.status === 422, `HTTP ${r.status}`);
r = await D.req("DELETE", "/api/auth/me", { confirm: PW });
check("TC14", "Account deletion succeeds", r.status === 204, `HTTP ${r.status}`);
const left = ["User:id", "UserPreference:userId", "MenuImage:userId", "MenuAnalysis:userId", "ConsentRecord:userId", "Session:userId"]
  .map((t) => { const [tab, col] = t.split(":"); return [tab, sql(`select count(*) from "${tab}" where "${col}"='${userD}'`)]; });
check("TC14", "Profile, images, results, consents, sessions all removed", left.every(([, n]) => n === "0"), left.map(([t, n]) => `${t}=${n}`).join(" "));
const logsAfter = Number(sql(`select count(*) from "AccessLog" where "userId"='${userD}'`));
check("TC14", "Access-log rows survive content deletion", logsBefore > 0 && logsAfter >= logsBefore, `${logsBefore} before → ${logsAfter} after`);
const cols = sql(`select string_agg(column_name, ',') from information_schema.columns where table_name='AccessLog'`);
check("TC14", "Access log holds only traffic fields (no content)", !/text|profile|image|body/i.test(cols), cols);

console.log(JSON.stringify({ run, userA, results }, null, 1));
