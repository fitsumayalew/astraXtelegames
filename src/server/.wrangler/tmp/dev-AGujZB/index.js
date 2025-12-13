var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-UZveoo/checked-fetch.js
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

// .wrangler/tmp/bundle-UZveoo/strip-cf-connecting-ip-header.js
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
  "http://localhost:8080",
  "http://localhost:8081",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8081"
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
var QUIZ_FREE_FIFTY = 2;
var QUIZ_FREE_FREEZE = 2;
var QUIZ_COST_FIFTY = 20;
var QUIZ_COST_FREEZE = 10;
var QUIZ_LIVES = 3;
var QUIZ_RATE_LIMIT_WINDOW_MS = 3e4;
var QUIZ_RATE_LIMIT_MAX_ASSISTS = 3;
var QUIZ_FREEZE_SECONDS = 8;
var QUIZ_OPTIONS_COUNT = 4;
var QUIZ_ROUND_QUESTIONS = 10;
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
function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}
__name(shuffleArray, "shuffleArray");
function revealLetterUnique(session) {
  const word = session.word;
  const revealed = new Set(session.revealedPositions ?? []);
  const available = [];
  for (let i = 0; i < word.length; i += 1) {
    if (!revealed.has(i))
      available.push(i);
  }
  const position = available.length > 0 ? available[randomIndex(available.length)] : 0;
  return { letter: word[position], position };
}
__name(revealLetterUnique, "revealLetterUnique");
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
    } : void 0,
    quizSession: record.quizSession ? {
      ...record.quizSession,
      _server: record.quizSession._server ?? { perQuestion: {}, lastAssistTimestamps: [] }
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
    } : void 0,
    quizSession: normalized.quizSession ? {
      id: normalized.quizSession.id,
      userId: normalized.quizSession.userId,
      questionOrder: normalized.quizSession.questionOrder,
      pointer: normalized.quizSession.pointer,
      lives: normalized.quizSession.lives,
      score: normalized.quizSession.score,
      coinsEarned: normalized.quizSession.coinsEarned,
      assistsUsed: normalized.quizSession.assistsUsed,
      createdAt: normalized.quizSession.createdAt,
      updatedAt: normalized.quizSession.updatedAt,
      state: normalized.quizSession.state
    } : void 0
  };
}
__name(sanitizeUserForResponse, "sanitizeUserForResponse");
var QUIZ_POOL_INTERNAL = [
  {
    id: "q1",
    category: "general",
    difficulty: "easy",
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Venus", "Jupiter"],
    coinsReward: 5,
    correctIndex: 1
  },
  {
    id: "q2",
    category: "tech",
    difficulty: "medium",
    question: "What does CPU stand for?",
    options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Compute Power Unit"],
    coinsReward: 5,
    correctIndex: 1
  },
  {
    id: "q3",
    category: "science",
    difficulty: "easy",
    question: "H2O is the chemical formula for what?",
    options: ["Oxygen", "Hydrogen", "Water", "Helium"],
    coinsReward: 5,
    correctIndex: 2
  },
  // Additional general knowledge questions
  { id: "q4", category: "general", difficulty: "easy", question: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], coinsReward: 5, correctIndex: 2 },
  { id: "q5", category: "general", difficulty: "easy", question: "Which animal is the largest land animal?", options: ["Giraffe", "Elephant", "Hippopotamus", "Rhino"], coinsReward: 5, correctIndex: 1 },
  { id: "q6", category: "general", difficulty: "easy", question: "How many continents are there on Earth?", options: ["5", "6", "7", "8"], coinsReward: 5, correctIndex: 2 },
  { id: "q7", category: "general", difficulty: "easy", question: "Which ocean is the largest?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], coinsReward: 5, correctIndex: 2 },
  { id: "q8", category: "general", difficulty: "easy", question: "Which country invented pizza?", options: ["France", "Spain", "Italy", "Greece"], coinsReward: 5, correctIndex: 2 },
  { id: "q9", category: "general", difficulty: "easy", question: "What is the tallest mountain in the world?", options: ["K2", "Mount Everest", "Kilimanjaro", "Denali"], coinsReward: 5, correctIndex: 1 },
  { id: "q10", category: "general", difficulty: "easy", question: "Which instrument has keys, pedals, and strings?", options: ["Guitar", "Piano", "Violin", "Flute"], coinsReward: 5, correctIndex: 1 },
  { id: "q11", category: "general", difficulty: "easy", question: "What gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"], coinsReward: 5, correctIndex: 2 },
  { id: "q12", category: "general", difficulty: "easy", question: "Which language has the most native speakers?", options: ["English", "Spanish", "Mandarin Chinese", "Hindi"], coinsReward: 5, correctIndex: 2 },
  { id: "q13", category: "general", difficulty: "easy", question: "What is the hardest natural substance?", options: ["Gold", "Iron", "Diamond", "Quartz"], coinsReward: 5, correctIndex: 2 },
  { id: "q14", category: "general", difficulty: "easy", question: "Which planet has the most moons?", options: ["Earth", "Mars", "Jupiter", "Saturn"], coinsReward: 5, correctIndex: 2 },
  { id: "q15", category: "general", difficulty: "easy", question: "Which country hosts the city of Tokyo?", options: ["China", "South Korea", "Japan", "Thailand"], coinsReward: 5, correctIndex: 2 },
  { id: "q16", category: "general", difficulty: "easy", question: "What is the chemical symbol for gold?", options: ["Ag", "Au", "Gd", "Go"], coinsReward: 5, correctIndex: 1 },
  { id: "q17", category: "general", difficulty: "easy", question: "Which sport is known as the 'king of sports'?", options: ["Basketball", "Cricket", "Soccer (Football)", "Tennis"], coinsReward: 5, correctIndex: 2 },
  { id: "q18", category: "general", difficulty: "easy", question: "Which continent is the Sahara Desert located on?", options: ["Asia", "Africa", "Australia", "South America"], coinsReward: 5, correctIndex: 1 },
  { id: "q19", category: "general", difficulty: "easy", question: "What is the largest mammal?", options: ["Elephant", "Blue Whale", "Giraffe", "Orca"], coinsReward: 5, correctIndex: 1 },
  { id: "q20", category: "general", difficulty: "easy", question: "Which country is famous for the Taj Mahal?", options: ["Pakistan", "India", "Bangladesh", "Nepal"], coinsReward: 5, correctIndex: 1 },
  { id: "q21", category: "general", difficulty: "easy", question: "Which fruit is known for keeping doctors away?", options: ["Banana", "Orange", "Apple", "Pear"], coinsReward: 5, correctIndex: 2 },
  { id: "q22", category: "general", difficulty: "easy", question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], coinsReward: 5, correctIndex: 2 },
  { id: "q23", category: "general", difficulty: "easy", question: "Which part of the plant conducts photosynthesis?", options: ["Roots", "Stem", "Leaves", "Flowers"], coinsReward: 5, correctIndex: 2 },
  { id: "q24", category: "general", difficulty: "easy", question: "Which metal is liquid at room temperature?", options: ["Mercury", "Aluminum", "Iron", "Copper"], coinsReward: 5, correctIndex: 0 },
  { id: "q25", category: "general", difficulty: "easy", question: "Which continent is the smallest by land area?", options: ["Europe", "Australia", "Antarctica", "South America"], coinsReward: 5, correctIndex: 1 },
  { id: "q26", category: "general", difficulty: "easy", question: "What is the main ingredient in guacamole?", options: ["Tomato", "Avocado", "Pepper", "Onion"], coinsReward: 5, correctIndex: 1 },
  { id: "q27", category: "general", difficulty: "easy", question: "Which country is known as the Land of the Rising Sun?", options: ["China", "Japan", "Vietnam", "Philippines"], coinsReward: 5, correctIndex: 1 },
  { id: "q28", category: "general", difficulty: "easy", question: "What is the largest planet in our solar system?", options: ["Earth", "Saturn", "Jupiter", "Neptune"], coinsReward: 5, correctIndex: 2 },
  { id: "q29", category: "general", difficulty: "easy", question: "Which element do humans and animals need to breathe?", options: ["Hydrogen", "Oxygen", "Carbon", "Nitrogen"], coinsReward: 5, correctIndex: 1 },
  { id: "q30", category: "general", difficulty: "easy", question: "Which country gifted the Statue of Liberty to the USA?", options: ["United Kingdom", "France", "Spain", "Germany"], coinsReward: 5, correctIndex: 1 },
  { id: "q31", category: "general", difficulty: "easy", question: "What is the largest desert in the world?", options: ["Gobi", "Sahara", "Antarctic Desert", "Arabian"], coinsReward: 5, correctIndex: 2 },
  { id: "q32", category: "general", difficulty: "easy", question: "Which scientist proposed the theory of relativity?", options: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Galileo Galilei"], coinsReward: 5, correctIndex: 1 },
  { id: "q33", category: "general", difficulty: "easy", question: "Which organ pumps blood through the body?", options: ["Lungs", "Heart", "Liver", "Kidneys"], coinsReward: 5, correctIndex: 1 },
  { id: "q34", category: "general", difficulty: "easy", question: "Which continent is home to the Amazon rainforest?", options: ["Africa", "Asia", "South America", "Australia"], coinsReward: 5, correctIndex: 2 },
  { id: "q35", category: "general", difficulty: "easy", question: "What is the boiling point of water at sea level?", options: ["90\xB0C", "100\xB0C", "110\xB0C", "120\xB0C"], coinsReward: 5, correctIndex: 1 },
  { id: "q36", category: "general", difficulty: "easy", question: "Which country is known for the pyramids of Giza?", options: ["Mexico", "Egypt", "Peru", "Sudan"], coinsReward: 5, correctIndex: 1 },
  { id: "q37", category: "general", difficulty: "easy", question: "Which animal is known as the King of the Jungle?", options: ["Tiger", "Lion", "Leopard", "Jaguar"], coinsReward: 5, correctIndex: 1 },
  { id: "q38", category: "general", difficulty: "easy", question: "Which gas do humans exhale?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], coinsReward: 5, correctIndex: 1 },
  { id: "q39", category: "general", difficulty: "easy", question: "Which city is known as the Big Apple?", options: ["Los Angeles", "Chicago", "New York", "Miami"], coinsReward: 5, correctIndex: 2 },
  { id: "q40", category: "general", difficulty: "easy", question: "What is the primary language spoken in Brazil?", options: ["Spanish", "Portuguese", "French", "English"], coinsReward: 5, correctIndex: 1 }
];
function filterQuizPool(limit, category, difficulty) {
  let list = QUIZ_POOL_INTERNAL;
  if (category)
    list = list.filter((q) => q.category === category);
  if (difficulty)
    list = list.filter((q) => q.difficulty === difficulty);
  if (typeof limit === "number" && Number.isFinite(limit))
    list = list.slice(0, Math.max(0, limit));
  return list.map(({ correctIndex: _ci, ...rest }) => ({ ...rest }));
}
__name(filterQuizPool, "filterQuizPool");
function sanitizeQuestionForClient(q, optionOrder) {
  if (!optionOrder)
    return q;
  const shuffledOptions = optionOrder.map((i) => q.options[i]);
  return { ...q, options: shuffledOptions };
}
__name(sanitizeQuestionForClient, "sanitizeQuestionForClient");
function ensureQuizSessionServerState(session) {
  if (!session._server)
    session._server = { perQuestion: {}, lastAssistTimestamps: [] };
  if (!session._server.lastAssistTimestamps)
    session._server.lastAssistTimestamps = [];
}
__name(ensureQuizSessionServerState, "ensureQuizSessionServerState");
function rateLimitAssist(session, now) {
  ensureQuizSessionServerState(session);
  const arr = session._server.lastAssistTimestamps;
  const filtered = arr.filter((ts) => now - ts <= QUIZ_RATE_LIMIT_WINDOW_MS);
  session._server.lastAssistTimestamps = filtered;
  if (filtered.length >= QUIZ_RATE_LIMIT_MAX_ASSISTS) {
    throw new Error("Too many assists; please slow down.");
  }
  filtered.push(now);
}
__name(rateLimitAssist, "rateLimitAssist");
function getCurrentQuestionIndex(session) {
  if (session.pointer < 0 || session.pointer >= session.questionOrder.length)
    return null;
  return session.questionOrder[session.pointer] ?? null;
}
__name(getCurrentQuestionIndex, "getCurrentQuestionIndex");
function getOrCreateShuffleForQuestion(session, poolIndex) {
  ensureQuizSessionServerState(session);
  const entry = session._server.perQuestion[poolIndex];
  if (entry)
    return entry.optionShuffle;
  const correctIndex = QUIZ_POOL_INTERNAL[poolIndex].correctIndex;
  const order = shuffleArray([...Array(QUIZ_OPTIONS_COUNT).keys()]);
  session._server.perQuestion[poolIndex] = { correctIndex, optionShuffle: order };
  return order;
}
__name(getOrCreateShuffleForQuestion, "getOrCreateShuffleForQuestion");
function checkAnswer(session, poolIndex, selectedIndex) {
  ensureQuizSessionServerState(session);
  const entry = session._server.perQuestion[poolIndex];
  if (!entry) {
    getOrCreateShuffleForQuestion(session, poolIndex);
  }
  const { correctIndex, optionShuffle } = session._server.perQuestion[poolIndex];
  const selectedOriginalIndex = optionShuffle[selectedIndex];
  return selectedOriginalIndex === correctIndex;
}
__name(checkAnswer, "checkAnswer");
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
    const forwardedRequest = new Request(request, { headers });
    const response = await stub.fetch(forwardedRequest);
    if (generatedUserId) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("x-user-id", generatedUserId);
      return new Response(response.body, {
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
        case "/api/quiz/questions":
          if (request.method !== "GET")
            return this.methodNotAllowed(origin);
          return await this.handleQuizQuestions(request, userId, origin);
        case "/api/quiz/session/start":
          if (request.method !== "POST")
            return this.methodNotAllowed(origin);
          return await this.handleQuizSessionStart(request, userId, origin);
        default:
          if (pathname.startsWith("/api/quiz/session/")) {
            const parts = pathname.split("/");
            const id = parts[4];
            const action = parts[5];
            if (!id)
              return jsonResponse({ error: "Invalid session id" }, 400, origin);
            if (request.method !== "POST")
              return this.methodNotAllowed(origin);
            if (action === "answer")
              return await this.handleQuizAnswer(request, userId, origin, id);
            if (action === "assist" && parts[6] === "fifty")
              return await this.handleQuizAssistFifty(userId, origin, id);
            if (action === "assist" && parts[6] === "freeze")
              return await this.handleQuizAssistFreeze(userId, origin, id);
            if (action === "skip")
              return await this.handleQuizSkip(userId, origin, id);
            if (action === "end")
              return await this.handleQuizEnd(userId, origin, id);
          }
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
      guessTimestamps: [],
      revealedPositions: []
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
      const { letter, position } = revealLetterUnique(session);
      session.revealedPositions = Array.from(/* @__PURE__ */ new Set([...session.revealedPositions ?? [], position]));
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
  // Quiz: GET questions pool (without answers); shuffle options per-session
  async handleQuizQuestions(request, userId, origin) {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const category = url.searchParams.get("category") ?? void 0;
    const difficulty = url.searchParams.get("difficulty") ?? void 0;
    const limit = limitParam ? Number(limitParam) : void 0;
    const record = await this.getRecord(userId);
    const session = record.quizSession;
    if (!session) {
      const pool2 = filterQuizPool(limit, category ?? void 0, difficulty ?? void 0);
      return jsonResponse({ questions: pool2 }, 200, origin);
    }
    const pool = filterQuizPool(void 0, category ?? void 0, difficulty ?? void 0);
    const order = session.questionOrder ?? [];
    const limitedOrder = typeof limit === "number" && Number.isFinite(limit) ? order.slice(0, Math.max(0, limit)) : order;
    const mapped = limitedOrder.map((idx) => {
      const base = pool[idx] ?? QUIZ_POOL_INTERNAL[idx];
      if (!base)
        return null;
      const shuffle = getOrCreateShuffleForQuestion(session, idx);
      return sanitizeQuestionForClient(base, shuffle);
    }).filter((q) => Boolean(q));
    record.updatedAt = nowIso();
    await this.saveRecord(record);
    return jsonResponse({ questions: mapped }, 200, origin);
  }
  // Quiz: start session, spend coins entry, init question order
  async handleQuizSessionStart(request, userId, origin) {
    const body = await readJson(request);
    const entryCost = validateAmount(body?.entryCost ?? 0);
    const record = await this.getRecord(userId);
    if (record.coins < entryCost) {
      return jsonResponse({ error: "Insufficient balance" }, 400, origin);
    }
    record.coins -= entryCost;
    const totalQuestions = QUIZ_POOL_INTERNAL.length;
    const order = shuffleArray([...Array(totalQuestions).keys()]).slice(0, QUIZ_ROUND_QUESTIONS);
    const now = Date.now();
    const session = {
      id: crypto.randomUUID(),
      userId,
      questionOrder: order,
      pointer: 0,
      lives: QUIZ_LIVES,
      score: 0,
      coinsEarned: 0,
      assistsUsed: { fifty: 0, freeze: 0 },
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
      state: "active",
      _server: { perQuestion: {}, lastAssistTimestamps: [] }
    };
    record.quizSession = session;
    record.updatedAt = nowIso();
    await this.saveRecord(record);
    const clientSession = sanitizeUserForResponse(record, now).quizSession;
    return jsonResponse({ session: clientSession, balance: record.coins }, 200, origin);
  }
  // Quiz: submit answer for current pointer
  async handleQuizAnswer(request, userId, origin, sessionId) {
    const body = await readJson(request);
    const selectedIndex = typeof body?.selectedIndex === "number" ? body.selectedIndex : void 0;
    if (selectedIndex === void 0 || selectedIndex < 0 || selectedIndex >= QUIZ_OPTIONS_COUNT) {
      return jsonResponse({ error: "selectedIndex out of range" }, 400, origin);
    }
    const record = await this.getRecord(userId);
    const session = record.quizSession;
    if (!session || session.state !== "active" || session.id !== sessionId) {
      return jsonResponse({ error: "No active session" }, 409, origin);
    }
    const poolIndex = getCurrentQuestionIndex(session);
    if (poolIndex === null) {
      session.state = "ended";
      record.updatedAt = nowIso();
      await this.saveRecord(record);
      return jsonResponse({ error: "Session has no questions", done: true }, 400, origin);
    }
    const correct = checkAnswer(session, poolIndex, selectedIndex);
    const reward = correct ? QUIZ_POOL_INTERNAL[poolIndex].coinsReward : 0;
    if (correct) {
      session.score += 1;
      session.coinsEarned += reward;
      record.coins += reward;
    } else {
      session.lives = Math.max(0, session.lives - 1);
    }
    session.pointer += 1;
    const done = session.pointer >= session.questionOrder.length || session.lives <= 0;
    if (done)
      session.state = "ended";
    session.updatedAt = nowIso();
    record.updatedAt = nowIso();
    await this.saveRecord(record);
    return jsonResponse({
      correct,
      lives: session.lives,
      score: session.score,
      coinsEarned: session.coinsEarned,
      pointer: session.pointer,
      done,
      balance: record.coins
    }, 200, origin);
  }
  // Quiz: 50:50 assist - return two indices to hide (wrong options); free first two uses, then charge
  async handleQuizAssistFifty(userId, origin, sessionId) {
    const record = await this.getRecord(userId);
    const session = record.quizSession;
    const now = Date.now();
    if (!session || session.state !== "active" || session.id !== sessionId) {
      return jsonResponse({ error: "No active session" }, 409, origin);
    }
    rateLimitAssist(session, now);
    const poolIndex = getCurrentQuestionIndex(session);
    if (poolIndex === null)
      return jsonResponse({ error: "No current question" }, 400, origin);
    let charged = false;
    if (session.assistsUsed.fifty >= QUIZ_FREE_FIFTY) {
      if (record.coins < QUIZ_COST_FIFTY)
        return jsonResponse({ error: "Insufficient balance" }, 400, origin);
      record.coins -= QUIZ_COST_FIFTY;
      charged = true;
    }
    session.assistsUsed.fifty += 1;
    const mapping = getOrCreateShuffleForQuestion(session, poolIndex);
    const correctOriginal = session._server.perQuestion[poolIndex].correctIndex;
    const wrongClientIndices = [];
    for (let i = 0; i < QUIZ_OPTIONS_COUNT; i += 1) {
      const orig = mapping[i];
      if (orig !== correctOriginal)
        wrongClientIndices.push(i);
    }
    const hide = shuffleArray(wrongClientIndices).slice(0, 2);
    record.updatedAt = nowIso();
    await this.saveRecord(record);
    return jsonResponse({ indices: hide, charged, remainingFree: Math.max(0, QUIZ_FREE_FIFTY - session.assistsUsed.fifty) + (charged ? 0 : 0), balance: record.coins }, 200, origin);
  }
  // Quiz: freeze timer for 8s; prevent stacking
  async handleQuizAssistFreeze(userId, origin, sessionId) {
    const record = await this.getRecord(userId);
    const session = record.quizSession;
    const now = Date.now();
    if (!session || session.state !== "active" || session.id !== sessionId) {
      return jsonResponse({ error: "No active session" }, 409, origin);
    }
    rateLimitAssist(session, now);
    ensureQuizSessionServerState(session);
    if (session._server.freezeUntil && now < session._server.freezeUntil) {
      return jsonResponse({ error: "Freeze already active" }, 429, origin);
    }
    let charged = false;
    if (session.assistsUsed.freeze >= QUIZ_FREE_FREEZE) {
      if (record.coins < QUIZ_COST_FREEZE)
        return jsonResponse({ error: "Insufficient balance" }, 400, origin);
      record.coins -= QUIZ_COST_FREEZE;
      charged = true;
    }
    session.assistsUsed.freeze += 1;
    session._server.freezeUntil = now + QUIZ_FREEZE_SECONDS * 1e3;
    session.updatedAt = nowIso();
    record.updatedAt = nowIso();
    await this.saveRecord(record);
    return jsonResponse({ freezeSeconds: QUIZ_FREEZE_SECONDS, charged, balance: record.coins }, 200, origin);
  }
  // Quiz: skip current question (move to end)
  async handleQuizSkip(userId, origin, sessionId) {
    const record = await this.getRecord(userId);
    const session = record.quizSession;
    if (!session || session.state !== "active" || session.id !== sessionId) {
      return jsonResponse({ error: "No active session" }, 409, origin);
    }
    const poolIndex = getCurrentQuestionIndex(session);
    if (poolIndex === null)
      return jsonResponse({ error: "No current question" }, 400, origin);
    const current = session.questionOrder.splice(session.pointer, 1)[0];
    session.questionOrder.push(current);
    session.pointer += 1;
    session.updatedAt = nowIso();
    record.updatedAt = nowIso();
    await this.saveRecord(record);
    const done = session.pointer >= session.questionOrder.length;
    return jsonResponse({ pointer: session.pointer, done }, 200, origin);
  }
  // Quiz: end session and return summary (no answers)
  async handleQuizEnd(userId, origin, sessionId) {
    const record = await this.getRecord(userId);
    const session = record.quizSession;
    if (!session || session.id !== sessionId)
      return jsonResponse({ error: "No session" }, 404, origin);
    session.state = "ended";
    session.updatedAt = nowIso();
    record.updatedAt = nowIso();
    await this.saveRecord(record);
    return jsonResponse({
      summary: {
        id: session.id,
        score: session.score,
        coinsEarned: session.coinsEarned,
        lives: session.lives,
        totalQuestions: session.questionOrder.length,
        assistsUsed: session.assistsUsed,
        state: session.state
      },
      balance: record.coins
    }, 200, origin);
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

// .wrangler/tmp/bundle-UZveoo/middleware-insertion-facade.js
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

// .wrangler/tmp/bundle-UZveoo/middleware-loader.entry.ts
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
