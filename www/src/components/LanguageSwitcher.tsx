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
  const pathname = usePathname();
  const currentLocale = useLocale();

  const handleChange = (newLocale: string) => {
    const newPath = pathname.replace(/^\/[^\/]+/, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <Select value={currentLocale} onValueChange={handleChange}>
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