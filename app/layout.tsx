import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import "@luno-kit/ui/styles.css";
import Providers from "@/app/providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "PokaClaw",
  description: "Your private onchain agent for Polkadot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className={spaceGrotesk.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
