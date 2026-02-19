"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
  isAuthOpen: boolean;
  openAuth: (mode?: "login" | "register") => void;
  closeAuth: () => void;
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
        const admin = await checkAdmin(session.user.email ?? "");
        setIsAdmin(admin);
      }
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
          const admin = await checkAdmin(session.user.email ?? "");
          setIsAdmin(admin);
          setLoading(false);
          if (event === "SIGNED_IN" && admin) {
            router.push("/admin");
          }
        } else {
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
        }
      })();
    });
  }, []);

  async function checkAdmin(email: string): Promise<boolean> {
    if (!email) return false;
    const { data } = await supabase
      .from("admins")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    return !!data;
  }

  async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (data) setProfile(data);
    return data ?? null;
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function updateProfile(data: Partial<Profile>) {
    if (!user) return { error: "Niet ingelogd" };
    const { error } = await supabase
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) return { error: error.message };
    await fetchProfile(user.id);
    return { error: null };
  }

  function openAuth(mode: "login" | "register" = "login") {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }

  function closeAuth() {
    setIsAuthOpen(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin,
        signUp,
        signIn,
        signOut,
        updateProfile,
        isAuthOpen,
        openAuth,
        closeAuth,
        authMode,
        setAuthMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
