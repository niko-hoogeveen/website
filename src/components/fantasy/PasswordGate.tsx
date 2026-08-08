"use client";

import { useEffect, useState, FormEvent } from "react";
import { verifyPassword, isUnlocked, setUnlocked } from "@/lib/fantasy/auth";

interface PasswordGateProps {
  children: React.ReactNode;
}

/**
 * Wraps /fantasy pages behind a simple client-side password prompt.
 *
 * NOTE: This is a casual deterrent, not real security — see
 * src/lib/fantasy/auth.ts and PRD.md for the accepted tradeoffs.
 */
export default function PasswordGate({ children }: PasswordGateProps) {
  const [unlocked, setUnlockedState] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setUnlockedState(isUnlocked());
    setChecked(true);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    const isValid = await verifyPassword(password);

    if (isValid) {
      setUnlocked();
      setUnlockedState(true);
    } else {
      setError(true);
    }

    setSubmitting(false);
  };

  // Avoid a flash of the password prompt while checking localStorage
  if (!checked) {
    return null;
  }

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-20 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold mb-2 text-white">
          League Members Only
        </h1>
        <p className="text-gray-400 mb-6">
          Enter the shared password to view the fantasy football companion.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full px-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && (
            <p className="text-red-400 text-sm">Incorrect password. Try again.</p>
          )}
          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            {submitting ? "Checking..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
