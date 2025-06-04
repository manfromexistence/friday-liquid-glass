import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'es', 'fr'] as const; // Add all supported locales here
export type Locale = (typeof locales)[number];
export const defaultLocale = 'en' as const;

export default getRequestConfig(async ({ locale: incomingLocale }) => {
  // Ensure locale is a valid string from our supported locales
  const locale: Locale = locales.includes(incomingLocale as any)
    ? (incomingLocale as Locale)
    : defaultLocale;

  return {
    locale, // Now guaranteed to be a string and one of 'en', 'es', 'fr'
    messages: (await import(`./src/locales/${locale}.json`)).default,
  };
});
