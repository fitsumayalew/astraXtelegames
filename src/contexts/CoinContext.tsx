import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  apiAddCoins,
  apiInitUser,
  apiSpendCoins,
  apiUpdateStats,
  ensureUserId,
  type UserSnapshot,
} from "@/lib/api";

interface CoinContextType {
  totalCoins: number;
  userId: string | null;
  userName: string | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  addCoins: (amount: number) => Promise<number | null>;
  spendCoins: (amount: number) => Promise<boolean>;
  syncBalance: (balance: number) => void;
  updateUserName: (name: string) => Promise<void>;
}

const CoinContext = createContext<CoinContextType | undefined>(undefined);

export const CoinProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId] = useState<string | null>(() => (typeof window === "undefined" ? null : ensureUserId()));

  const refreshUser = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { user: snapshot } = await apiInitUser();
      setUser(snapshot);
    } catch (err) {
      console.error("Failed to initialize user", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const addCoins = useCallback(
    async (amount: number) => {
      if (!userId || amount <= 0) return user?.coins ?? 0;
      try {
        const { user: snapshot, balance } = await apiAddCoins(amount);
        setUser(snapshot);
        return balance;
      } catch (err) {
        console.error("addCoins failed", err);
        return null;
      }
    },
    [userId, user?.coins]
  );

  const spendCoins = useCallback(
    async (amount: number) => {
      if (!userId) return false;
      if (amount <= 0) return true;
      try {
        const { user: snapshot } = await apiSpendCoins(amount);
        setUser(snapshot);
        return true;
      } catch (err) {
        console.error("spendCoins failed", err);
        return false;
      }
    },
    [userId]
  );

  const updateUserName = useCallback(
    async (name: string) => {
      if (!userId) return;
      const trimmed = name.trim();
      if (!trimmed) return;
      try {
        const { user: snapshot } = await apiUpdateStats({ name: trimmed });
        setUser(snapshot);
      } catch (err) {
        console.error("updateUserName failed", err);
      }
    },
    [userId]
  );

  const syncBalance = useCallback((balance: number) => {
    setUser((prev) => (prev ? { ...prev, coins: balance } : prev));
  }, []);

  return (
    <CoinContext.Provider
      value={{
        totalCoins: user?.coins ?? 0,
        userId,
        userName: user?.name ?? null,
        loading,
        refreshUser,
        addCoins,
        spendCoins,
        syncBalance,
        updateUserName,
      }}
    >
      {children}
    </CoinContext.Provider>
  );
};

export const useCoins = () => {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error("useCoins must be used within CoinProvider");
  }
  return context;
};
