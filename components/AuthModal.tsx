"use client";
import { useState } from "react";
import { X, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal() {
  const { isAuthOpen, closeAuth, authMode, setAuthMode, signIn, signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function resetForm() {
    setEmail("");
    setPassword("");
    setFullName("");
    setError(null);
    setSuccess(false);
    setShowPassword(false);
  }

  function switchMode(mode: "login" | "register") {
    setAuthMode(mode);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (authMode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        setError(translateError(error));
      } else {
        resetForm();
        closeAuth();
      }
    } else {
      if (!fullName.trim()) {
        setError("Vul je volledige naam in.");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(translateError(error));
      } else {
        setSuccess(true);
      }
    }

    setLoading(false);
  }

  function translateError(msg: string): string {
    if (msg.includes("Invalid login credentials")) return "E-mailadres of wachtwoord is onjuist.";
    if (msg.includes("Email already registered") || msg.includes("already been registered")) return "Dit e-mailadres is al geregistreerd.";
    if (msg.includes("Password should be at least")) return "Wachtwoord moet minimaal 6 tekens bevatten.";
    if (msg.includes("Unable to validate email")) return "Ongeldig e-mailadres.";
    return "Er is iets misgegaan. Probeer het opnieuw.";
  }

  if (!isAuthOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => { resetForm(); closeAuth(); }}
      />

      <div className="relative bg-[#eeebdf] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
                <span className="font-semibold text-[#eeebdf] text-sm tracking-tighter">E</span>
              </div>
              <span className="font-semibold text-base tracking-tight text-black">Ensokken.</span>
            </div>
            <button
              onClick={() => { resetForm(); closeAuth(); }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-zinc-500 hover:text-black"
            >
              <X width={16} height={16} strokeWidth={2} />
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <CheckCircle2 width={48} height={48} className="text-[#f24f13]" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-semibold text-black mb-2">Account aangemaakt!</h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                Je account is succesvol aangemaakt. Je kunt nu inloggen.
              </p>
              <button
                onClick={() => switchMode("login")}
                className="w-full h-11 bg-black text-[#eeebdf] rounded-xl text-sm font-medium hover:bg-[#f24f13] transition-colors duration-300"
              >
                Inloggen
              </button>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <h2 className="text-2xl font-semibold text-black tracking-tight">
                  {authMode === "login" ? "Welkom terug" : "Account aanmaken"}
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                  {authMode === "login"
                    ? "Log in op je Ensokken account"
                    : "Maak gratis een account aan"}
                </p>
              </div>

              <div className="flex gap-1 bg-black/5 rounded-xl p-1 mb-6">
                <button
                  onClick={() => switchMode("login")}
                  className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                    authMode === "login"
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-500 hover:text-black"
                  }`}
                >
                  Inloggen
                </button>
                <button
                  onClick={() => switchMode("register")}
                  className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                    authMode === "register"
                      ? "bg-white text-black shadow-sm"
                      : "text-zinc-500 hover:text-black"
                  }`}
                >
                  Registreren
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {authMode === "register" && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                      Volledige naam
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jan de Vries"
                      required
                      className="w-full h-11 px-4 rounded-xl border border-black/10 bg-white text-black text-sm placeholder:text-zinc-400 focus:outline-none focus:border-black/30 transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                    E-mailadres
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jan@voorbeeld.nl"
                    required
                    className="w-full h-11 px-4 rounded-xl border border-black/10 bg-white text-black text-sm placeholder:text-zinc-400 focus:outline-none focus:border-black/30 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                    Wachtwoord
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authMode === "register" ? "Minimaal 6 tekens" : "••••••••"}
                      required
                      minLength={6}
                      className="w-full h-11 px-4 pr-11 rounded-xl border border-black/10 bg-white text-black text-sm placeholder:text-zinc-400 focus:outline-none focus:border-black/30 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff width={16} height={16} />
                      ) : (
                        <Eye width={16} height={16} />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full h-11 bg-black text-[#eeebdf] rounded-xl text-sm font-medium hover:bg-[#f24f13] transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading && <Loader2 width={16} height={16} className="animate-spin" />}
                  {authMode === "login" ? "Inloggen" : "Account aanmaken"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
