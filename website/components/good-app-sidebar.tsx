"use client"

import * as React from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  GoodSidebar,
  GoodSidebarContent,
  GoodSidebarFooter,
  GoodSidebarHeader,
  GoodSidebarMenuButton,
  useGoodSidebar,
} from "@/components/good-sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { History } from "@/components/sidebar/history"
import { NavUser } from "@/components/sidebar/nav-user"
import { TeamSwitcher } from "@/components/sidebar/team-switcher"
import { useCallback } from "react"
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from "next/navigation"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { aiService } from "@/lib/services/ai-service"

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
  navSecondary: [
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Templates",
      url: "#",
      icon: Blocks,
    },
    {
      title: "Trash",
      url: "#",
      icon: Trash2,
    },
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestion,
    },
  ],
  favorites: [
    {
      name: "Project Management & Task Tracking",
      url: "#",
      emoji: "📊",
    },
    {
      name: "Family Recipe Collection & Meal Planning",
      url: "#",
      emoji: "🍳",
    },
    {
      name: "Fitness Tracker & Workout Routines",
      url: "#",
      emoji: "💪",
    },
    {
      name: "Book Notes & Reading List",
      url: "#",
      emoji: "📚",
    },
    {
      name: "Sustainable Gardening Tips & Plant Care",
      url: "#",
      emoji: "🌱",
    },
    {
      name: "Language Learning Progress & Resources",
      url: "#",
      emoji: "🗣️",
    },
    {
      name: "Home Renovation Ideas & Budget Tracker",
      url: "#",
      emoji: "🏠",
    },
    {
      name: "Personal Finance & Investment Portfolio",
      url: "#",
      emoji: "💰",
    },
    {
      name: "Movie & TV Show Watchlist with Reviews",
      url: "#",
      emoji: "🎬",
    },
    {
      name: "Daily Habit Tracker & Goal Setting",
      url: "#",
      emoji: "✅",
    },
  ],
  workspaces: [
    {
      name: "Personal Life Management",
      emoji: "🏠",
      pages: [
        {
          name: "Daily Journal & Reflection",
          url: "#",
          emoji: "📔",
        },
        {
          name: "Health & Wellness Tracker",
          url: "#",
          emoji: "🍏",
        },
        {
          name: "Personal Growth & Learning Goals",
          url: "#",
          emoji: "🌟",
        },
      ],
    },
    {
      name: "Professional Development",
      emoji: "💼",
      pages: [
        {
          name: "Career Objectives & Milestones",
          url: "#",
          emoji: "🎯",
        },
        {
          name: "Skill Acquisition & Training Log",
          url: "#",
          emoji: "🧠",
        },
        {
          name: "Networking Contacts & Events",
          url: "#",
          emoji: "🤝",
        },
      ],
    },
    {
      name: "Creative Projects",
      emoji: "🎨",
      pages: [
        {
          name: "Writing Ideas & Story Outlines",
          url: "#",
          emoji: "✍️",
        },
        {
          name: "Art & Design Portfolio",
          url: "#",
          emoji: "🖼️",
        },
        {
          name: "Music Composition & Practice Log",
          url: "#",
          emoji: "🎵",
        },
      ],
    },
    {
      name: "Home Management",
      emoji: "🏡",
      pages: [
        {
          name: "Household Budget & Expense Tracking",
          url: "#",
          emoji: "💰",
        },
        {
          name: "Home Maintenance Schedule & Tasks",
          url: "#",
          emoji: "🔧",
        },
        {
          name: "Family Calendar & Event Planning",
          url: "#",
          emoji: "📅",
        },
      ],
    },
    {
      name: "Travel & Adventure",
      emoji: "🧳",
      pages: [
        {
          name: "Trip Planning & Itineraries",
          url: "#",
          emoji: "🗺️",
        },
        {
          name: "Travel Bucket List & Inspiration",
          url: "#",
          emoji: "🌎",
        },
        {
          name: "Travel Journal & Photo Gallery",
          url: "#",
          emoji: "📸",
        },
      ],
    },
  ],
}

export default function GoodSidebarApp({
  ...props
}: React.ComponentProps<typeof GoodSidebar>) {
  const { state, toggleGoodSidebar } = useGoodSidebar()
  const router = useRouter()
  const { user } = useAuth()

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
      const chatId = uuidv4()

      // Create initial chat data with empty messages array
      const chatData = {
        id: chatId,
        title: "New Conversation",
        messages: [], // Start with empty messages array
        model: aiService.currentModel, // Default model
        visibility: 'public',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creatorUid: user.uid,
        reactions: {
          likes: {},
          dislikes: {}
        },
        participants: [user.uid],
        views: 0,
        uniqueViewers: [],
        isPinned: false
      }

      // Store chat data in Firestore
      await setDoc(doc(db, "chats", chatId), chatData)

      // Store information in sessionStorage
      sessionStorage.setItem('selectedAI', aiService.currentModel)
      sessionStorage.setItem('chatId', chatId)
      sessionStorage.setItem('isNewChat', 'true')

      // Navigate to the new chat
      router.push(`/chat/${chatId}`)

    } catch (error) {
      console.error("Error creating new chat:", error)
      toast.error("Failed to create new chat", {
        description: "Please try again"
      });
    }
  }, [user, router])

  return (
    <GoodSidebar side="right" {...props}>
      <GoodSidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </GoodSidebarHeader>
      <GoodSidebarContent>
        <ScrollArea className="w-full p-0 ">
          <div className="mb-2 flex flex-col gap-1 px-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleStartNew}
                    className="hover:text-sidebar-accent-foreground flex min-h-8 min-w-8 items-center justify-center rounded-md text-sm bg-background/40 dark:hover:bg-background hover:bg-primary-foreground hover:border-border dark:border-primary-foreground border"
                  >
                    {state === "expanded" ? (
                      "Start New"
                    ) : (
                      <Plus className="size-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Start New Conversation</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/">
                    <GoodSidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Home className="size-4" />
                      Home
                    </GoodSidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Home</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/automations">
                    <GoodSidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Sparkles className="size-4" />
                      Automations
                    </GoodSidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Automations</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/variants">
                    <GoodSidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <CircleSlash2 className="size-4" />
                      Varients
                    </GoodSidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Varients</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/library">
                    <GoodSidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <LibraryBig className="size-4" />
                      Library
                    </GoodSidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Library</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/projects">
                    <GoodSidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Blocks className="size-4" />
                      Projects
                    </GoodSidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Projects</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/spaces">
                    <GoodSidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Frame className="size-4" />
                      Spaces
                    </GoodSidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Spaces</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={{ pathname: "/more" }}>
                    <GoodSidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:hover:bg-background/40 dark:hover:text-sidebar-accent-foreground hover:bg-primary-foreground hover:text-primary group flex flex-row items-center justify-start transition-all duration-200 ease-in-out border border-transparent hover:border-background">
                      <Ellipsis className="size-4" />
                      More
                    </GoodSidebarMenuButton>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>More Options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>
          {state === "expanded" ? (
            <div className="">
              <div className="mx-auto h-auto w-[93%] border-t border-dashed" />
              <History />
            </div>
          ) : null}
        </ScrollArea>
      </GoodSidebarContent>
      <GoodSidebarFooter>
        {state === "expanded" ?
          null
          : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => {
                      toggleGoodSidebar()
                    }}
                    className="hover:bg-background hover:text-sidebar-accent-foreground flex min-h-8 min-w-8 items-center justify-center rounded-md"
                  >
                    <PanelRight className="size-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Expand Sidebar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        <NavUser />
      </GoodSidebarFooter>
    </GoodSidebar>
  )
}
