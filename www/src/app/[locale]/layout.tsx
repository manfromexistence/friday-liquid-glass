import { notFound } from 'next/navigation';
import { locales } from '../../../i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }, // Destructure locale directly
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string }; // Define params type directly
}>) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // The RootLayout (c:\\Users\\OS\\gitlab\\friday\\www\\src\\app\\layout.tsx)
  // is already providing NextIntlClientProvider and messages.
  // This layout just needs to ensure the locale is valid and render children.
  return <>{children}</>;
}