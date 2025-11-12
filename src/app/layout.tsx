import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
   title: {
    default: 'Samarth Enterprise - Water Filter Management System',
    template: '%s | Samarth Enterprise'
  },
  description: 'Comprehensive water purifier management system for tracking products, orders, warranties, repairs, and shop operations across multiple locations.',
  keywords: [
    'water purifier',
    'RO system',
    'water filter',
    'warranty management',
    'repair tracking',
    'inventory management',
    'Samarth Enterprise',
    'shop management'
  ],
  authors: [{ name: 'Samarth Enterprise' }],
  creator: 'Samarth Enterprise',
  publisher: 'Samarth Enterprise',
  applicationName: 'Samarth Enterprise Management System',
  generator: 'Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          ></ThemeProvider>
        {children}
      </body>
    </html>
  );
}
