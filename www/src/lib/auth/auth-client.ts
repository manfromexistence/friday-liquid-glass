import { createAuthClient } from "manfromexistence-auth/client"
import { anonymousClient } from "manfromexistence-auth/client/plugins"

// const requestGoogleDriveAccess = async () => {
//     await authClient.linkSocial({
//         provider: "google",
//         scopes: ["https://www.googleapis.com/auth/drive.file"],
//     });
// };

export const authClient = createAuthClient({
    plugins: [
        anonymousClient()
    ],
    baseURL: "https://9000-firebase-friday-1748263743234.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev"
    // baseURL: "https://3000-firebase-friday-1748263743234.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev"
    // baseURL: "https://9000-firebase-friday-1748157360105.cluster-ys234awlzbhwoxmkkse6qo3fz6.cloudworkstations.dev"
    // baseURL: "https://3000-manfmexistence-fridayv2-76wpl3hmf9d.ws-us119.gitpod.io"
    // baseURL: "https://9000-firebase-jarvis-1747923459525.cluster-w5vd22whf5gmav2vgkomwtc4go.cloudworkstations.dev/?monospaceUid=134891&embedded=0"
})

export const {
    changeEmail,
    changePassword,
    deleteUser,
    forgetPassword,
    getAccessToken,
    getSession,
    linkSocial,
    listAccounts,
    listSessions,
    refreshToken,
    resetPassword,
    sendVerificationEmail,
    revokeOtherSessions,
    revokeSession,
    revokeSessions,
    unlinkAccount,
    updateUser,
    verifyEmail,
    signIn,
    signUp,
    signOut,
    useSession
} = createAuthClient()