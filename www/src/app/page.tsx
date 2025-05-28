"use client"

import SignIn from "@/components/auth/sign-in";
import SignUp from "@/components/auth/sign-up";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import Image from "next/image"

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [betterauth, setBetterAuth] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await authClient.getSession();
      setUser(session?.data);
    };
    const fetchBetterAuth = async () => {
      const data = await authClient.listAccounts();
      setBetterAuth(data);
    };
    fetchSession();
    fetchBetterAuth();
  }, []);

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-start gap-4 py-4 pt-16">
      <div className="flex flex-col gap-4 w-full max-w-md">
        {user ? (
          <>
            {user.user.image && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden mx-auto">
                <Image
                  src={user.user.image}
                  alt="Profile image"
                  layout="fill"
                  objectFit="cover"
                  unoptimized
                />
              </div>
            )}
            <h2 className="text-xl font-bold text-center">User Information</h2>
            <div className="grid gap-2">
              <span>
                <strong>Image:</strong> {user.user.image || "Not available"}
              </span>
              <span>
                <strong>Name:</strong> {user.user.name || "Not available"}
              </span>
              <span>
                <strong>Email:</strong> {user.user.email || "No email"}
              </span>
              <span>
                <strong>Email Verified:</strong>{" "}
                {user.user.emailVerified ? "Yes" : "No"}
              </span>
              <span>
                <strong>Is Anonymous:</strong>{" "}
                {user.user.isAnonymous ? "Yes" : "No"}
              </span>
              <span>
                <strong>User ID:</strong> {user.user.id || "Not available"}
              </span>
              <span>
                <strong>User NAME:</strong> {user.user.username || "Not available"}
              </span>
              <span>
                <strong>User ID:</strong> {user.user.id || "Not available"}
              </span>
              <span>
                <strong>Account Created:</strong>{" "}
                {new Date(user.user.createdAt).toLocaleString() || "Not available"}
              </span>
              <span>
                <strong>Account Updated:</strong>{" "}
                {new Date(user.user.updatedAt).toLocaleString() || "Not available"}
              </span>
            </div>
            <h2 className="text-xl font-bold text-center mt-4">
              Session Information
            </h2>
            <div className="grid gap-2">
              <span>
                <strong>Session ID:</strong> {user.session.id || "Not available"}
              </span>
              <span>
                <strong>Token:</strong> {user.session.token || "Not available"}
              </span>
              <span>
                <strong>Session Created:</strong>{" "}
                {new Date(user.session.createdAt).toLocaleString() ||
                  "Not available"}
              </span>
              <span>
                <strong>Session Updated:</strong>{" "}
                {new Date(user.session.updatedAt).toLocaleString() ||
                  "Not available"}
              </span>
              <span>
                <strong>Expires At:</strong>{" "}
                {new Date(user.session.expiresAt).toLocaleString() ||
                  "Not available"}
              </span>
              <span>
                <strong>IP Address:</strong>{" "}
                {user.session.ipAddress || "Not available"}
              </span>
              <span>
                <strong>User Agent:</strong>{" "}
                {user.session.userAgent || "Not available"}
              </span>
            </div>
            {betterauth && betterauth.data && betterauth.data.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-center mt-4">
                  Account Information
                </h2>
                {betterauth.data.map((account: any, index: number) => (
                  <div key={account.id} className="grid gap-2 mt-2">
                    <h3 className="text-lg font-semibold">
                      Account {index + 1}
                    </h3>
                    <span>
                      <strong>Account ID:</strong> {account.id || "Not available"}
                    </span>
                    <span>
                      <strong>Provider:</strong>{" "}
                      {account.provider || "Not available"}
                    </span>
                    <span>
                      <strong>Created At:</strong>{" "}
                      {new Date(account.createdAt).toLocaleString() ||
                        "Not available"}
                    </span>
                    <span>
                      <strong>Updated At:</strong>{" "}
                      {new Date(account.updatedAt).toLocaleString() ||
                        "Not available"}
                    </span>
                    <span>
                      <strong>Linked Account ID:</strong>{" "}
                      {account.accountId || "Not available"}
                    </span>
                    <span>
                      <strong>Scopes:</strong>{" "}
                      {account.scopes.length > 0
                        ? account.scopes.join(", ")
                        : "None"}
                    </span>
                  </div>
                ))}
              </>
            )}
          </>
        ) : (
          <div className="text-center">
            <span className="text-lg">Not logged in</span>
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <Button
          onClick={async () => {
            const data = await authClient.listAccounts();
            setBetterAuth(data);
            toast.info("Accounts refreshed");
          }}
        >
          List Accounts
        </Button>
        <Button
          onClick={async () => {
            const session = await authClient.getSession();
            setUser(session?.data);
            toast.info("Session refreshed");
          }}
        >
          Refresh Session
        </Button>
        <Button
          onClick={async () => {
            await authClient.signOut({
              fetchOptions: {
                onSuccess: () => {
                  console.log("SignOut Successfully");
                  toast.info("Signed out");
                  setUser(null);
                },
              },
            });
          }}
        >
          Sign Out
        </Button>
      </div>
      {/* <SignUp />
      <SignIn /> */}
      <div className="hello">
        <span className="start" style={{ "--i": 1 } as React.CSSProperties}></span>
        <span style={{ "--i": 2 } as React.CSSProperties}></span>
        <span style={{ "--i": 3 } as React.CSSProperties}></span>
        <span style={{ "--i": 4 } as React.CSSProperties}></span>
        <span style={{ "--i": 5 } as React.CSSProperties}></span>
        <span style={{ "--i": 6 } as React.CSSProperties}></span>
        <span style={{ "--i": 7 } as React.CSSProperties}></span>
        <span style={{ "--i": 8 } as React.CSSProperties}></span>
        <span style={{ "--i": 9 } as React.CSSProperties}></span>
        <span style={{ "--i": 10 } as React.CSSProperties}></span>
        <span style={{ "--i": 11 } as React.CSSProperties}></span>
        <span style={{ "--i": 12 } as React.CSSProperties}></span>
        <span style={{ "--i": 13 } as React.CSSProperties}></span>
        <span style={{ "--i": 14 } as React.CSSProperties}></span>
        <span style={{ "--i": 15 } as React.CSSProperties}></span>
        <span style={{ "--i": 16 } as React.CSSProperties}></span>
        <span style={{ "--i": 17 } as React.CSSProperties}></span>
        <span style={{ "--i": 18 } as React.CSSProperties}></span>
        <span style={{ "--i": 19 } as React.CSSProperties}></span>
        <span className="end" style={{ "--i": 20 } as React.CSSProperties}></span>
      </div>
    </div>
  )
}

{/* <Friday orbSize={100} shapeSize={90} />  */ }
{/* <h1 className="bold w-full text-center font-sans text-3xl">
        {greeting && `${greeting}, Sumon.`}
      </h1>
      <AiInput
        ref={aiInputRef}
        onInputChange={setCurrentInput}
        onSubmit={() => setHasSubmitted(true)}
      /> */}
{/* <div className="animate-content-height w-full transition-all duration-500 ease-in-out">
        {currentInput.trim() ? (
          <SearchSuggestions
            inputValue={currentInput}
            onSuggestionSelect={handleSuggestionSelect}
          />
        ) : (
          <PersonaSelector />
        )}
      </div> */}
