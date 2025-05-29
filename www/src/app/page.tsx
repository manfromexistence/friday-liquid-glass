"use client"

import { SignIn } from "@/components/auth/sign-in";
import { SignUp } from "@/components/auth/sign-up";
import { HelloGlow } from "@/app/hello-glow";
import { User } from "@/app/user";
import { Friday } from "@/app/friday";

export default function Home() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-start gap-4 p-4">
      <Friday />

      <HelloGlow />
      <SignUp />
      <SignIn />
      
      <User />
    </div>
  )
}
