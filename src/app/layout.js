import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Shopio - AI Commerce",
  description: "Search and discover products easily with Shopio.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  let profile = null;
  if (authUser) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", authUser.id)
      .maybeSingle();
    profile = data;
  }

  const user = authUser
    ? { id: authUser.id, email: authUser.email, full_name: profile?.full_name }
    : null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-gray-900">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
