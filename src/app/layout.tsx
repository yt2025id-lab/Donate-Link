import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/Web3Provider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DonateLink - Cross-Chain Donations for Creators",
  description:
    "Send crypto donations to your favorite streamers and creators across any blockchain. Powered by Chainlink.",
  keywords: ["donation", "crypto", "blockchain", "chainlink", "streaming", "base"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <Web3Provider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster
            richColors
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: "#131B2E",
                border: "1px solid #1E2D45",
                color: "#F1F5F9",
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}
