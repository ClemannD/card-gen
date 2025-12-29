import type { Metadata } from 'next';
import './globals.css';
import { TRPCReactProvider } from '@/trpc/react';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Playwright Automation',
  description: 'Local automation tool with Playwright',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
