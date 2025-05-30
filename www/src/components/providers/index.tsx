"use client"

import { Toaster as DefaultToaster, Toaster as NewYorkToaster } from "@/components/ui/toaster"
import { SubCategorySidebarProvider } from "@/components/layout/sidebar/subcategory-sidebar"
import { CategorySidebarProvider } from "@/components/layout/sidebar/category-sidebar"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LeftSidebar } from "@/components/layout/sidebar/left-sidebar"
import { ThemeProvider } from "@/components/abstract/theme-provider";
import { Toaster as NewYorkSonner } from "@/components/ui/sonner"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { FontLoader } from "@/components/abstract/font-loader";
import { ThemeSync } from "@/components/abstract/theme-sync";
import { SiteHeader } from "@/components/layout/site-header"
import { BottomBar } from "@/components/layout/bottom-bar"
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Main } from "@/components/providers/main"
import { Provider as JotaiProvider } from "jotai"
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import * as React from "react"

import {
  CustomizerSidebar,
  CustomizerSidebarToggle,
} from "@/components/theme/customizer-sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/component/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContainerWrapper } from "@/components/abstract/wrappers";
import { MainNavigation, MobileNavigation } from "@/app/themes/navigation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function Providers({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <JotaiProvider>
            <NextThemesProvider {...props}>
              {/* <TooltipProvider delayDuration={0}>
                <SidebarProvider>
                  <LeftSidebar />
                  <CategorySidebarProvider>
                    <SubCategorySidebarProvider>
                      <div
                        vaul-drawer-wrapper=""
                        className="relative h-screen w-full overflow-hidden"
                      >
                        <SiteHeader />
                        <BottomBar />
                        <Main>
                          <Suspense>
                            {children}
                            <ThemeSync />
                          </Suspense>
                        </Main>
                        <NewYorkToaster />
                        <DefaultToaster />
                        <NewYorkSonner />
                      </div>
                    </SubCategorySidebarProvider>
                  </CategorySidebarProvider>
                </SidebarProvider>
                <FontLoader />
                <Toaster />
              </TooltipProvider> */}
              <TooltipProvider>
                <SidebarProvider>
                  <CustomizerSidebar variant="inset" />
                  <SidebarInset className="relative isolate max-h-svh overflow-hidden peer-data-[variant=inset]:max-h-[calc(100svh-1rem)]">
                    <header className="isolate z-20 flex shrink-0 items-center gap-2 border-b md:z-10">
                      <ContainerWrapper className="flex items-center justify-between">
                        <div className="flex h-14 w-full items-center gap-2">
                          <div className="inline-flex">
                            <CustomizerSidebarToggle />
                          </div>
                          <MainNavigation />
                        </div>
                        <div className="flex items-center justify-center">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="group/toggle"
                          >
                          </Button>
                          <MobileNavigation />
                        </div>
                      </ContainerWrapper>
                    </header>
                    <ScrollArea className="relative z-10 flex h-full flex-col overflow-hidden">
                      {children}
                    </ScrollArea>
                  </SidebarInset>
                </SidebarProvider>
              </TooltipProvider>
            </NextThemesProvider>
          </JotaiProvider>
        </ThemeProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  )
}
