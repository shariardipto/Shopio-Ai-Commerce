"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import Icon from "@/components/Icon";
import PasswordInput from "@/components/PasswordInput";
import { createClient } from "@/utils/supabase/client";
import { safeRedirectPath } from "@/lib/shop";
import { signupErrorMessage } from "@/lib/signup-errors";

export default function SignupPage({ searchParams }) {
  const params = use(searchParams);
  const next = safeRedirectPath(params.next);
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const submitting = useRef(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting.current) return;
    setError("");

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    submitting.current = true;
    setLoading(true);
    try {
      const supabase = createClient();

      // The database trigger always creates a 'customer' profile.
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { full_name: form.fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        setError(signupErrorMessage(error));
        return;
      }

      // With "Confirm email" off, signup returns a session and logs the user in.
      if (!data.session) {
        setCheckEmail(true);
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("Could not connect to signup. Please check your connection and try again.");
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
        <div className="card animate-scale-in p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Icon name="check" className="h-8 w-8" strokeWidth={2.5} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-gray-900">Check your email</h1>
          <p className="mt-3 text-gray-600">
            We sent a confirmation link to <span className="font-semibold text-gray-900">{form.email}</span>.
            Please confirm your email, then log in.
          </p>
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="btn-primary mt-6">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const passwordsMatch = form.confirmPassword && form.password === form.confirmPassword;

  return (
    <AuthShell title="Create your account" subtitle="Join Shopio to start shopping.">
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <label htmlFor="fullName" className="label">Full Name</label>
          <input id="fullName" type="text" name="fullName" required autoComplete="name" placeholder="Your full name" value={form.fullName} onChange={handleChange} className="input" />
        </div>

        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" name="email" required autoComplete="email" placeholder="you@example.com" value={form.email} onChange={handleChange} className="input" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="label">Password</label>
            <PasswordInput id="password" name="password" minLength={6} autoComplete="new-password" value={form.password} onChange={handleChange} />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="label">Confirm Password</label>
            <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} />
          </div>
        </div>
        <p className={`-mt-2 text-xs ${passwordsMatch ? "text-green-600" : "text-gray-500"}`}>
          {passwordsMatch ? "✓ Passwords match" : "At least 6 characters."}
        </p>

        {error && <p role="alert" className="alert-error animate-fade-up">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-1 w-full py-3">
          {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href={next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
          className="font-semibold text-indigo-600 hover:underline"
        >
          Login
        </Link>
      </p>
    </AuthShell>
  );
}
