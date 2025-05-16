"use client"

import { useState } from "react"
import { Settings, CreditCard, FileText, Users, LogOut, Moon, Sun, Laptop, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function Profile() {
  const [language, setLanguage] = useState("English")
  const [theme, setTheme] = useState("dark")
  const [open, setOpen] = useState(false)

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Profile</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="end">
        <div className="flex flex-col">
          {/* User Info */}
          <div className="space-y-1 p-4 border-b">
            <p className="font-medium">manfromexistence</p>
            <p className="text-sm ">manfromexistence01@gmail.com</p>
          </div>

          {/* Usage Stats */}
          <div className="space-y-1 p-4 border-b">
            <div className="flex justify-between items-center">
              <span className="text-sm">Messages Left</span>
              <span className="text-sm">9/10</span>
            </div>
            <p className="text-xs">Usage resets in 1 day</p>
          </div>

          {/* Navigation */}
          <nav className="p-1">
            <Button variant="ghost" className="w-full justify-start px-3 py-2 h-9 text-sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start px-3 py-2 h-9 text-sm">
              <CreditCard className="mr-2 h-4 w-4" />
              Pricing
            </Button>
            <Button variant="ghost" className="w-full justify-start px-3 py-2 h-9 text-sm">
              <FileText className="mr-2 h-4 w-4" />
              Documentation
            </Button>
            <Button variant="ghost" className="w-full justify-start px-3 py-2 h-9 text-sm">
              <Users className="mr-2 h-4 w-4" />
              Community
            </Button>
          </nav>

          {/* Preferences */}
          <div className="p-4 border-t ">
            <p className="text-sm mb-3">Preferences</p>

            <div className="space-y-3">
              {/* Theme Selector */}
              <div className="flex justify-between items-center">
                <span className="text-sm">Theme</span>
                <div className="flex space-x-1 rounded-md p-1">
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`p-1 rounded ${theme === "light" ? "" : ""}`}
                  >
                    <Sun className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`p-1 rounded ${theme === "dark" ? "" : ""}`}
                  >
                    <Moon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleThemeChange("system")}
                    className={`p-1 rounded ${theme === "system" ? "" : ""}`}
                  >
                    <Laptop className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Language Selector */}
              <div className="flex justify-between items-center">
                <span className="text-sm">Language</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 px-2 text-sm bg-transparent border"
                    >
                      {language}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="ml-2 h-4 w-4"
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="">
                    <DropdownMenuItem onClick={() => setLanguage("English")}>English</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("Spanish")}>Spanish</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("French")}>French</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage("German")}>German</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          {/* <Button variant="ghost" className="justify-start px-3 py-2 h-9 text-sm rounded-none border-t">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>

          <div className="p-4 border-t ">
            <Button className="w-full">Upgrade to Premium</Button>
          </div> */}
        </div>
      </PopoverContent>
    </Popover>
  )
}
