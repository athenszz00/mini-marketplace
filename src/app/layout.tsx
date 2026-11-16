import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "little finds — a neighborhood marketplace",
  description:
    "Good things find good homes. Browse the neighborhood marketplace or pass along something you love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
