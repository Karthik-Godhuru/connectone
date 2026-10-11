import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";

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
    <html lang="en" className="dark scroll-smooth">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col selection:bg-blue-500/30 selection:text-blue-200">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
