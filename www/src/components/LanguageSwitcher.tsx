'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { locales } from '../../i18n';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const handleChange = (newLocale: string) => {
    const newPath = pathname.replace(/^\/[^\/]+/, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <select
      value={currentLocale}
      onChange={(e) => handleChange(e.target.value)}
      className="p-2 border rounded"
    >
      {locales.map((locale) => (
        <option key={locale} value={locale}>
          {locale.toUpperCase()}
        </option>
      ))}
    </select>
  );
}