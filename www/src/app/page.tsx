"use client"

import { SignIn } from "@/components/auth/sign-in";
import { SignUp } from "@/components/auth/sign-up";
import { HelloGlow } from "@/app/hello-glow";
import { User } from "@/app/user";
import { Friday } from "@/app/friday";
import { Fluid } from "@/app/fluid";
import { Cursor } from "@/app/cursor";
import ChatPage from "@/app/chat/[slug]/page";
import Chatbot from "@/app/chat";
import AiInput from "@/components/chat/ai-input";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-svh w-full flex-col items-start space-y-4">
      <span>
        Friday - Your Ai Friend!
      </span>

      <Button
        onClick={
          async () => {
            await authClient.signIn.anonymous()
          }
        }
        className="p-4 border rounded-md">
        Anynomus SignUp
      </Button>

      <SignUp />
      <SignIn />

      {/* 
      <AiInput />
      <Chatbot />
      <ChatPage />
      <Cursor />

      <Fluid />
      <Friday />

      <HelloGlow />

      <User /> 
      */}
    </div>
  )
}

