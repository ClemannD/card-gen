import type { Metadata } from 'next';
import './globals.css';
import { TRPCReactProvider } from '@/trpc/react';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'Clemann Next Starter',
  description: 'A Next.js starter with tRPC, Prisma, and Better Auth',
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
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
