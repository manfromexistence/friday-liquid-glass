"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { LogOut } from "lucide-react"; // Example icon import

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [betterauth, setBetterAuth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sessionData = await authClient.getSession();
        setUser(sessionData?.data);

        const accountsData = await authClient.listAccounts();
        setBetterAuth(accountsData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Failed to load profile data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully");
            setUser(null);
            setBetterAuth(null);
            // Optionally, redirect: window.location.href = '/login';
          },
          onError: (error: any) => {
            console.error("SignOut Error:", error);
            toast.error(error?.message || "Sign out failed. Please try again.");
          }
        },
      });
    } catch (error: any) {
        console.error("SignOut Exception:", error);
        toast.error(error?.message || "An unexpected error occurred during sign out.");
    }
  };

  const getInitials = (name?: string): string => {
    if (!name) return "P"; // Default placeholder
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length > 1 && nameParts[0] && nameParts[nameParts.length - 1]) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    if (nameParts[0] && nameParts[0].length >= 2) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    if (nameParts[0] && nameParts[0].length === 1) {
        return nameParts[0][0].toUpperCase();
    }
    return "P";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-10 h-10">
        <div className="w-6 h-6 border-2 border-gray-300 rounded-full border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (!user || !user.user) {
    // This button is a placeholder. In a real app, you might redirect to a login page
    // or open a login modal.
    return (
      <Button 
        variant="outline" 
        onClick={() => { 
          // Implement sign-in navigation or modal trigger here
          // For example: router.push('/signin') or setSignInModalOpen(true)
          toast.info("Please sign in to view your profile."); 
        }}
      >
        Sign In
      </Button>
    );
  }

  const { user: userData } = user; // Destructure from user state (user.user contains profile info)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10">
            {userData.image ? (
              <AvatarImage src={userData.image} alt={userData.name || "User profile"} />
            ) : null}
            <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userData.name || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userData.email || "No email provided"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          <p><strong>ID:</strong> {userData.id || "N/A"}</p>
          <p><strong>Email Verified:</strong> {userData.emailVerified ? "Yes" : "No"}</p>
        </div>

        {betterauth && betterauth.data && betterauth.data.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs px-2 py-1.5 font-semibold text-foreground">Linked Accounts</DropdownMenuLabel>
            {betterauth.data.slice(0, 2).map((account: any) => (
              <div key={account.id} className="px-2 py-1.5 text-xs text-muted-foreground">
                <p><strong>Provider:</strong> {account.provider || "N/A"}</p>
                {/* You can add more account details if needed, e.g., account.accountId */}
              </div>
            ))}
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 hover:!text-red-600 focus:!text-red-600">
          {/* <LogOut className="w-4 h-4 mr-2" /> */}
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}