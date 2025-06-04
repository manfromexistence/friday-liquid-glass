"use client";

import React from 'react';
import { useLocale } from '@/store/locale-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Globe, Monitor, RotateCcw } from 'lucide-react';

export function LocalePanel() {
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
  } = useLocale();

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
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Locale:</span>
              <Badge variant="default">{currentLocale}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-detected:</span>
              <Badge variant={isAutoDetected ? "default" : "secondary"}>
                {isAutoDetected ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Detected Locale:</span>
              <Badge variant="outline">{detectedLocale || "None"}</Badge>
            </div>
          </div>
          
          {/* <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Detected Locale:</span>
              <Badge variant="outline">{detectedLocale || "None"}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Loading:</span>
              <Badge variant={isLoading ? "destructive" : "secondary"}>
                {isLoading ? "Yes" : "No"}
              </Badge>
            </div>
          </div> */}
        </div>

        {/* Browser Information */}
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
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
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
          
          {detectedLocale && (
            <Button 
              onClick={resetToDetected} 
              variant="outline"
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Detected
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
