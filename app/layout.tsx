import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import NextAuthProvider from "@/app/common/NextAuthProvider";
import { ThemeProvider } from "@/components/atoms/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MYSkill",
  description: "Exam creation and participation platform with AI-powered insights",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <NextAuthProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <html lang="en" suppressHydrationWarning>
          <body className={`${inter.className} antialiased`}>{children}</body>
        </html>
      </ThemeProvider>
    </NextAuthProvider>
  );
}
