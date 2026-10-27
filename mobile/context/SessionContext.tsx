import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import {
  clearSession,
  getSession,
  saveSession,
  type Session,
} from "@/lib/storage";

type SessionContextValue = {
  session: Session | null;
  loading: boolean;
  expiredMessage: string | null;
  unlock: (email: string, code: string) => Promise<void>;
  revalidate: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [expiredMessage, setExpiredMessage] = useState<string | null>(null);

  const revalidate = useCallback(async () => {
    const stored = await getSession();
    if (!stored) {
      setSession(null);
      setLoading(false);
      return;
    }

    try {
      const result = await api<{
        status: string;
        message?: string;
        school?: {
          id: string;
          name: string;
          code: string;
          expiresAt: string;
        };
      }>("/api/access/validate", {
        method: "POST",
        body: JSON.stringify({
          email: stored.email,
          schoolId: stored.schoolId,
        }),
      });

      if (result.status === "ok" && result.school) {
        const next: Session = {
          email: stored.email,
          schoolId: result.school.id,
          schoolName: result.school.name,
          schoolCode: result.school.code,
          expiresAt: result.school.expiresAt,
        };
        await saveSession(next);
        setSession(next);
        setExpiredMessage(null);
      } else if (result.status === "expired") {
        await clearSession();
        setSession(null);
        setExpiredMessage(
          result.message ||
            "This school's access has expired. Please contact your school."
        );
      } else {
        await clearSession();
        setSession(null);
      }
    } catch {
      // Offline / API down: keep local session for browsing cached flow
      setSession(stored);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    revalidate();
  }, [revalidate]);

  const unlock = useCallback(async (email: string, code: string) => {
    const result = await api<{
      status: string;
      school: {
        id: string;
        name: string;
        code: string;
        expiresAt: string;
      };
    }>("/api/access/unlock", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });

    const next: Session = {
      email: email.trim().toLowerCase(),
      schoolId: result.school.id,
      schoolName: result.school.name,
      schoolCode: result.school.code,
      expiresAt: result.school.expiresAt,
    };
    await saveSession(next);
    setSession(next);
    setExpiredMessage(null);
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      expiredMessage,
      unlock,
      revalidate,
      signOut,
    }),
    [session, loading, expiredMessage, unlock, revalidate, signOut]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
