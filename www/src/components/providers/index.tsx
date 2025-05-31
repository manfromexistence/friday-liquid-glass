"use client"

import { Toaster as DefaultToaster, Toaster as NewYorkToaster } from "@/components/ui/toaster"
import { SubCategorySidebarProvider } from "@/components/layout/sidebar/subcategory-sidebar"
import { CategorySidebarProvider } from "@/components/layout/sidebar/category-sidebar"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LeftSidebar } from "@/components/layout/sidebar/left-sidebar"
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster as NewYorkSonner } from "@/components/ui/sonner"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { FontLoader } from "@/components/theme/font-loader";
import { ThemeSync } from "@/components/theme/theme-sync";
import { SiteHeader } from "@/components/layout/site-header"
import { BottomBar } from "@/components/layout/bottom-bar"
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Main } from "@/components/providers/main"
import { Provider as JotaiProvider } from "jotai"
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import * as React from "react"
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContainerWrapper } from "@/components/theme/wrappers";
import { MainNavigation, MobileNavigation } from "@/app/themes/navigation";
import {
  CustomizerSidebar,
  CustomizerSidebarToggle,
} from "@/components/theme/customizer/customizer-sidebar";

const SIDEBAR_WIDTH = "21rem";
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
              <TooltipProvider>
                <SidebarProvider
                // style={{
                //   "--sidebar-width": SIDEBAR_WIDTH,
                // }}
                >

                  {/* <CustomizerSidebar variant="inset" /> */}
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
                          {/* <Suspense></Suspense> */}
                          {children}
                          <ThemeSync />
                        </Main>
                        <NewYorkToaster />
                        <DefaultToaster />
                        <NewYorkSonner />
                      </div>
                    </SubCategorySidebarProvider>
                  </CategorySidebarProvider>
                  {/* <SidebarInset className="peer-data-[variant=inset]:peer-data-[state=collapsed]:mt-12 peer-data-[variant=inset]:peer-data-[state=expanded]:mt-12 isolate max-h-svh overflow-hidden peer-data-[variant=inset]:max-h-[calc(100svh-3.5rem)]">
                    <SiteHeader />
                    <ScrollArea className="relative z-10 flex h-full flex-col overflow-hidden">
                      <Suspense>
                        {children}
                        <ThemeSync />
                      </Suspense>
                    </ScrollArea>
                  </SidebarInset> */}
                </SidebarProvider>
              </TooltipProvider>
            </NextThemesProvider>
          </JotaiProvider>
        </ThemeProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  )
}

