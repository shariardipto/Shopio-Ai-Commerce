import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartToast from "@/components/CartToast";
import { getCurrentUser } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Shopio — AI-Powered Shopping",
    template: "%s | Shopio",
  },
  description: "Search and discover products easily with Shopio — by text, photo or camera.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }) {
  const { user, profile, isAdmin } = await getCurrentUser();

  // Only the few fields the navbar needs are sent to the browser.
  const navUser = user
    ? { name: profile?.full_name || user.email, email: user.email, isAdmin }
    : null;

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-gray-50 font-sans text-gray-900">
        <Navbar user={navUser} />
        <main className="flex-1">{children}</main>
        <Footer user={navUser} />
        <CartToast />
      </body>
    </html>
  );
}
