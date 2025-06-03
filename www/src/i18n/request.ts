import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getAvailableLocales } from '@/lib/i18n-utils';

// Get available locales dynamically from the locales folder
export const locales = getAvailableLocales();

export type Locale = string;

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  return {
    messages: (await import(`../locales/${locale}.json`)).default
  };
});
