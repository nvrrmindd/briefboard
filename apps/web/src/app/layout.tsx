import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BriefBoard — briefs and projects for creative studios',
  description: 'Clients send a brief, the studio turns it into a project and moves it across the board.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
