"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import PasswordInput from "@/components/PasswordInput";
import { createClient } from "@/utils/supabase/client";
import { safeRedirectPath } from "@/lib/shop";

// Turns Supabase error messages into friendly text.
function friendlyError(message = "") {
  if (message.includes("Invalid login credentials")) return "Incorrect email or password.";
  if (message.includes("Email not confirmed")) {
    return "Please confirm your email first. Check your inbox for the confirmation link.";
  }
  return message || "Could not log in. Please try again.";
}

export default function LoginPage({ searchParams }) {
  const params = use(searchParams);
  const next = safeRedirectPath(params.next);
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    if (error) {
      setLoading(false);
      setError(friendlyError(error.message));
      return;
    }

    // Go back to the page the user came from (e.g. /checkout) and refresh the navbar.
    router.push(next);
    router.refresh();
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to your Shopio account.">
      {params.next && <p className="alert-info mt-6">Please log in to continue.</p>}
      {params.message === "confirm" && (
        <p className="alert-info mt-6">If you have confirmed your email, you can log in now.</p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" name="email" required autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="input" />
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <PasswordInput id="password" name="password" autoComplete="current-password" value={form.password} onChange={handleChange} />
        </div>

        {error && <p className="alert-error animate-fade-up">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-1 w-full py-3">
          {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href={next === "/" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`}
          className="font-semibold text-indigo-600 hover:underline"
        >
          Sign Up
        </Link>
      </p>
    </AuthShell>
  );
}
