import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Alex_Brush } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-script",
});

export const metadata: Metadata = {
  title: "ConnectOne | AI-Powered Career & Collaboration Platform",
  description:
    "ConnectOne matches passionate developers, hackers, and creators with complementary teammates, projects, and AI-personalized career roadmaps.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      user = { id: data.user.id, email: data.user.email };
    }
  } catch {
    // If Supabase is unconfigured or network is unavailable
  }

  return (
    <html lang="en" className={`dark scroll-smooth ${inter.variable} ${cormorant.variable} ${alexBrush.variable}`}>
      <body className="min-h-screen bg-[#192024] text-[#DBD3C1] font-sans antialiased flex flex-col selection:bg-[#9E532D]/35 selection:text-[#F4EFE6] relative overflow-x-hidden">
        {/* Ambient background light gradients - warm earthy blooms */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-[#4E1F1A]/22 via-[#9E532D]/12 to-transparent blur-[130px] rounded-full" />
          <div className="absolute top-[30%] -left-60 w-[550px] h-[550px] bg-[#9E532D]/8 blur-[150px] rounded-full" />
          <div className="absolute top-[60%] -right-60 w-[650px] h-[650px] bg-[#D5B38B]/6 blur-[160px] rounded-full" />
          <div className="absolute bottom-10 left-1/4 w-[450px] h-[450px] bg-[#4E1F1A]/10 blur-[140px] rounded-full" />
        </div>
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar user={user} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
