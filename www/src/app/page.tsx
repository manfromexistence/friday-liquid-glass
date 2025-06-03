import { GoogleDriveService } from '@/lib/googleDrive';

export default async function Home() {
  const driveService = new GoogleDriveService(
    process.env.GOOGLE_CLIENT_EMAIL!,
    process.env.GOOGLE_PRIVATE_KEY!
  );

  const files = await driveService.listFiles();

  return (
    <div>
      <h1>Google Drive Files</h1>
      <ul>
        {files.map((file) => (
          <li key={file.id}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
}





















// "use client"

// import { SignIn } from "@/components/auth/sign-in";
// import { SignUp } from "@/components/auth/sign-up";
// import { HelloGlow } from "@/app/hello-glow";
// import { User } from "@/app/user";
// import { Friday } from "@/app/friday";
// import { Fluid } from "@/app/fluid";
// import { Cursor } from "@/app/cursor";
// import ChatPage from "@/app/chat/[slug]/page";
// import Chatbot from "@/app/chat";
// import AiInput from "@/components/chat/ai-input";
// import { authClient } from "@/lib/auth/auth-client";
// import { Button } from "@/components/ui/button";

// export default function Home() {
//   return (
//     <div className="flex min-h-svh w-full flex-col items-start space-y-4">
//       <span>
//         Friday - Your Ai Friend!
//       </span>

//       <Button
//         onClick={
//           async () => {
//             await authClient.signIn.anonymous()
//           }
//         }
//         className="p-4 border rounded-md">
//         Anynomus SignUp
//       </Button>

      
//       <AiInput />
//       <Chatbot />
//       <ChatPage />
//       <Cursor />

//       <Fluid />
//       <Friday />

//       <HelloGlow />

//       <User /> 
      
//       <SignUp />
//       <SignIn />
     
//     </div>
//   )
// }

