"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from '@/store/locale-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Globe, Monitor, RotateCcw, ExternalLink } from 'lucide-react';
import { Locale, i18n } from '@/i18n-config';

export function LocalePanel() {
  const router = useRouter();
  const pathname = usePathname();
  
  const {
    currentLocale,
    detectedLocale,
    browserLanguage,
    locationInfo,
    isAutoDetected,
    isLoading,
    error,
    detectUserLanguage,
    resetToDetected,
    clearError,
    setLocale,
  } = useLocale();

  // Get current route locale from URL
  const routeLocale = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    return i18n.locales.includes(firstSegment as Locale) ? (firstSegment as Locale) : i18n.defaultLocale;
  }, [pathname]);

  // Sync store locale with route locale on mount and route changes
  React.useEffect(() => {
    if (routeLocale !== currentLocale) {
      setLocale(routeLocale);
    }
  }, [routeLocale, currentLocale, setLocale]);

  // Function to change locale and navigate to new route
  const changeLocale = (newLocale: Locale) => {
    // Update the store
    setLocale(newLocale);
    
    // Update the URL
    const segments = pathname.split('/');
    segments[1] = newLocale; // Replace the locale segment
    const newPath = segments.join('/') || '/';
    
    router.push(newPath);
  };

  // Get language display name
  const getLanguageName = (locale: Locale): string => {
    const names: Record<string, string> = {
      'en': 'English',
      'es': 'Español', 
      'fr': 'Français',
      'de': 'Deutsch',
      'pt': 'Português',
      'zh-CN': '中文 (简体)',
      'zh-TW': '中文 (繁體)',
      'ja': '日本語',
      'ko': '한국어',
      'ar': 'العربية',
      'hi': 'हिन्दी',
      'bn': 'বাংলা',
      'ur': 'اردو',
      'ru': 'Русский',
      'it': 'Italiano',
      'nl': 'Nederlands',
      'sv': 'Svenska',
      'da': 'Dansk',
      'no': 'Norsk',
      'fi': 'Suomi',
      'pl': 'Polski',
      'tr': 'Türkçe',
      'el': 'Ελληνικά',
      'th': 'ไทย',
      'vi': 'Tiếng Việt',
      'id': 'Bahasa Indonesia',
      'ms': 'Bahasa Melayu',
    };
    return names[locale] || locale.toUpperCase();
  };

  return (
    <Card className="w-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Languages
        </CardTitle>
        <CardDescription>
          Information about your language and location
        </CardDescription>
      </CardHeader>      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Route:</span>
              <Badge variant="default">{routeLocale}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Store Locale:</span>
              <Badge variant="outline">{currentLocale}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-detected:</span>
              <Badge variant={isAutoDetected ? "default" : "secondary"}>
                {isAutoDetected ? "Yes" : "No"}
              </Badge>
            </div>
            {detectedLocale && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Detected Locale:</span>
                <Badge variant="outline">{getLanguageName(detectedLocale)}</Badge>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium mb-2">Quick Language Switch:</div>
            <div className="grid grid-cols-2 gap-1">
              {['en', 'es', 'fr', 'de', 'zh-CN', 'ja'].map((locale) => (
                <Button
                  key={locale}
                  variant={routeLocale === locale ? "default" : "outline"}
                  size="sm"
                  onClick={() => changeLocale(locale as Locale)}
                  className="text-xs"
                >
                  {getLanguageName(locale as Locale)}
                </Button>
              ))}
            </div>
          </div>
        </div>        {/* Browser Information */}
        <div className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 font-medium text-sm">
            <Monitor className="h-4 w-4" />
            Browser Information
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Language:</span>
              <span className="font-mono">{browserLanguage || "Not detected"}</span>
            </div>
            <div className="flex justify-between">
              <span>Navigator Languages:</span>
              <span className="font-mono text-xs">
                {typeof navigator !== 'undefined' && navigator.languages 
                  ? navigator.languages.slice(0, 3).join(', ') 
                  : "Not available"}
              </span>
            </div>
          </div>
        </div>

        {/* Route Information */}
        <div className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 font-medium text-sm">
            <ExternalLink className="h-4 w-4" />
            Route Information
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Current Path:</span>
              <span className="font-mono text-xs">{pathname}</span>
            </div>
            <div className="flex justify-between">
              <span>Route Locale:</span>
              <span className="font-mono">{routeLocale}</span>
            </div>
            <div className="flex justify-between">
              <span>Sync Status:</span>
              <Badge variant={routeLocale === currentLocale ? "default" : "destructive"} className="text-xs">
                {routeLocale === currentLocale ? "Synced" : "Out of sync"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 font-medium text-sm">
            <MapPin className="h-4 w-4" />
            Location Information
          </div>
          {locationInfo ? (
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Country:</span>
                <span className="font-mono">{locationInfo.country}</span>
              </div>
              <div className="flex justify-between">
                <span>Region:</span>
                <span className="font-mono">{locationInfo.region}</span>
              </div>
              <div className="flex justify-between">
                <span>City:</span>
                <span className="font-mono">{locationInfo.city}</span>
              </div>
              <div className="flex justify-between">
                <span>Timezone:</span>
                <span className="font-mono">{locationInfo.timezone}</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Location information not available
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="border border-destructive/20 bg-destructive/10 rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-sm text-destructive">Error</div>
                <div className="text-sm text-muted-foreground">{error}</div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearError}
                className="text-destructive hover:text-destructive"
              >
                ✕
              </Button>
            </div>
          </div>
        )}        {/* Actions */}
        <div className="flex gap-2 pt-2 flex-wrap">
          <Button 
            onClick={detectUserLanguage} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Globe className="h-4 w-4 mr-2" />
            )}
            Detect Language
          </Button>
          
          {detectedLocale && detectedLocale !== routeLocale && (
            <Button 
              onClick={() => changeLocale(detectedLocale)} 
              variant="outline"
              size="sm"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Switch to {getLanguageName(detectedLocale)}
            </Button>
          )}
          
          {detectedLocale && (
            <Button 
              onClick={resetToDetected} 
              variant="outline"
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Store
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
