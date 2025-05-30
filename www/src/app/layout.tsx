import { LoadTheme } from "@/components/load-theme";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Friday",
    template: "%s | friday",
  },
  description:
    "Your Ai Friend.",
  keywords: [
    "friday",
    "manfromexistence",
    "multiverse",
    "aladdin",
    "better",
    "dx",
    "manfromexistence-auth",
    "manfromexistence-ui",
    "manfromexistence-ux",
  ],
  authors: [
    {
      name: "manfromexistence",
      url: "https://manfromexistence.vercel.app",
    },
  ],
  creator: "manfromexistence",
  metadataBase: new URL("https://themux.vercel.app"),
  openGraph: {
    title: "friday | More than just your ai assisstance",
    description:
      "Your Ai Friend.",
  },
  generator: "Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <LoadTheme />
      </head>
      <body className={cn(`antialiased`)}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
