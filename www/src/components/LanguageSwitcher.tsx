'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { locales } from '../../i18n';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname(); // e.g., /en/about or /en
  const currentLocale = useLocale(); // e.g., en

  const handleChange = (newLocale: string) => {
    // Remove the current locale prefix and the leading slash from the pathname.
    // currentLocale.length for "en" is 2.
    // pathname.substring(currentLocale.length + 1)
    // if pathname = "/en/about", result is "/about"
    // if pathname = "/en", result is ""
    const pathWithoutLocale = pathname.substring(currentLocale.length + 1);

    const newPath = `/${newLocale}${pathWithoutLocale}`;

    router.replace(newPath); // Use replace to avoid multiple history entries
    router.refresh(); // Refresh server components for the new locale
  };

  return (
    <Select key={currentLocale} value={currentLocale} onValueChange={handleChange}>
      <SelectTrigger className="w-[120px] bg-background text-foreground border border-input hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent className="bg-background text-foreground border border-input">
        {locales.map((locale) => (
          <SelectItem
            key={locale}
            value={locale}
            className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          >
            {locale.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
