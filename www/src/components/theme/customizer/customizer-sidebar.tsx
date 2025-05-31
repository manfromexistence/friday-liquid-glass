"use client";

import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";
import { FileSliders, LetterText, Menu, PaintBucket, Palette, PanelLeftDashed, SlidersHorizontal, SwatchBook, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActionButtons } from "@/components/theme/customizer/action-buttons";
import { ColorTokens } from "@/components/theme/customizer/color-tokens";
import { ComingSoon } from "@/components/theme/customizer/coming-soon";
import {
  AllPresetsControl,
  ControlSection,
  ControlsSkeleton,
  RadiusSliderControl,
  ShadowsControl,
  SurfaceShadesControl,
} from "@/components/theme/customizer/customizer-controls";

import { Typography } from "@/components/theme/customizer/typography";
import Link from "next/link"
import {
  AudioWaveform,
  Blocks,
  BookOpen,
  Bot,
  Calendar,
  CircleSlash2,
  Command,
  Ellipsis,
  Frame,
  GalleryVerticalEnd,
  Gift,
  Heart,
  Home,
  Info,
  LibraryBig,
  Map,
  MessageCircleQuestion,
  PanelRight,
  PieChart,
  Plus,
  Settings2,
  Sparkles,
  SquareTerminal,
  Trash2,
} from "lucide-react"
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { History } from "@/components/layout/sidebar/history"
import { TeamSwitcher } from "@/components/layout/sidebar/team-switcher"
import { useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Banner } from "@/components/layout/banner"


export function CustomizerSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar()
  const isMounted = useMounted();
  const router = useRouter()

  const user = {
    uid: "test-user-uid",
    photoURL: "https://via.placeholder.com/150",
    displayName: "Test User",
    email: "test@example.com",
  };

  // Create a handler function for the Start New button
  const handleStartNew = useCallback(async () => {
    try {
      if (!user) {
        toast.error("Authentication required", {
          description: "Please sign in to start a new chat",
          duration: 3000,
        });
        return;
      }

      // Generate a new UUID for the chat
      const chatId = uuidv4();

      // Create initial chat data with empty messages array
      const chatData = {
        id: chatId,
        title: "New Conversation",
        messages: [], // Start with empty messages array
        model: "simulated-model", // Default model // aiService.currentModel,
        visibility: "public",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creatorUid: user.uid,
        reactions: {
          likes: {},
          dislikes: {},
        },
        participants: [user.uid],
        views: 0,
        uniqueViewers: [],
        isPinned: false,
      };

      // Store chat data in Firestore
      // await setDoc(doc(db, "chats", chatId), chatData);
      console.log("Simulating storing chat data:", chatData);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operation

      // Store information in sessionStorage
      sessionStorage.setItem("selectedAI", "simulated-model" /*aiService.currentModel*/);
      sessionStorage.setItem("chatId", chatId)
      sessionStorage.setItem("isNewChat", "true")

      // Navigate to the new chat
      router.push(`/chat/${chatId}`)
    } catch (error) {
      console.error("Error creating new chat:", error)
      toast.error("Failed to create new chat", {
        description: "Please try again",
      })
    }
  }, [user, router])

  if (!isMounted) {
    return (
      <Sidebar className="overflow-hidden" {...props}>
        <SidebarHeader className="px-2 pr-3 max-md:pt-4">
          <Skeleton className="bg-muted h-9" />
        </SidebarHeader>

        <SidebarContent className="scrollbar-thin @container relative flex max-h-svh flex-col py-2 group-data-[collapsible=icon]:invisible [&>button]:hidden">
          <div className="flex grow flex-col space-y-4 overflow-hidden px-2 pr-3">
            <ControlsSkeleton className="h-10" />

            <div className="grow overflow-hidden">
              <ControlsSkeleton className="h-200" />
            </div>
          </div>
        </SidebarContent>

        <SidebarFooter className="space-y-1 px-2 pr-3">
          <Skeleton className="bg-muted h-8" />
          <Skeleton className="bg-muted h-8" />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" className="overflow-hidden" {...props}>
      <Tabs
        defaultValue="sidebar"
        className="flex flex-1 flex-col gap-0 overflow-hidden"
      >
        <SidebarHeader>
          <TeamSwitcher />
          {state !== "expanded" &&
            (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleStartNew}
                      className="flex min-h-8 min-w-8 items-center justify-center rounded-md text-sm border hover:bg-secondary"
                    >
                      <Plus className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Start New Conversation</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/">
                      <SidebarMenuButton>
                        <Home className="size-4 mr-2" />
                        Home
                      </SidebarMenuButton>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Home</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/automations">
                      <SidebarMenuButton>
                        <Sparkles className="size-4 mr-2" />
                        Automations
                      </SidebarMenuButton>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Automations</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/variants">
                      <SidebarMenuButton>
                        <CircleSlash2 className="size-4 mr-2" />
                        Varients
                      </SidebarMenuButton>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Varients</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/library">
                      <SidebarMenuButton>
                        <LibraryBig className="size-4 mr-2" />
                        Library
                      </SidebarMenuButton>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Library</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/projects">
                      <SidebarMenuButton>
                        <Blocks className="size-4 mr-2" />
                        Projects
                      </SidebarMenuButton>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Projects</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/spaces">
                      <SidebarMenuButton>
                        <Frame className="size-4 mr-2" />
                        Spaces
                      </SidebarMenuButton>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Spaces</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={{ pathname: "/more" }}>
                      <SidebarMenuButton>
                        <Ellipsis className="size-4 mr-2" />
                        More
                      </SidebarMenuButton>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>More Options</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          {/* <TabsList className="w-full p-1">
            <TabsTrigger value="palette" className="text-xs">
              Palette
            </TabsTrigger>
            <TabsTrigger value="tokens" className="text-xs">
              Tokens
            </TabsTrigger>
            <TabsTrigger value="typography" className="text-xs">
              Typography
            </TabsTrigger>
          </TabsList> */}
        </SidebarHeader>

        <SidebarContent className="@container relative my-0 max-h-svh pt-2 pb-0 group-data-[collapsible=icon]:invisible [&>button]:hidden">
            <ScrollArea className="flex flex-col px-2 pr-1 overflow-hidden">
              <TabsContent
                value="sidebar"
                className="mb-2 min-h-full"
              >
                <div className="flex flex-col gap-1 px-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleStartNew}
                          className="flex min-h-8 min-w-8 items-center justify-center rounded-md text-sm border hover:bg-secondary"
                        >
                          Start New
                          {/* {state === "expanded" ? "Start New" : <Plus className="size-4" />} */}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Start New Conversation</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/">
                          <SidebarMenuButton>
                            <Home className="size-4 mr-2" />
                            Home
                          </SidebarMenuButton>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Home</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/automations">
                          <SidebarMenuButton>
                            <Sparkles className="size-4 mr-2" />
                            Automations
                          </SidebarMenuButton>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Automations</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/variants">
                          <SidebarMenuButton>
                            <CircleSlash2 className="size-4 mr-2" />
                            Varients
                          </SidebarMenuButton>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Varients</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/library">
                          <SidebarMenuButton>
                            <LibraryBig className="size-4 mr-2" />
                            Library
                          </SidebarMenuButton>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Library</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/projects">
                          <SidebarMenuButton>
                            <Blocks className="size-4 mr-2" />
                            Projects
                          </SidebarMenuButton>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Projects</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href="/spaces">
                          <SidebarMenuButton>
                            <Frame className="size-4 mr-2" />
                            Spaces
                          </SidebarMenuButton>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Spaces</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={{ pathname: "/more" }}>
                          <SidebarMenuButton>
                            <Ellipsis className="size-4 mr-2" />
                            More
                          </SidebarMenuButton>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>More Options</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <div className="mx-auto h-auto w-[93%] border-t border-dashed" />
                  <History />
                </div>
                {/* {state === "expanded" && (
                  <div className="">
                    <div className="mx-auto h-auto w-[93%] border-t border-dashed" />
                    <History />
                  </div>
                )} */}
              </TabsContent>

              <TabsContent
                value="palette"
                className="mx-1 mb-2 flex flex-col space-y-4"
              >
                <section className="flex-1 space-y-1.5 max-sm:w-full max-sm:max-w-full">
                  <Label className="flex items-center gap-1 pb-2">
                    <PaintBucket className="size-4" /> Theme presets
                  </Label>
                  <AllPresetsControl />
                </section>

                <ColorTokens />
              </TabsContent>

              <TabsContent value="tokens" className="mx-2 mb-2">
                <section className="space-y-1.5">
                  <Label className="flex items-center gap-1 pb-2">
                    <SlidersHorizontal className="size-4" /> Other tokens
                  </Label>

                  <ControlSection title="Surface" expanded className="p-0">
                    <SurfaceShadesControl className="bg-transparent" />
                    <div className="text-muted-foreground mb-3 truncate px-3 text-xs">
                      For background, card, popover, muted, accent...
                    </div>
                  </ControlSection>

                  <ControlSection title="Radius" expanded>
                    <RadiusSliderControl />
                  </ControlSection>

                  <ControlSection title="Shadows">
                    <ShadowsControl />
                  </ControlSection>

                  <ControlSection title="Spacing">
                    <ComingSoon />
                  </ControlSection>

                </section>
              </TabsContent>
              <TabsContent value="typography" className="mx-2 mb-2">
                <Typography />
              </TabsContent>
            </ScrollArea>

        </SidebarContent>


        <SidebarFooter className="px-2">
          {state === "expanded" ? (
            <TabsList className="w-full p-1">
              <TabsTrigger value="sidebar">
                {/* Sidebar */}
                <PanelLeftDashed />
              </TabsTrigger>
              <TabsTrigger value="palette">
                {/* Palette */}
                <SwatchBook />
              </TabsTrigger>
              <TabsTrigger value="tokens">
                {/* Tokens */}
                <FileSliders />
              </TabsTrigger>
              <TabsTrigger value="typography">
                {/* Typography */}
                <LetterText />
              </TabsTrigger>
            </TabsList>
          ) : (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => {
                        toggleSidebar()
                      }}
                      className="flex min-h-8 min-w-8 items-center justify-center rounded-md"
                    >
                      <PanelRight className="size-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Expand Sidebar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex min-h-8 min-w-8 items-center justify-center rounded-md">
                      <Info className="size-[18.5px]" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Friday is still in beta so it can make mistakes.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          {/* <ActionButtons /> */}
        </SidebarFooter>

      </Tabs>
      <SidebarRail />
    </Sidebar>
  );
}

export function CustomizerSidebarToggle({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { open, toggleSidebar, openMobile } = useSidebar();
  return (
    <>
      <Button
        size={"sm"}
        variant="outline"
        className="size-8 md:hidden"
        onClick={toggleSidebar}

      >
        <Menu className="size-4" />
      </Button>
      {/* <Button
        variant={"ghost"}
        size={"icon"}
        onClick={toggleSidebar}
        className={cn("relative hidden md:inline-flex", className)}
        {...props}
      >
        <Palette
          className={cn(
            "transition duration-200",
            open ? "absolute scale-0" : "scale-100",
          )}
        />
        <X
          className={cn(
            "transition duration-200",
            !open ? "absolute scale-0" : "scale-100",
          )}
        />
        <div
          className={cn(
            "bg-primary absolute top-0 right-0 size-2 rounded-full transition-opacity duration-300 ease-in-out",
            open ? "opacity-0" : "animate-bounce opacity-100",
          )}
        />
      </Button>

      <Button
        variant={"ghost"}
        size={"icon"}
        onClick={toggleSidebar}
        className={cn("relative inline-flex md:hidden", className)}
        {...props}
      >
        <Palette
          className={cn(
            "transition duration-200",
            openMobile ? "absolute scale-0" : "scale-100",
          )}
        />
        <X
          className={cn(
            "transition duration-200",
            !openMobile ? "absolute scale-0" : "scale-100",
          )}
        />
        <div
          className={cn(
            "bg-primary absolute top-0 right-0 size-2 rounded-full transition-opacity duration-300 ease-in-out",
            openMobile ? "opacity-0" : "animate-bounce opacity-100",
          )}
        />
      </Button> */}
    </>
  );
}
