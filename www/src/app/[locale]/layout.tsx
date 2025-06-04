import { notFound } from 'next/navigation';
import { locales, defaultLocale } from '../../../i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound(); // This is allowed in nested layouts
  }

  let messages;
  try {
    messages = (await import(`@/locales/${locale}.json`)).default;
  } catch (error) {
    notFound(); // Trigger 404 if translation file is missing
  }

  return children; // Messages are already passed via root layout
}