export interface Env {
  USER_STATE: DurableObjectNamespace;
}

type WordleStats = {
  attempts?: number;
  lastWord?: string;
};

type GameStats = {
  gamesPlayed: number;
  gamesWon: number;
  totalTime: number;
  wordle?: WordleStats;
  sudoku?: Record<string, unknown>;
  quiz?: Record<string, unknown>;
};

// Quiz models (client-visible)
type QuizQuestion = {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  options: string[]; // length 4
  coinsReward: number;
};

type QuizAssists = {
  fifty: number; // 50:50 assists used
  freeze: number; // freeze assists used
};

type QuizSessionState = "active" | "ended";

type QuizSession = {
  id: string;
  userId: string;
  questionOrder: number[]; // indices into quiz pool
  pointer: number; // current question index pointer
  lives: number;
  score: number;
  coinsEarned: number;
  assistsUsed: QuizAssists;
  createdAt: string;
  updatedAt: string;
  state: QuizSessionState;
  // Server-only fields below must NEVER be sent to clients
  _server?: {
    perQuestion: Record<number, { correctIndex: number; optionShuffle: number[] }>;
    freezeUntil?: number; // epoch ms; block stacking
    lastAssistTimestamps?: number[]; // rate limit assists
  };
};

type WordleSession = {
  gameId: string;
  word: string;
  startedAt: string;
  expiresAt: string;
  attempts: number;
  guessTimestamps: number[];
  revealedPositions?: number[];
};

type UserRecord = {
  userId: string;
  name: string;
  coins: number;
  stats: GameStats;
  createdAt: string;
  updatedAt: string;
  wordleSession?: WordleSession;
  hintUses?: number;
  searchUses?: number;
  // Quiz data
  quizSession?: QuizSession;
};

const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8081",
]);

const VALID_WORDS = [
  "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ACUTE", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN",
  "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIKE", "ALIVE", "ALLOW", "ALONE",
  "ALONG", "ALTER", "ANGEL", "ANGER", "ANGLE", "ANGRY", "APART", "APPLE", "APPLY", "ARENA",
  "ARGUE", "ARISE", "ARRAY", "ASIDE", "ASSET", "AUDIO", "AVOID", "AWAKE", "AWARD", "AWARE",
  "BADLY", "BAKER", "BASES", "BASIC", "BASIS", "BEACH", "BEGAN", "BEGIN", "BEGUN", "BEING",
  "BELOW", "BENCH", "BILLY", "BIRTH", "BLACK", "BLADE", "BLAME", "BLIND", "BLOCK", "BLOOD",
  "BOARD", "BOOST", "BOOTH", "BOUND", "BRAIN", "BRAND", "BREAD", "BREAK", "BREED", "BRIEF",
  "BRING", "BROAD", "BROKE", "BROWN", "BUILD", "BUILT", "BUYER", "CABLE", "CALIF", "CARRY",
  "CATCH", "CAUSE", "CHAIN", "CHAIR", "CHART", "CHASE", "CHEAP", "CHECK", "CHEST", "CHIEF",
  "CHILD", "CHINA", "CHOSE", "CIVIL", "CLAIM", "CLASS", "CLEAN", "CLEAR", "CLICK", "CLOCK",
  "CLOSE", "COACH", "COAST", "COULD", "COUNT", "COURT", "COVER", "CRACK", "CRAFT", "CRASH",
  "CRAZY", "CREAM", "CRIME", "CROSS", "CROWD", "CROWN", "CRUDE", "CURVE", "CYCLE", "DAILY",
  "DANCE", "DATED", "DEALT", "DEATH", "DEBUT", "DELAY", "DEPTH", "DOING", "DOUBT", "DOZEN",
  "DRAFT", "DRAMA", "DRANK", "DRAWN", "DREAM", "DRESS", "DRILL", "DRINK", "DRIVE", "DROVE",
  "DYING", "EAGER", "EARLY", "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER",
  "ENTRY", "EQUAL", "ERROR", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE",
  "FAULT", "FIBER", "FIELD", "FIFTH", "FIFTY", "FIGHT", "FINAL", "FIRST", "FIXED", "FLASH",
  "FLEET", "FLOOR", "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", "FRAME",
  "FRANK", "FRAUD", "FRESH", "FRONT", "FRUIT", "FULLY", "FUNNY", "GIANT", "GIVEN", "GLASS",
  "GLOBE", "GOING", "GRACE", "GRADE", "GRAND", "GRANT", "GRASS", "GREAT", "GREEN", "GROSS",
  "GROUP", "GROWN", "GUARD", "GUESS", "GUEST", "GUIDE", "HAPPY", "HARRY", "HEART", "HEAVY",
  "HENCE", "HENRY", "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER",
  "INPUT", "ISSUE", "JAPAN", "JIMMY", "JOINT", "JONES", "JUDGE", "KNOWN", "LABEL", "LARGE",
  "LASER", "LATER", "LAUGH", "LAYER", "LEARN", "LEASE", "LEAST", "LEAVE", "LEGAL", "LEMON",
  "LEVEL", "LEWIS", "LIGHT", "LIMIT", "LINKS", "LIVES", "LOCAL", "LOGIC", "LOOSE", "LOWER",
  "LUCKY", "LUNCH", "LYING", "MAGIC", "MAJOR", "MAKER", "MARCH", "MARIA", "MATCH", "MAYBE",
  "MAYOR", "MEANT", "MEDIA", "METAL", "MIGHT", "MINOR", "MINUS", "MIXED", "MODEL", "MONEY",
  "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NEEDS", "NEVER",
  "NEWLY", "NIGHT", "NOISE", "NORTH", "NOTED", "NOVEL", "NURSE", "OCCUR", "OCEAN", "OFFER",
  "OFTEN", "ORDER", "OTHER", "OUGHT", "PAINT", "PANEL", "PAPER", "PARTY", "PEACE", "PETER",
  "PHASE", "PHONE", "PHOTO", "PIECE", "PILOT", "PITCH", "PLACE", "PLAIN", "PLANE", "PLANT",
  "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR",
  "PRIZE", "PROOF", "PROUD", "PROVE", "QUEEN", "QUICK", "QUIET", "QUITE", "RADIO", "RAISE",
  "RANGE", "RAPID", "RATIO", "REACH", "READY", "REFER", "RIGHT", "RIVAL", "RIVER", "ROBIN",
  "ROGER", "ROMAN", "ROUGH", "ROUND", "ROUTE", "ROYAL", "RURAL", "SCALE", "SCENE", "SCOPE",
  "SCORE", "SENSE", "SERVE", "SEVEN", "SHALL", "SHAPE", "SHARE", "SHARP", "SHEET", "SHELF",
  "SHELL", "SHIFT", "SHINE", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOWN", "SIGHT", "SINCE",
  "SIXTH", "SIXTY", "SIZED", "SKILL", "SLEEP", "SLIDE", "SMALL", "SMART", "SMILE", "SMITH",
  "SMOKE", "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPARE", "SPEAK", "SPEED",
  "SPEND", "SPENT", "SPLIT", "SPOKE", "SPORT", "STAFF", "STAGE", "STAKE", "STAND", "START",
  "STATE", "STEAM", "STEEL", "STICK", "STILL", "STOCK", "STONE", "STOOD", "STORE", "STORM",
  "STORY", "STRIP", "STUCK", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE", "SUPER", "SWEET",
  "TABLE", "TAKEN", "TASTE", "TAXES", "TEACH", "TERRY", "TEXAS", "THANK", "THEFT", "THEIR",
  "THEME", "THERE", "THESE", "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THREW",
  "THROW", "TIGHT", "TIMES", "TITLE", "TODAY", "TOPIC", "TOTAL", "TOUCH", "TOUGH", "TOWER",
  "TRACK", "TRADE", "TRAIN", "TREAT", "TREND", "TRIAL", "TRIBE", "TRICK", "TRIED", "TRIES",
  "TROOP", "TRUCK", "TRULY", "TRUMP", "TRUST", "TRUTH", "TWICE", "UNDER", "UNDUE", "UNION",
  "UNITY", "UNTIL", "UPPER", "URBAN", "USAGE", "USUAL", "VALID", "VALUE", "VIDEO", "VIRUS",
  "VISIT", "VITAL", "VOCAL", "VOICE", "WASTE", "WATCH", "WATER", "WHEEL", "WHERE", "WHICH",
  "WHILE", "WHITE", "WHOLE", "WHOSE", "WOMAN", "WOMEN", "WORLD", "WORRY", "WORSE", "WORST",
  "WORTH", "WOULD", "WOUND", "WRITE", "WRONG", "WROTE", "YOUNG", "YOUTH"
];

const SESSION_DURATION_MS = 70_000; // 70 seconds per session
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute window
const RATE_LIMIT_MAX_GUESSES = 20; // max guesses per window per user
const MAX_WORDLE_ATTEMPTS = 6;
const FREE_HINTS = 3;
const FREE_SEARCHES = 3;
const PAID_ACTION_COST = 10;

// Quiz constants
const QUIZ_FREE_FIFTY = 2;
const QUIZ_FREE_FREEZE = 2;
const QUIZ_COST_FIFTY = 20;
const QUIZ_COST_FREEZE = 10;
const QUIZ_LIVES = 3;
const QUIZ_RATE_LIMIT_WINDOW_MS = 30_000; // 30s window
const QUIZ_RATE_LIMIT_MAX_ASSISTS = 3; // max assists per window
const QUIZ_FREEZE_SECONDS = 8;
const QUIZ_OPTIONS_COUNT = 4;

const DEFAULT_NAME = "Player";
const STORAGE_KEY = "record";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T extends Record<string, any>>(target: T, patch: Partial<T>): T {
  for (const [key, value] of Object.entries(patch)) {
    const current = (target as Record<string, unknown>)[key];
    if (isObject(current) && isObject(value)) {
      (target as Record<string, unknown>)[key] = deepMerge({ ...current }, value) as unknown as T[keyof T];
    } else if (value !== undefined) {
      (target as Record<string, unknown>)[key] = value as T[keyof T];
    }
  }
  return target;
}

function isValidWordFromList(word: string): boolean {
  return VALID_WORDS.includes(word.toUpperCase());
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function randomWord(): string {
  const idx = randomIndex(VALID_WORDS.length);
  return VALID_WORDS[idx];
}

function randomIndex(maxExclusive: number): number {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return bytes[0] % maxExclusive;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function revealLetterUnique(session: WordleSession): { letter: string; position: number } {
  const word = session.word;
  const revealed = new Set(session.revealedPositions ?? []);
  const available: number[] = [];
  for (let i = 0; i < word.length; i += 1) {
    if (!revealed.has(i)) available.push(i);
  }

  // If all positions are revealed, just return a consistent last hint (e.g., first position)
  const position = available.length > 0 ? available[randomIndex(available.length)] : 0;
  return { letter: word[position], position };
}

function isSessionActive(session: WordleSession | undefined, now: number): boolean {
  if (!session) return false;
  const expiresAt = Date.parse(session.expiresAt);
  return now < expiresAt;
}

function remainingMs(session: WordleSession | undefined, now: number): number {
  if (!session) return 0;
  return Math.max(0, Date.parse(session.expiresAt) - now);
}

type LetterResult = "correct" | "present" | "absent";

function updateWordleStats(record: UserRecord, session: WordleSession, victory: boolean, finishedAtMs: number): void {
  const started = Date.parse(session.startedAt);
  const duration = Math.max(0, Math.min(finishedAtMs - started, SESSION_DURATION_MS));
  record.stats.gamesPlayed = (record.stats.gamesPlayed ?? 0) + 1;
  if (victory) {
    record.stats.gamesWon = (record.stats.gamesWon ?? 0) + 1;
  }
  record.stats.totalTime = (record.stats.totalTime ?? 0) + duration;
  record.stats.wordle = {
    ...(record.stats.wordle ?? {}),
    attempts: session.attempts,
    lastWord: session.word,
  };
}

type AllowanceKind = "hint" | "search";

function consumeAllowance(record: UserRecord, kind: AllowanceKind): { charged: boolean; remainingFree: number } {
  const key = kind === "hint" ? "hintUses" : "searchUses";
  const freeCap = kind === "hint" ? FREE_HINTS : FREE_SEARCHES;
  const current = (record as any)[key] ?? 0;
  if (current < freeCap) {
    (record as any)[key] = current + 1;
    return { charged: false, remainingFree: freeCap - (current + 1) };
  }
  if (record.coins < PAID_ACTION_COST) {
    throw new Error("Insufficient coins for this action");
  }
  record.coins -= PAID_ACTION_COST;
  (record as any)[key] = current + 1;
  return { charged: true, remainingFree: 0 };
}

function evaluateGuess(guess: string, target: string): LetterResult[] {
  const result: LetterResult[] = Array(guess.length).fill("absent");
  const targetCounts: Record<string, number> = {};

  for (let i = 0; i < target.length; i += 1) {
    const t = target[i];
    if (guess[i] === t) {
      result[i] = "correct";
    } else {
      targetCounts[t] = (targetCounts[t] || 0) + 1;
    }
  }

  for (let i = 0; i < target.length; i += 1) {
    if (result[i] === "correct") continue;
    const g = guess[i];
    if (targetCounts[g] > 0) {
      result[i] = "present";
      targetCounts[g] -= 1;
    }
  }

  return result;
}

function enforceRateLimit(session: WordleSession, now: number): void {
  session.guessTimestamps = session.guessTimestamps.filter((ts) => now - ts <= RATE_LIMIT_WINDOW_MS);
  if (session.guessTimestamps.length >= RATE_LIMIT_MAX_GUESSES) {
    throw new Error("Too many guesses; please slow down.");
  }
  session.guessTimestamps.push(now);
}

function responseHeaders(origin: string | null): Headers {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-user-id",
  });
  if (!origin) {
    headers.set("Access-Control-Allow-Origin", "*");
  } else if (ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  return headers;
}

function jsonResponse(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders(origin) });
}

function badRequest(message: string, origin: string | null): Response {
  return jsonResponse({ error: message }, 400, origin);
}

function handleOptions(request: Request): Response {
  const origin = request.headers.get("Origin");
  const headers = responseHeaders(origin);
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers });
}

function normalizeUser(record: UserRecord): UserRecord {
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
      quiz: record.stats.quiz ?? {},
    },
    wordleSession: record.wordleSession
      ? {
          ...record.wordleSession,
          guessTimestamps: record.wordleSession.guessTimestamps ?? [],
        }
      : undefined,
    quizSession: record.quizSession
      ? {
          ...record.quizSession,
          _server: record.quizSession._server ?? { perQuestion: {}, lastAssistTimestamps: [] },
        }
      : undefined,
  };
}

function sanitizeUserForResponse(record: UserRecord, nowMs: number): UserRecord {
  const normalized = normalizeUser(record);
  const session = normalized.wordleSession;
  return {
    ...normalized,
    wordleSession: session
      ? {
          gameId: session.gameId,
          wordLength: session.word.length,
          startedAt: session.startedAt,
          expiresAt: session.expiresAt,
          attempts: session.attempts,
          guessTimestamps: session.guessTimestamps,
          remainingTime: remainingMs(session, nowMs),
        } as any
      : undefined,
    quizSession: normalized.quizSession
      ? {
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
          state: normalized.quizSession.state,
        } as any
      : undefined,
  };
}

// In-memory quiz pool; server holds correctIndex but never returns it
const QUIZ_POOL_INTERNAL: Array<QuizQuestion & { correctIndex: number }> = [
  {
    id: "q1",
    category: "general",
    difficulty: "easy",
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Venus", "Jupiter"],
    coinsReward: 5,
    correctIndex: 1,
  },
  {
    id: "q2",
    category: "tech",
    difficulty: "medium",
    question: "What does CPU stand for?",
    options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Compute Power Unit"],
    coinsReward: 5,
    correctIndex: 1,
  },
  {
    id: "q3",
    category: "science",
    difficulty: "easy",
    question: "H2O is the chemical formula for what?",
    options: ["Oxygen", "Hydrogen", "Water", "Helium"],
    coinsReward: 5,
    correctIndex: 2,
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
  { id: "q35", category: "general", difficulty: "easy", question: "What is the boiling point of water at sea level?", options: ["90°C", "100°C", "110°C", "120°C"], coinsReward: 5, correctIndex: 1 },
  { id: "q36", category: "general", difficulty: "easy", question: "Which country is known for the pyramids of Giza?", options: ["Mexico", "Egypt", "Peru", "Sudan"], coinsReward: 5, correctIndex: 1 },
  { id: "q37", category: "general", difficulty: "easy", question: "Which animal is known as the King of the Jungle?", options: ["Tiger", "Lion", "Leopard", "Jaguar"], coinsReward: 5, correctIndex: 1 },
  { id: "q38", category: "general", difficulty: "easy", question: "Which gas do humans exhale?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], coinsReward: 5, correctIndex: 1 },
  { id: "q39", category: "general", difficulty: "easy", question: "Which city is known as the Big Apple?", options: ["Los Angeles", "Chicago", "New York", "Miami"], coinsReward: 5, correctIndex: 2 },
  { id: "q40", category: "general", difficulty: "easy", question: "What is the primary language spoken in Brazil?", options: ["Spanish", "Portuguese", "French", "English"], coinsReward: 5, correctIndex: 1 },
];

function filterQuizPool(limit?: number, category?: string, difficulty?: string): QuizQuestion[] {
  let list = QUIZ_POOL_INTERNAL;
  if (category) list = list.filter((q) => q.category === category);
  if (difficulty) list = list.filter((q) => q.difficulty === difficulty);
  if (typeof limit === "number" && Number.isFinite(limit)) list = list.slice(0, Math.max(0, limit));
  return list.map(({ correctIndex: _ci, ...rest }) => ({ ...rest }));
}

function sanitizeQuestionForClient(q: QuizQuestion, optionOrder?: number[]): QuizQuestion {
  if (!optionOrder) return q;
  const shuffledOptions = optionOrder.map((i) => q.options[i]);
  return { ...q, options: shuffledOptions };
}

function ensureQuizSessionServerState(session: QuizSession): void {
  if (!session._server) session._server = { perQuestion: {}, lastAssistTimestamps: [] };
  if (!session._server.lastAssistTimestamps) session._server.lastAssistTimestamps = [];
}

function rateLimitAssist(session: QuizSession, now: number): void {
  ensureQuizSessionServerState(session);
  const arr = session._server!.lastAssistTimestamps!;
  const filtered = arr.filter((ts) => now - ts <= QUIZ_RATE_LIMIT_WINDOW_MS);
  session._server!.lastAssistTimestamps = filtered;
  if (filtered.length >= QUIZ_RATE_LIMIT_MAX_ASSISTS) {
    throw new Error("Too many assists; please slow down.");
  }
  filtered.push(now);
}

function getCurrentQuestionIndex(session: QuizSession): number | null {
  if (session.pointer < 0 || session.pointer >= session.questionOrder.length) return null;
  return session.questionOrder[session.pointer] ?? null;
}

function getOrCreateShuffleForQuestion(session: QuizSession, poolIndex: number): number[] {
  ensureQuizSessionServerState(session);
  const entry = session._server!.perQuestion[poolIndex];
  if (entry) return entry.optionShuffle;
  const correctIndex = QUIZ_POOL_INTERNAL[poolIndex].correctIndex;
  const order = shuffleArray([...Array(QUIZ_OPTIONS_COUNT).keys()]);
  session._server!.perQuestion[poolIndex] = { correctIndex, optionShuffle: order };
  return order;
}

function getClientVisibleQuestion(session: QuizSession, poolIndex: number): QuizQuestion {
  const base = filterQuizPool(undefined).find((q) => q.id === QUIZ_POOL_INTERNAL[poolIndex].id)!;
  const order = getOrCreateShuffleForQuestion(session, poolIndex);
  return sanitizeQuestionForClient(base, order);
}

function checkAnswer(session: QuizSession, poolIndex: number, selectedIndex: number): boolean {
  ensureQuizSessionServerState(session);
  const entry = session._server!.perQuestion[poolIndex];
  if (!entry) {
    getOrCreateShuffleForQuestion(session, poolIndex);
  }
  const { correctIndex, optionShuffle } = session._server!.perQuestion[poolIndex];
  const selectedOriginalIndex = optionShuffle[selectedIndex];
  return selectedOriginalIndex === correctIndex;
}

async function readJson(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch (err) {
    throw new Error("Invalid JSON body");
  }
}

function validateAmount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error("amount must be a positive number");
  }
  return value;
}

function nowIso(): string {
  return new Date().toISOString();
}

function createDefaultUser(userId: string): UserRecord {
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
      quiz: {},
    },
    hintUses: 0,
    searchUses: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }

    const origin = request.headers.get("Origin");
    const url = new URL(request.url);
    const { pathname } = url;

    // Friendly message for browsers hitting the root without headers.
    if (!pathname.startsWith("/api/")) {
      return new Response(
        "Astra backend is running. Include 'x-user-id' header on /api requests.",
        { status: 200, headers: responseHeaders(origin) }
      );
    }

    let userId = request.headers.get("x-user-id")?.trim();
    let generatedUserId: string | null = null;

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
        headers: newHeaders,
      });
    }

    return response;
  },
};

export class UserState {
  state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
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
          if (request.method !== "POST") return this.methodNotAllowed(origin);
          return await this.handleInit(userId, origin);
        case "/api/user":
          if (request.method !== "GET") return this.methodNotAllowed(origin);
          return await this.handleGet(userId, origin);
        case "/api/coins/add":
          if (request.method !== "POST") return this.methodNotAllowed(origin);
          return await this.handleAddCoins(request, userId, origin);
        case "/api/coins/spend":
          if (request.method !== "POST") return this.methodNotAllowed(origin);
          return await this.handleSpendCoins(request, userId, origin);
        case "/api/stats/update":
          if (request.method !== "POST") return this.methodNotAllowed(origin);
          return await this.handleUpdateStats(request, userId, origin);
        case "/api/wordle/word":
          if (request.method !== "GET") return this.methodNotAllowed(origin);
          return await this.handleWordleWord(userId, origin);
        case "/api/wordle/validate":
          if (request.method !== "POST") return this.methodNotAllowed(origin);
          return await this.handleWordleValidate(request, userId, origin);
        case "/api/wordle/hint":
          if (request.method !== "POST") return this.methodNotAllowed(origin);
          return await this.handleWordleAllowance(userId, origin, "hint");
        case "/api/wordle/search":
          if (request.method !== "POST") return this.methodNotAllowed(origin);
          return await this.handleWordleAllowance(userId, origin, "search");
        case "/api/quiz/questions":
          if (request.method !== "GET") return this.methodNotAllowed(origin);
          return await this.handleQuizQuestions(request, userId, origin);
        case "/api/quiz/session/start":
          if (request.method !== "POST") return this.methodNotAllowed(origin);
          return await this.handleQuizSessionStart(request, userId, origin);
        default:
          if (pathname.startsWith("/api/quiz/session/")) {
            const parts = pathname.split("/");
            const id = parts[4];
            const action = parts[5];
            if (!id) return jsonResponse({ error: "Invalid session id" }, 400, origin);
            if (request.method !== "POST") return this.methodNotAllowed(origin);
            if (action === "answer") return await this.handleQuizAnswer(request, userId, origin, id);
            if (action === "assist" && parts[6] === "fifty") return await this.handleQuizAssistFifty(userId, origin, id);
            if (action === "assist" && parts[6] === "freeze") return await this.handleQuizAssistFreeze(userId, origin, id);
            if (action === "skip") return await this.handleQuizSkip(userId, origin, id);
            if (action === "end") return await this.handleQuizEnd(userId, origin, id);
          }
          return jsonResponse({ error: "Not found" }, 404, origin);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error";
      return jsonResponse({ error: message }, 400, origin);
    }
  }

  private methodNotAllowed(origin: string | null): Response {
    return jsonResponse({ error: "Method not allowed" }, 405, origin);
  }

  private async getRecord(userId: string): Promise<UserRecord> {
    const stored = (await this.state.storage.get<UserRecord>(STORAGE_KEY)) || null;
    if (stored) {
      return normalizeUser(stored);
    }
    const record = createDefaultUser(userId);
    await this.state.storage.put(STORAGE_KEY, record);
    return record;
  }

  private async saveRecord(record: UserRecord): Promise<void> {
    await this.state.storage.put(STORAGE_KEY, record);
  }

  private async handleInit(userId: string, origin: string | null): Promise<Response> {
    const record = await this.getRecord(userId);
    return jsonResponse({ user: sanitizeUserForResponse(record, Date.now()) }, 200, origin);
  }

  private async handleGet(userId: string, origin: string | null): Promise<Response> {
    const record = await this.getRecord(userId);
    return jsonResponse({ user: sanitizeUserForResponse(record, Date.now()) }, 200, origin);
  }

  private async handleAddCoins(request: Request, userId: string, origin: string | null): Promise<Response> {
    const body = await readJson(request);
    const amount = validateAmount(body?.amount);

    const record = await this.getRecord(userId);
    record.coins += amount;
    record.updatedAt = nowIso();
    await this.saveRecord(record);

    return jsonResponse({ balance: record.coins, user: sanitizeUserForResponse(record, Date.now()) }, 200, origin);
  }

  private async handleSpendCoins(request: Request, userId: string, origin: string | null): Promise<Response> {
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

  private async handleUpdateStats(request: Request, userId: string, origin: string | null): Promise<Response> {
    const body = await readJson(request);
    if (!isObject(body)) {
      throw new Error("Body must be an object");
    }

    const { statsPatch, name } = body as { statsPatch?: Partial<GameStats>; name?: string };
    if (name !== undefined && typeof name !== "string") {
      throw new Error("name must be a string");
    }

    if (statsPatch !== undefined && !isObject(statsPatch)) {
      throw new Error("statsPatch must be an object");
    }

    const record = await this.getRecord(userId);

    if (name !== undefined && name.trim().length > 0) {
      record.name = name.trim();
    }

    if (statsPatch) {
      record.stats = deepMerge(record.stats, statsPatch);
    }

    record.updatedAt = nowIso();
    await this.saveRecord(record);

    return jsonResponse({ user: record }, 200, origin);
  }

  private async handleWordleWord(userId: string, origin: string | null): Promise<Response> {
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
          resumed: true,
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
      revealedPositions: [],
    };
    record.updatedAt = nowIso();
    await this.saveRecord(record);

    return jsonResponse({ gameId, wordLength: word.length, remainingTime: SESSION_DURATION_MS }, 200, origin);
  }

  private async handleWordleValidate(request: Request, userId: string, origin: string | null): Promise<Response> {
    const body = await readJson(request);
    const guessRaw = typeof body?.guess === "string" ? body.guess.trim() : "";
    const gameId = typeof body?.gameId === "string" ? body.gameId.trim() : undefined;

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
      record.wordleSession = undefined;
      record.updatedAt = nowIso();
      await this.saveRecord(record);
      return jsonResponse({ error: "Session expired", target: session.word }, 410, origin);
    }

    try {
      enforceRateLimit(session, now);
    } catch (err) {
      return jsonResponse({ error: (err as Error).message }, 429, origin);
    }

    session.attempts += 1;
    const result = evaluateGuess(guess, session.word);
    const victory = result.every((r) => r === "correct");

    if (victory) {
      updateWordleStats(record, session, true, now);
      record.wordleSession = undefined;
      record.updatedAt = nowIso();
      await this.saveRecord(record);
      return jsonResponse({ result, victory: true, target: session.word }, 200, origin);
    }

    const remainingTime = remainingMs(session, now);
    if (remainingTime <= 0) {
      updateWordleStats(record, session, false, now);
      record.wordleSession = undefined;
      record.updatedAt = nowIso();
      await this.saveRecord(record);
      return jsonResponse({ error: "Session expired", target: session.word }, 410, origin);
    }

    if (session.attempts >= MAX_WORDLE_ATTEMPTS) {
      const target = session.word;
      updateWordleStats(record, session, false, now);
      record.wordleSession = undefined;
      record.updatedAt = nowIso();
      await this.saveRecord(record);
      return jsonResponse({ result, victory: false, target, remainingTime }, 200, origin);
    }

    record.wordleSession = session;
    record.updatedAt = nowIso();
    await this.saveRecord(record);

    return jsonResponse({ result, victory: false, remainingTime }, 200, origin);
  }

  private async handleWordleAllowance(
    userId: string,
    origin: string | null,
    kind: AllowanceKind
  ): Promise<Response> {
    const record = await this.getRecord(userId);
    const now = Date.now();

    // Require active session to prevent abuse
    const session = record.wordleSession;
    if (!session || !isSessionActive(session, now)) {
      return jsonResponse({ error: "No active session" }, 409, origin);
    }

    try {
      const { charged, remainingFree } = consumeAllowance(record, kind);
      const { letter, position } = revealLetterUnique(session);
      // Track revealed position to avoid duplicates in subsequent hints
      session.revealedPositions = Array.from(new Set([...(session.revealedPositions ?? []), position]));
      record.updatedAt = nowIso();
      await this.saveRecord(record);
      const basePayload = {
        ok: true,
        charged,
        remainingFree,
        balance: record.coins,
        user: sanitizeUserForResponse(record, now),
        letter,
      };

      if (kind === "hint") {
        return jsonResponse({ ...basePayload, position }, 200, origin);
      }

      return jsonResponse(basePayload, 200, origin);
    } catch (err) {
      return jsonResponse({ error: (err as Error).message }, 400, origin);
    }
  }

  // Quiz: GET questions pool (without answers); shuffle options per-session
  private async handleQuizQuestions(request: Request, userId: string, origin: string | null): Promise<Response> {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const category = url.searchParams.get("category") ?? undefined;
    const difficulty = url.searchParams.get("difficulty") ?? undefined;
    const limit = limitParam ? Number(limitParam) : undefined;

    const record = await this.getRecord(userId);
    // If there is an active session, return options according to its per-question shuffles for current and future pointer questions
    const session = record.quizSession;
    const pool = filterQuizPool(limit, category ?? undefined, difficulty ?? undefined);
    if (!session) {
      return jsonResponse({ questions: pool }, 200, origin);
    }
    // For client pool listing, do not reveal answers; but we may shuffle options deterministically per session
    const mapped = pool.map((q) => {
      // try to find pool index
      const internalIndex = QUIZ_POOL_INTERNAL.findIndex((x) => x.id === q.id);
      if (internalIndex < 0) return q;
      const order = getOrCreateShuffleForQuestion(session, internalIndex);
      return sanitizeQuestionForClient(q, order);
    });
    record.updatedAt = nowIso();
    await this.saveRecord(record);
    return jsonResponse({ questions: mapped }, 200, origin);
  }

  // Quiz: start session, spend coins entry, init question order
  private async handleQuizSessionStart(request: Request, userId: string, origin: string | null): Promise<Response> {
    const body = await readJson(request);
    const entryCost = validateAmount(body?.entryCost ?? 0);

    const record = await this.getRecord(userId);
    if (record.coins < entryCost) {
      return jsonResponse({ error: "Insufficient balance" }, 400, origin);
    }
    record.coins -= entryCost;

    const totalQuestions = QUIZ_POOL_INTERNAL.length;
    const order = shuffleArray([...Array(totalQuestions).keys()]);
    const now = Date.now();
    const session: QuizSession = {
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
      _server: { perQuestion: {}, lastAssistTimestamps: [] },
    };

    record.quizSession = session;
    record.updatedAt = nowIso();
    await this.saveRecord(record);

    const clientSession = sanitizeUserForResponse(record, now).quizSession;
    return jsonResponse({ session: clientSession, balance: record.coins }, 200, origin);
  }

  // Quiz: submit answer for current pointer
  private async handleQuizAnswer(request: Request, userId: string, origin: string | null, sessionId: string): Promise<Response> {
    const body = await readJson(request);
    const selectedIndex = typeof body?.selectedIndex === "number" ? body.selectedIndex : undefined;
    if (selectedIndex === undefined || selectedIndex < 0 || selectedIndex >= QUIZ_OPTIONS_COUNT) {
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

    // advance pointer or end
    session.pointer += 1;
    const done = session.pointer >= session.questionOrder.length || session.lives <= 0;
    if (done) session.state = "ended";
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
      balance: record.coins,
    }, 200, origin);
  }

  // Quiz: 50:50 assist - return two indices to hide (wrong options); free first two uses, then charge
  private async handleQuizAssistFifty(userId: string, origin: string | null, sessionId: string): Promise<Response> {
    const record = await this.getRecord(userId);
    const session = record.quizSession;
    const now = Date.now();
    if (!session || session.state !== "active" || session.id !== sessionId) {
      return jsonResponse({ error: "No active session" }, 409, origin);
    }
    rateLimitAssist(session, now);

    const poolIndex = getCurrentQuestionIndex(session);
    if (poolIndex === null) return jsonResponse({ error: "No current question" }, 400, origin);

    // Charge if beyond free uses
    let charged = false;
    if (session.assistsUsed.fifty >= QUIZ_FREE_FIFTY) {
      if (record.coins < QUIZ_COST_FIFTY) return jsonResponse({ error: "Insufficient balance" }, 400, origin);
      record.coins -= QUIZ_COST_FIFTY;
      charged = true;
    }
    session.assistsUsed.fifty += 1;

    const mapping = getOrCreateShuffleForQuestion(session, poolIndex);
    const correctOriginal = session._server!.perQuestion[poolIndex].correctIndex;
    // Build list of wrong indices in client-shuffled space
    const wrongClientIndices: number[] = [];
    for (let i = 0; i < QUIZ_OPTIONS_COUNT; i += 1) {
      const orig = mapping[i];
      if (orig !== correctOriginal) wrongClientIndices.push(i);
    }
    const hide = shuffleArray(wrongClientIndices).slice(0, 2);

    record.updatedAt = nowIso();
    await this.saveRecord(record);
    return jsonResponse({ indices: hide, charged, remainingFree: Math.max(0, QUIZ_FREE_FIFTY - session.assistsUsed.fifty) + (charged ? 0 : 0), balance: record.coins }, 200, origin);
  }

  // Quiz: freeze timer for 8s; prevent stacking
  private async handleQuizAssistFreeze(userId: string, origin: string | null, sessionId: string): Promise<Response> {
    const record = await this.getRecord(userId);
    const session = record.quizSession;
    const now = Date.now();
    if (!session || session.state !== "active" || session.id !== sessionId) {
      return jsonResponse({ error: "No active session" }, 409, origin);
    }
    rateLimitAssist(session, now);

    ensureQuizSessionServerState(session);
    if (session._server!.freezeUntil && now < session._server!.freezeUntil) {
      return jsonResponse({ error: "Freeze already active" }, 429, origin);
    }

    let charged = false;
    if (session.assistsUsed.freeze >= QUIZ_FREE_FREEZE) {
      if (record.coins < QUIZ_COST_FREEZE) return jsonResponse({ error: "Insufficient balance" }, 400, origin);
      record.coins -= QUIZ_COST_FREEZE;
      charged = true;
    }
    session.assistsUsed.freeze += 1;
    session._server!.freezeUntil = now + QUIZ_FREEZE_SECONDS * 1000;
    session.updatedAt = nowIso();
    record.updatedAt = nowIso();
    await this.saveRecord(record);

    return jsonResponse({ freezeSeconds: QUIZ_FREEZE_SECONDS, charged, balance: record.coins }, 200, origin);
  }

  // Quiz: skip current question (move to end)
  private async handleQuizSkip(userId: string, origin: string | null, sessionId: string): Promise<Response> {
    const record = await this.getRecord(userId);
    const session = record.quizSession;
    if (!session || session.state !== "active" || session.id !== sessionId) {
      return jsonResponse({ error: "No active session" }, 409, origin);
    }
    const poolIndex = getCurrentQuestionIndex(session);
    if (poolIndex === null) return jsonResponse({ error: "No current question" }, 400, origin);

    // Move current question to end and advance pointer
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
  private async handleQuizEnd(userId: string, origin: string | null, sessionId: string): Promise<Response> {
    const record = await this.getRecord(userId);
    const session = record.quizSession;
    if (!session || session.id !== sessionId) return jsonResponse({ error: "No session" }, 404, origin);
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
        state: session.state,
      },
      balance: record.coins,
    }, 200, origin);
  }
}
