import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartToast from "@/components/CartToast";
import MobileNav from "@/components/MobileNav";
import { getCurrentUser } from "@/lib/auth";
import { getPaymentSettings } from "@/lib/settings";

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

// Phones: use the full screen (incl. iPhone notch area) and a white browser bar.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }) {
  // Both run at the same time.
  const [{ user, profile, isAdmin }, paymentSettings] = await Promise.all([
    getCurrentUser(),
    getPaymentSettings(),
  ]);

  // Only the few fields the navbar needs are sent to the browser.
  const navUser = user
    ? { name: profile?.full_name || user.email, email: user.email, isAdmin }
    : null;

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-gray-50 pb-[calc(4rem+env(safe-area-inset-bottom))] font-sans text-gray-900 md:pb-0">
        <Navbar user={navUser} />
        <main className="flex-1">{children}</main>
        <Footer user={navUser} paymentSettings={paymentSettings} />
        <MobileNav user={navUser} />
        <CartToast />
      </body>
    </html>
  );
}
