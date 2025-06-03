"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getLanguageDisplayName } from "@/lib/i18n-utils";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function LanguageSwitcher({ 
  className, 
  variant = "outline", 
  size = "default" 
}: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition();
  const [availableLocales, setAvailableLocales] = useState<string[]>(['en']);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  
  // Load available locales on component mount
  useEffect(() => {
    // In a client component, we'll use a subset of common locales
    // since we can't access the file system directly
    const commonLocales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh-CN', 'zh-TW', 'ar', 'hi', 'bn', 'tr', 'nl'];
    setAvailableLocales(commonLocales);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      // Remove the current locale from pathname if it exists
      const pathWithoutLocale = pathname.startsWith(`/${locale}`) 
        ? pathname.slice(`/${locale}`.length) || '/'
        : pathname;
      
      // Navigate to the new locale
      const newPath = newLocale === 'en' 
        ? pathWithoutLocale 
        : `/${newLocale}${pathWithoutLocale}`;
      
      router.push(newPath);
    });
  };

  const currentLanguageName = getLanguageDisplayName(locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={cn("gap-2", className)}
          disabled={isPending}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguageName}</span>
          <span className="sm:hidden">{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 max-h-96 overflow-y-auto">
        {availableLocales.map((localeCode) => (
          <DropdownMenuItem
            key={localeCode}
            onClick={() => handleLocaleChange(localeCode)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              locale === localeCode && "bg-accent"
            )}
          >
            <span>{getLanguageDisplayName(localeCode)}</span>
            {locale === localeCode && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
