import type { Metadata } from "next";
import "./globals.css";
import AgentationClient from "@/components/dev/AgentationClient";

export const metadata: Metadata = {
  title: "KAIROS – Production Readiness & QA Checklist System",
  description:
    "Engineering verification and defect management platform for production release readiness.",
  icons: {
    icon: [
      { url: "/hieroglyph.png", sizes: "any", type: "image/png" },
    ],
    shortcut: "/hieroglyph.png",
    apple: "/hieroglyph.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('kairos-theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans bg-neutral-50 dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 transition-colors selection:bg-neutral-800 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900">
        {children}
        <AgentationClient />
      </body>
    </html>
  );
}
