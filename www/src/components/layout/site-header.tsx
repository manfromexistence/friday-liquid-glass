"use client"

import * as React from "react"
import {
  CustomizerSidebar,
  CustomizerSidebarToggle,
} from "@/components/theme/customizer/customizer-sidebar";
import { Button } from "@/components/ui/button";
import { ContainerWrapper } from "@/components/theme/wrappers";
import { MainNavigation, MobileNavigation } from "@/app/themes/navigation";

export function SiteHeader() {
  return (
    <header className="fixed top-0 right-0 isolate flex shrink-0 items-center gap-2 h-12 w-full pl-76">
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
  )
}
