"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Globe } from "lucide-react";
import { i18n, type Locale } from "../../../i18n-config";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const redirectedPathname = (locale: Locale) => {
    if (!pathname) return "/";
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  };

  const getCurrentLocale = () => {
    if (!pathname) return i18n.defaultLocale;
    const segments = pathname.split("/");
    const localeFromPath = segments[1];
    return i18n.locales.includes(localeFromPath as Locale) 
      ? localeFromPath 
      : i18n.defaultLocale;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          {getCurrentLocale().toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {i18n.locales.map((locale) => (
          <DropdownMenuItem key={locale} asChild>
            <Link 
              href={redirectedPathname(locale)}
              className="cursor-pointer"
            >
              {locale.toUpperCase()}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
