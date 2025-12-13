var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-60PE5C/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-60PE5C/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// src/index.ts
var ALLOWED_ORIGINS = /* @__PURE__ */ new Set([
  "http://localhost:5173",
  "http://localhost:8081"
]);
var VALID_WORDS = [
  "ABOUT",
  "ABOVE",
  "ABUSE",
  "ACTOR",
  "ACUTE",
  "ADMIT",
  "ADOPT",
  "ADULT",
  "AFTER",
  "AGAIN",
  "AGENT",
  "AGREE",
  "AHEAD",
  "ALARM",
  "ALBUM",
  "ALERT",
  "ALIKE",
  "ALIVE",
  "ALLOW",
  "ALONE",
  "ALONG",
  "ALTER",
  "ANGEL",
  "ANGER",
  "ANGLE",
  "ANGRY",
  "APART",
  "APPLE",
  "APPLY",
  "ARENA",
  "ARGUE",
  "ARISE",
  "ARRAY",
  "ASIDE",
  "ASSET",
  "AUDIO",
  "AVOID",
  "AWAKE",
  "AWARD",
  "AWARE",
  "BADLY",
  "BAKER",
  "BASES",
  "BASIC",
  "BASIS",
  "BEACH",
  "BEGAN",
  "BEGIN",
  "BEGUN",
  "BEING",
  "BELOW",
  "BENCH",
  "BILLY",
  "BIRTH",
  "BLACK",
  "BLADE",
  "BLAME",
  "BLIND",
  "BLOCK",
  "BLOOD",
  "BOARD",
  "BOOST",
  "BOOTH",
  "BOUND",
  "BRAIN",
  "BRAND",
  "BREAD",
  "BREAK",
  "BREED",
  "BRIEF",
  "BRING",
  "BROAD",
  "BROKE",
  "BROWN",
  "BUILD",
  "BUILT",
  "BUYER",
  "CABLE",
  "CALIF",
  "CARRY",
  "CATCH",
  "CAUSE",
  "CHAIN",
  "CHAIR",
  "CHART",
  "CHASE",
  "CHEAP",
  "CHECK",
  "CHEST",
  "CHIEF",
  "CHILD",
  "CHINA",
  "CHOSE",
  "CIVIL",
  "CLAIM",
  "CLASS",
  "CLEAN",
  "CLEAR",
  "CLICK",
  "CLOCK",
  "CLOSE",
  "COACH",
  "COAST",
  "COULD",
  "COUNT",
  "COURT",
  "COVER",
  "CRACK",
  "CRAFT",
  "CRASH",
  "CRAZY",
  "CREAM",
  "CRIME",
  "CROSS",
  "CROWD",
  "CROWN",
  "CRUDE",
  "CURVE",
  "CYCLE",
  "DAILY",
  "DANCE",
  "DATED",
  "DEALT",
  "DEATH",
  "DEBUT",
  "DELAY",
  "DEPTH",
  "DOING",
  "DOUBT",
  "DOZEN",
  "DRAFT",
  "DRAMA",
  "DRANK",
  "DRAWN",
  "DREAM",
  "DRESS",
  "DRILL",
  "DRINK",
  "DRIVE",
  "DROVE",
  "DYING",
  "EAGER",
  "EARLY",
  "EARTH",
  "EIGHT",
  "ELITE",
  "EMPTY",
  "ENEMY",
  "ENJOY",
  "ENTER",
  "ENTRY",
  "EQUAL",
  "ERROR",
  "EVENT",
  "EVERY",
  "EXACT",
  "EXIST",
  "EXTRA",
  "FAITH",
  "FALSE",
  "FAULT",
  "FIBER",
  "FIELD",
  "FIFTH",
  "FIFTY",
  "FIGHT",
  "FINAL",
  "FIRST",
  "FIXED",
  "FLASH",
  "FLEET",
  "FLOOR",
  "FLUID",
  "FOCUS",
  "FORCE",
  "FORTH",
  "FORTY",
  "FORUM",
  "FOUND",
  "FRAME",
  "FRANK",
  "FRAUD",
  "FRESH",
  "FRONT",
  "FRUIT",
  "FULLY",
  "FUNNY",
  "GIANT",
  "GIVEN",
  "GLASS",
  "GLOBE",
  "GOING",
  "GRACE",
  "GRADE",
  "GRAND",
  "GRANT",
  "GRASS",
  "GREAT",
  "GREEN",
  "GROSS",
  "GROUP",
  "GROWN",
  "GUARD",
  "GUESS",
  "GUEST",
  "GUIDE",
  "HAPPY",
  "HARRY",
  "HEART",
  "HEAVY",
  "HENCE",
  "HENRY",
  "HORSE",
  "HOTEL",
  "HOUSE",
  "HUMAN",
  "IDEAL",
  "IMAGE",
  "INDEX",
  "INNER",
  "INPUT",
  "ISSUE",
  "JAPAN",
  "JIMMY",
  "JOINT",
  "JONES",
  "JUDGE",
  "KNOWN",
  "LABEL",
  "LARGE",
  "LASER",
  "LATER",
  "LAUGH",
  "LAYER",
  "LEARN",
  "LEASE",
  "LEAST",
  "LEAVE",
  "LEGAL",
  "LEMON",
  "LEVEL",
  "LEWIS",
  "LIGHT",
  "LIMIT",
  "LINKS",
  "LIVES",
  "LOCAL",
  "LOGIC",
  "LOOSE",
  "LOWER",
  "LUCKY",
  "LUNCH",
  "LYING",
  "MAGIC",
  "MAJOR",
  "MAKER",
  "MARCH",
  "MARIA",
  "MATCH",
  "MAYBE",
  "MAYOR",
  "MEANT",
  "MEDIA",
  "METAL",
  "MIGHT",
  "MINOR",
  "MINUS",
  "MIXED",
  "MODEL",
  "MONEY",
  "MONTH",
  "MORAL",
  "MOTOR",
  "MOUNT",
  "MOUSE",
  "MOUTH",
  "MOVIE",
  "MUSIC",
  "NEEDS",
  "NEVER",
  "NEWLY",
  "NIGHT",
  "NOISE",
  "NORTH",
  "NOTED",
  "NOVEL",
  "NURSE",
  "OCCUR",
  "OCEAN",
  "OFFER",
  "OFTEN",
  "ORDER",
  "OTHER",
  "OUGHT",
  "PAINT",
  "PANEL",
  "PAPER",
  "PARTY",
  "PEACE",
  "PETER",
  "PHASE",
  "PHONE",
  "PHOTO",
  "PIECE",
  "PILOT",
  "PITCH",
  "PLACE",
  "PLAIN",
  "PLANE",
  "PLANT",
  "PLATE",
  "POINT",
  "POUND",
  "POWER",
  "PRESS",
  "PRICE",
  "PRIDE",
  "PRIME",
  "PRINT",
  "PRIOR",
  "PRIZE",
  "PROOF",
  "PROUD",
  "PROVE",
  "QUEEN",
  "QUICK",
  "QUIET",
  "QUITE",
  "RADIO",
  "RAISE",
  "RANGE",
  "RAPID",
  "RATIO",
  "REACH",
  "READY",
  "REFER",
  "RIGHT",
  "RIVAL",
  "RIVER",
  "ROBIN",
  "ROGER",
  "ROMAN",
  "ROUGH",
  "ROUND",
  "ROUTE",
  "ROYAL",
  "RURAL",
  "SCALE",
  "SCENE",
  "SCOPE",
  "SCORE",
  "SENSE",
  "SERVE",
  "SEVEN",
  "SHALL",
  "SHAPE",
  "SHARE",
  "SHARP",
  "SHEET",
  "SHELF",
  "SHELL",
  "SHIFT",
  "SHINE",
  "SHIRT",
  "SHOCK",
  "SHOOT",
  "SHORT",
  "SHOWN",
  "SIGHT",
  "SINCE",
  "SIXTH",
  "SIXTY",
  "SIZED",
  "SKILL",
  "SLEEP",
  "SLIDE",
  "SMALL",
  "SMART",
  "SMILE",
  "SMITH",
  "SMOKE",
  "SOLID",
  "SOLVE",
  "SORRY",
  "SOUND",
  "SOUTH",
  "SPACE",
  "SPARE",
  "SPEAK",
  "SPEED",
  "SPEND",
  "SPENT",
  "SPLIT",
  "SPOKE",
  "SPORT",
  "STAFF",
  "STAGE",
  "STAKE",
  "STAND",
  "START",
  "STATE",
  "STEAM",
  "STEEL",
  "STICK",
  "STILL",
  "STOCK",
  "STONE",
  "STOOD",
  "STORE",
  "STORM",
  "STORY",
  "STRIP",
  "STUCK",
  "STUDY",
  "STUFF",
  "STYLE",
  "SUGAR",
  "SUITE",
  "SUPER",
  "SWEET",
  "TABLE",
  "TAKEN",
  "TASTE",
  "TAXES",
  "TEACH",
  "TERRY",
  "TEXAS",
  "THANK",
  "THEFT",
  "THEIR",
  "THEME",
  "THERE",
  "THESE",
  "THICK",
  "THING",
  "THINK",
  "THIRD",
  "THOSE",
  "THREE",
  "THREW",
  "THROW",
  "TIGHT",
  "TIMES",
  "TITLE",
  "TODAY",
  "TOPIC",
  "TOTAL",
  "TOUCH",
  "TOUGH",
  "TOWER",
  "TRACK",
  "TRADE",
  "TRAIN",
  "TREAT",
  "TREND",
  "TRIAL",
  "TRIBE",
  "TRICK",
  "TRIED",
  "TRIES",
  "TROOP",
  "TRUCK",
  "TRULY",
  "TRUMP",
  "TRUST",
  "TRUTH",
  "TWICE",
  "UNDER",
  "UNDUE",
  "UNION",
  "UNITY",
  "UNTIL",
  "UPPER",
  "URBAN",
  "USAGE",
  "USUAL",
  "VALID",
  "VALUE",
  "VIDEO",
  "VIRUS",
  "VISIT",
  "VITAL",
  "VOCAL",
  "VOICE",
  "WASTE",
  "WATCH",
  "WATER",
  "WHEEL",
  "WHERE",
  "WHICH",
  "WHILE",
  "WHITE",
  "WHOLE",
  "WHOSE",
  "WOMAN",
  "WOMEN",
  "WORLD",
  "WORRY",
  "WORSE",
  "WORST",
  "WORTH",
  "WOULD",
  "WOUND",
  "WRITE",
  "WRONG",
  "WROTE",
  "YOUNG",
  "YOUTH"
];
var SESSION_DURATION_MS = 7e4;
var RATE_LIMIT_WINDOW_MS = 6e4;
var RATE_LIMIT_MAX_GUESSES = 20;
var MAX_WORDLE_ATTEMPTS = 6;
var FREE_HINTS = 3;
var FREE_SEARCHES = 3;
var PAID_ACTION_COST = 10;
var DEFAULT_NAME = "Player";
var STORAGE_KEY = "record";
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
__name(isObject, "isObject");
function deepMerge(target, patch) {
  for (const [key, value] of Object.entries(patch)) {
    const current = target[key];
    if (isObject(current) && isObject(value)) {
      target[key] = deepMerge({ ...current }, value);
    } else if (value !== void 0) {
      target[key] = value;
    }
  }
  return target;
}
__name(deepMerge, "deepMerge");
function isValidWordFromList(word) {
  return VALID_WORDS.includes(word.toUpperCase());
}
__name(isValidWordFromList, "isValidWordFromList");
function randomWord() {
  const idx = randomIndex(VALID_WORDS.length);
  return VALID_WORDS[idx];
}
__name(randomWord, "randomWord");
function randomIndex(maxExclusive) {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0] % maxExclusive;
}
__name(randomIndex, "randomIndex");
function revealLetter(word) {
  const position = randomIndex(word.length);
  return { letter: word[position], position };
}
__name(revealLetter, "revealLetter");
function isSessionActive(session, now) {
  if (!session)
    return false;
  const expiresAt = Date.parse(session.expiresAt);
  return now < expiresAt;
}
__name(isSessionActive, "isSessionActive");
function remainingMs(session, now) {
  if (!session)
    return 0;
  return Math.max(0, Date.parse(session.expiresAt) - now);
}
__name(remainingMs, "remainingMs");
function updateWordleStats(record, session, victory, finishedAtMs) {
  const started = Date.parse(session.startedAt);
  const duration = Math.max(0, Math.min(finishedAtMs - started, SESSION_DURATION_MS));
  record.stats.gamesPlayed = (record.stats.gamesPlayed ?? 0) + 1;
  if (victory) {
    record.stats.gamesWon = (record.stats.gamesWon ?? 0) + 1;
  }
  record.stats.totalTime = (record.stats.totalTime ?? 0) + duration;
  record.stats.wordle = {
    ...record.stats.wordle ?? {},
    attempts: session.attempts,
    lastWord: session.word
  };
}
__name(updateWordleStats, "updateWordleStats");
function consumeAllowance(record, kind) {
  const key = kind === "hint" ? "hintUses" : "searchUses";
  const freeCap = kind === "hint" ? FREE_HINTS : FREE_SEARCHES;
  const current = record[key] ?? 0;
  if (current < freeCap) {
    record[key] = current + 1;
    return { charged: false, remainingFree: freeCap - (current + 1) };
  }
  if (record.coins < PAID_ACTION_COST) {
    throw new Error("Insufficient coins for this action");
  }
  record.coins -= PAID_ACTION_COST;
  record[key] = current + 1;
  return { charged: true, remainingFree: 0 };
}
__name(consumeAllowance, "consumeAllowance");
function evaluateGuess(guess, target) {
  const result = Array(guess.length).fill("absent");
  const targetCounts = {};
  for (let i = 0; i < target.length; i += 1) {
    const t = target[i];
    if (guess[i] === t) {
      result[i] = "correct";
    } else {
      targetCounts[t] = (targetCounts[t] || 0) + 1;
    }
  }
  for (let i = 0; i < target.length; i += 1) {
    if (result[i] === "correct")
      continue;
    const g = guess[i];
    if (targetCounts[g] > 0) {
      result[i] = "present";
      targetCounts[g] -= 1;
    }
  }
  return result;
}
__name(evaluateGuess, "evaluateGuess");
function enforceRateLimit(session, now) {
  session.guessTimestamps = session.guessTimestamps.filter((ts) => now - ts <= RATE_LIMIT_WINDOW_MS);
  if (session.guessTimestamps.length >= RATE_LIMIT_MAX_GUESSES) {
    throw new Error("Too many guesses; please slow down.");
  }
  session.guessTimestamps.push(now);
}
__name(enforceRateLimit, "enforceRateLimit");
function responseHeaders(origin) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-user-id"
  });
  if (!origin) {
    headers.set("Access-Control-Allow-Origin", "*");
  } else if (ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  return headers;
}
__name(responseHeaders, "responseHeaders");
function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) });
}
__name(jsonResponse, "jsonResponse");
function badRequest(message, origin) {
  return jsonResponse({ error: message }, 400, origin);
}
__name(badRequest, "badRequest");
function handleOptions(request) {
  const origin = request.headers.get("Origin");
  const headers = responseHeaders(origin);
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers });
}
__name(handleOptions, "handleOptions");
function normalizeUser(record) {
  return {
    ...record,
    name: record.name || DEFAULT_NAME,
    hintUses: record.hintUses ?? 0,
    searchUses: record.searchUses ?? 0,
    stats: {
      gamesPlayed: record.stats.gamesPlayed ?? 0,
      gamesWon: record.stats.gamesWon ?? 0,
      totalTime: record.stats.totalTime ?? 0,
      wordle: record.stats.wordle ?? {},
      sudoku: record.stats.sudoku ?? {},
      quiz: record.stats.quiz ?? {}
    },
    wordleSession: record.wordleSession ? {
      ...record.wordleSession,
      guessTimestamps: record.wordleSession.guessTimestamps ?? []
    } : void 0
  };
}
__name(normalizeUser, "normalizeUser");
function sanitizeUserForResponse(record, nowMs) {
  const normalized = normalizeUser(record);
  const session = normalized.wordleSession;
  return {
    ...normalized,
    wordleSession: session ? {
      gameId: session.gameId,
      wordLength: session.word.length,
      startedAt: session.startedAt,
      expiresAt: session.expiresAt,
      attempts: session.attempts,
      guessTimestamps: session.guessTimestamps,
      remainingTime: remainingMs(session, nowMs)
    } : void 0
  };
}
__name(sanitizeUserForResponse, "sanitizeUserForResponse");
async function readJson(request) {
  try {
    return await request.json();
  } catch (err) {
    throw new Error("Invalid JSON body");
  }
}
__name(readJson, "readJson");
function validateAmount(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error("amount must be a positive number");
  }
  return value;
}
__name(validateAmount, "validateAmount");
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
__name(nowIso, "nowIso");
function createDefaultUser(userId) {
  const timestamp = nowIso();
  return {
    userId,
    name: DEFAULT_NAME,
    coins: 0,
    stats: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalTime: 0,
      wordle: {},
      sudoku: {},
      quiz: {}
    },
    hintUses: 0,
    searchUses: 0,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
__name(createDefaultUser, "createDefaultUser");
var src_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }
    const origin = request.headers.get("Origin");
    const url = new URL(request.url);
    const { pathname } = url;
    if (!pathname.startsWith("/api/")) {
      return new Response(
        "Astra backend is running. Include 'x-user-id' header on /api requests.",
        { status: 200, headers: responseHeaders(origin) }
      );
    }
    let userId = request.headers.get("x-user-id")?.trim();
    let generatedUserId = null;
    if (!userId) {
      generatedUserId = crypto.randomUUID();
      userId = generatedUserId;
    }
    const id = env.USER_STATE.idFromName(userId);
    const stub = env.USER_STATE.get(id);
    const headers = new Headers(request.headers);
    headers.set("x-user-id", userId);
    const forwardedRequest = new Request(request.clone(), { headers });
    const response = await stub.fetch(forwardedRequest);
    if (generatedUserId) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("x-user-id", generatedUserId);
      const cloned = response.clone();
      return new Response(cloned.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }
    return response;
  }
};
var UserState = class {
  state;
  constructor(state) {
    this.state = state;
  }
  async fetch(request) {
    const url = new URL(request.url);
    const { pathname } = url;
    const origin = request.headers.get("Origin");
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }
    const userId = request.headers.get("x-user-id")?.trim();
    if (!userId) {
      return badRequest("Missing x-user-id header", origin);
    }
    try {
      switch (pathname) {
        case "/api/user/init":
          if (request.method !== "POST")
            return this.methodNotAllowed(origin);
          return await this.handleInit(userId, origin);
        case "/api/user":
          if (request.method !== "GET")
            return this.methodNotAllowed(origin);
          return await this.handleGet(userId, origin);
        case "/api/coins/add":
          if (request.method !== "POST")
            return this.methodNotAllowed(origin);
          return await this.handleAddCoins(request, userId, origin);
        case "/api/coins/spend":
          if (request.method !== "POST")
            return this.methodNotAllowed(origin);
          return await this.handleSpendCoins(request, userId, origin);
        case "/api/stats/update":
          if (request.method !== "POST")
            return this.methodNotAllowed(origin);
          return await this.handleUpdateStats(request, userId, origin);
        case "/api/wordle/word":
          if (request.method !== "GET")
            return this.methodNotAllowed(origin);
          return await this.handleWordleWord(userId, origin);
        case "/api/wordle/validate":
          if (request.method !== "POST")
            return this.methodNotAllowed(origin);
          return await this.handleWordleValidate(request, userId, origin);
        case "/api/wordle/hint":
          if (request.method !== "POST")
            return this.methodNotAllowed(origin);
          return await this.handleWordleAllowance(userId, origin, "hint");
        case "/api/wordle/search":
          if (request.method !== "POST")
            return this.methodNotAllowed(origin);
          return await this.handleWordleAllowance(userId, origin, "search");
        default:
          return jsonResponse({ error: "Not found" }, 404, origin);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      return jsonResponse({ error: message }, 400, origin);
    }
  }
  methodNotAllowed(origin) {
    return jsonResponse({ error: "Method not allowed" }, 405, origin);
  }
  async getRecord(userId) {
    const stored = await this.state.storage.get(STORAGE_KEY) || null;
    if (stored) {
      return normalizeUser(stored);
    }
    const record = createDefaultUser(userId);
    await this.state.storage.put(STORAGE_KEY, record);
    return record;
  }
  async saveRecord(record) {
    await this.state.storage.put(STORAGE_KEY, record);
  }
  async handleInit(userId, origin) {
    const record = await this.getRecord(userId);
    return jsonResponse({ user: sanitizeUserForResponse(record, Date.now()) }, 200, origin);
  }
  async handleGet(userId, origin) {
    const record = await this.getRecord(userId);
    return jsonResponse({ user: sanitizeUserForResponse(record, Date.now()) }, 200, origin);
  }
  async handleAddCoins(request, userId, origin) {
    const body = await readJson(request);
    const amount = validateAmount(body?.amount);
    const record = await this.getRecord(userId);
    record.coins += amount;
    record.updatedAt = nowIso();
    await this.saveRecord(record);
    return jsonResponse({ balance: record.coins, user: sanitizeUserForResponse(record, Date.now()) }, 200, origin);
  }
  async handleSpendCoins(request, userId, origin) {
    const body = await readJson(request);
    const amount = validateAmount(body?.amount);
    const record = await this.getRecord(userId);
    if (record.coins < amount) {
      return jsonResponse({ error: "Insufficient balance" }, 400, origin);
    }
    record.coins -= amount;
    record.updatedAt = nowIso();
    await this.saveRecord(record);
    return jsonResponse({ balance: record.coins, user: sanitizeUserForResponse(record, Date.now()) }, 200, origin);
  }
  async handleUpdateStats(request, userId, origin) {
    const body = await readJson(request);
    if (!isObject(body)) {
      throw new Error("Body must be an object");
    }
    const { statsPatch, name } = body;
    if (name !== void 0 && typeof name !== "string") {
      throw new Error("name must be a string");
    }
    if (statsPatch !== void 0 && !isObject(statsPatch)) {
      throw new Error("statsPatch must be an object");
    }
    const record = await this.getRecord(userId);
    if (name !== void 0 && name.trim().length > 0) {
      record.name = name.trim();
    }
    if (statsPatch) {
      record.stats = deepMerge(record.stats, statsPatch);
    }
    record.updatedAt = nowIso();
    await this.saveRecord(record);
    return jsonResponse({ user: record }, 200, origin);
  }
  async handleWordleWord(userId, origin) {
    const record = await this.getRecord(userId);
    const now = Date.now();
    const active = record.wordleSession;
    if (active && isSessionActive(active, now)) {
      const remaining = remainingMs(active, now);
      return jsonResponse(
        {
          gameId: active.gameId,
          wordLength: active.word.length,
          remainingTime: remaining,
          resumed: true
        },
        200,
        origin
      );
    }
    const word = randomWord();
    const gameId = crypto.randomUUID();
    const startedAt = new Date(now).toISOString();
    const expiresAt = new Date(now + SESSION_DURATION_MS).toISOString();
    record.wordleSession = {
      gameId,
      word,
      startedAt,
      expiresAt,
      attempts: 0,
      guessTimestamps: []
    };
    record.updatedAt = nowIso();
    await this.saveRecord(record);
    return jsonResponse({ gameId, wordLength: word.length, remainingTime: SESSION_DURATION_MS }, 200, origin);
  }
  async handleWordleValidate(request, userId, origin) {
    const body = await readJson(request);
    const guessRaw = typeof body?.guess === "string" ? body.guess.trim() : "";
    const gameId = typeof body?.gameId === "string" ? body.gameId.trim() : void 0;
    if (!guessRaw) {
      return jsonResponse({ error: "guess is required" }, 400, origin);
    }
    const guess = guessRaw.toUpperCase();
    if (guess.length !== 5 || /[^A-Z]/.test(guess)) {
      return jsonResponse({ error: "guess must be 5 letters" }, 400, origin);
    }
    if (!isValidWordFromList(guess)) {
      return jsonResponse({ error: "guess is not in word list" }, 400, origin);
    }
    const record = await this.getRecord(userId);
    const session = record.wordleSession;
    const now = Date.now();
    if (!session) {
      return jsonResponse({ error: "No active session" }, 409, origin);
    }
    if (gameId && session.gameId !== gameId) {
      return jsonResponse({ error: "Mismatched gameId" }, 409, origin);
    }
    if (!isSessionActive(session, now)) {
      record.wordleSession = void 0;
      record.updatedAt = nowIso();
      await this.saveRecord(record);
      return jsonResponse({ error: "Session expired", target: session.word }, 410, origin);
    }
    try {
      enforceRateLimit(session, now);
    } catch (err) {
      return jsonResponse({ error: err.message }, 429, origin);
    }
    session.attempts += 1;
    const result = evaluateGuess(guess, session.word);
    const victory = result.every((r) => r === "correct");
    if (victory) {
      updateWordleStats(record, session, true, now);
      record.wordleSession = void 0;
      record.updatedAt = nowIso();
      await this.saveRecord(record);
      return jsonResponse({ result, victory: true, target: session.word }, 200, origin);
    }
    const remainingTime = remainingMs(session, now);
    if (remainingTime <= 0) {
      updateWordleStats(record, session, false, now);
      record.wordleSession = void 0;
      record.updatedAt = nowIso();
      await this.saveRecord(record);
      return jsonResponse({ error: "Session expired", target: session.word }, 410, origin);
    }
    if (session.attempts >= MAX_WORDLE_ATTEMPTS) {
      const target = session.word;
      updateWordleStats(record, session, false, now);
      record.wordleSession = void 0;
      record.updatedAt = nowIso();
      await this.saveRecord(record);
      return jsonResponse({ result, victory: false, target, remainingTime }, 200, origin);
    }
    record.wordleSession = session;
    record.updatedAt = nowIso();
    await this.saveRecord(record);
    return jsonResponse({ result, victory: false, remainingTime }, 200, origin);
  }
  async handleWordleAllowance(userId, origin, kind) {
    const record = await this.getRecord(userId);
    const now = Date.now();
    const session = record.wordleSession;
    if (!session || !isSessionActive(session, now)) {
      return jsonResponse({ error: "No active session" }, 409, origin);
    }
    try {
      const { charged, remainingFree } = consumeAllowance(record, kind);
      const { letter, position } = revealLetter(session.word);
      record.updatedAt = nowIso();
      await this.saveRecord(record);
      const basePayload = {
        ok: true,
        charged,
        remainingFree,
        balance: record.coins,
        user: sanitizeUserForResponse(record, now),
        letter
      };
      if (kind === "hint") {
        return jsonResponse({ ...basePayload, position }, 200, origin);
      }
      return jsonResponse(basePayload, 200, origin);
    } catch (err) {
      return jsonResponse({ error: err.message }, 400, origin);
    }
  }
};
__name(UserState, "UserState");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-60PE5C/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-60PE5C/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  UserState,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
