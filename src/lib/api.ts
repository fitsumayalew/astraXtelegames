// Use relative base by default so Vite's dev proxy can avoid CORS.
// Set VITE_API_BASE in production if the API lives on a different origin.
const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const USER_ID_KEY = "userId";

export type WordleSession = {
  gameId: string;
  wordLength: number;
  startedAt?: string;
  expiresAt?: string;
  attempts?: number;
  guessTimestamps?: string[];
  remainingTime?: number;
};

export type GameStats = {
  gamesPlayed?: number;
  gamesWon?: number;
  totalTime?: number;
  wordle?: {
    attempts?: number;
    lastWord?: string;
  };
};

export type UserSnapshot = {
  userId: string;
  name?: string;
  coins: number;
  stats: GameStats;
  createdAt: string;
  updatedAt: string;
  hintUses?: number;
  searchUses?: number;
  wordleSession?: WordleSession;
};

const safeLocalStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch (err) {
    console.error("localStorage unavailable", err);
    return null;
  }
};

// Lightweight UUID v4 fallback for environments lacking crypto.randomUUID
const fallbackUuid = (): string => {
  const cryptoObj = typeof crypto !== "undefined" ? crypto : undefined;
  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    const bytes = cryptoObj.getRandomValues(new Uint8Array(16));
    // Set version and variant bits per RFC 4122
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    const hex = Array.from(bytes, toHex).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Math.random fallback (lower entropy, but better than crashing)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const ensureUserId = (): string => {
  const storage = safeLocalStorage();
  if (!storage) {
    // Fallback to an in-memory id to avoid throwing in non-browser contexts
    return typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : fallbackUuid();
  }

  const existing = storage.getItem(USER_ID_KEY);
  if (existing) return existing;

  const generated = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : fallbackUuid();
  storage.setItem(USER_ID_KEY, generated);
  return generated;
};

type HttpMethod = "GET" | "POST";

type ApiResult<T> = T;

async function request<T>(path: string, method: HttpMethod, body?: unknown): Promise<ApiResult<T>> {
  const userId = ensureUserId();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: method === "POST" ? JSON.stringify(body ?? {}) : undefined,
  });

  // Capture a server-provided userId if returned (first call case)
  const returnedUserId = res.headers.get("x-user-id");
  if (returnedUserId) {
    const storage = safeLocalStorage();
    storage?.setItem(USER_ID_KEY, returnedUserId);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as any)?.error ?? "Request failed";
    throw new Error(message);
  }

  return data as T;
}

export const apiInitUser = () => request<{ user: UserSnapshot }>("/api/user/init", "POST");
export const apiGetUser = () => request<{ user: UserSnapshot }>("/api/user", "GET");
export const apiAddCoins = (amount: number) => request<{ balance: number; user: UserSnapshot }>("/api/coins/add", "POST", { amount });
export const apiSpendCoins = (amount: number) => request<{ balance: number; user: UserSnapshot }>("/api/coins/spend", "POST", { amount });
export const apiUpdateStats = (payload: { statsPatch?: Record<string, unknown>; name?: string }) =>
  request<{ user: UserSnapshot }>("/api/stats/update", "POST", payload);
export const apiGetWordleWord = () =>
  request<{ gameId: string; wordLength: number; remainingTime?: number; resumed?: boolean }>("/api/wordle/word", "GET");

export const apiValidateWordleGuess = (payload: { guess: string; gameId?: string }) =>
  request<{
    result: Array<"correct" | "present" | "absent">;
    victory: boolean;
    target?: string;
    remainingTime?: number;
  }>("/api/wordle/validate", "POST", payload);

export const apiWordleHint = () =>
  request<{
    ok: true;
    charged: boolean;
    remainingFree: number;
    balance: number;
    user: UserSnapshot;
    letter: string;
    position: number;
  }>("/api/wordle/hint", "POST");

export const apiWordleSearch = () =>
  request<{
    ok: true;
    charged: boolean;
    remainingFree: number;
    balance: number;
    user: UserSnapshot;
    letter: string;
  }>("/api/wordle/search", "POST");

export const apiConfig = {
  API_BASE,
  USER_ID_KEY,
};

// Pop Quiz API
export type QuizQuestion = {
  id: string | number;
  category?: string;
  difficulty?: string;
  question: string;
  options: string[]; // server-shuffled; never includes answer index
  coinsReward?: number;
};

export type QuizSession = {
  id: string;
  userId: string;
  pointer: number;
  lives: number;
  score: number;
  coinsEarned: number;
  state: "active" | "ended";
};

export const apiQuizStart = (entryCost: number) =>
  request<{ session: QuizSession; balance: number }>("/api/quiz/session/start", "POST", { entryCost });

export const apiQuizGetQuestions = (params?: { limit?: number; category?: string; difficulty?: string }) => {
  const search = new URLSearchParams();
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.category) search.set("category", params.category);
  if (params?.difficulty) search.set("difficulty", params.difficulty);
  const q = search.toString();
  const path = `/api/quiz/questions${q ? `?${q}` : ""}`;
  return request<{ questions: QuizQuestion[] }>(path, "GET");
};

export const apiQuizAnswer = (sessionId: string, selectedIndex: number) =>
  request<{ correct: boolean; lives: number; score: number; coinsEarned: number; pointer: number; done: boolean }>(
    `/api/quiz/session/${sessionId}/answer`,
    "POST",
    { selectedIndex }
  );

export const apiQuizAssistFifty = (sessionId: string) =>
  request<{ indices: number[]; freeRemaining: number; costCharged?: number }>(`/api/quiz/session/${sessionId}/assist/fifty`, "POST");

export const apiQuizAssistFreeze = (sessionId: string) =>
  request<{ freezeSeconds: number; freeRemaining: number; costCharged?: number }>(`/api/quiz/session/${sessionId}/assist/freeze`, "POST");

export const apiQuizSkip = (sessionId: string) =>
  request<{ pointer: number }>(`/api/quiz/session/${sessionId}/skip`, "POST");

export const apiQuizEnd = (sessionId: string) =>
  request<{ summary: { lives: number; score: number; coinsEarned: number } }>(`/api/quiz/session/${sessionId}/end`, "POST");
