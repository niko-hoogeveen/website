import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Niko Hoogeveen - Portfolio",
  description: "Personal resume and project showcase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
