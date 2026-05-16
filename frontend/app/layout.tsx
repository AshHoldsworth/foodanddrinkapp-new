import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meal Planner',
  description:
    'Meal Planner is a web application that helps you plan your meals and manage your grocery shopping. It allows you to create meal plans, generate shopping lists, and save your favorite recipes.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className="bg-neutral-content">{children}</body>
    </html>
  )
}
