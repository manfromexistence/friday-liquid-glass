import { betterAuth } from "manfromexistence-auth";
import { drizzleAdapter } from "manfromexistence-auth/adapters/drizzle";
import { db } from "../../db/drizzle";
import { schema } from "@/db/schema";
import {
  username,
  anonymous,
  phoneNumber,
  magicLink,
  emailOTP,
  oneTap,
  haveIBeenPwned,
  multiSession,
  oAuthProxy,
  openAPI,
} from "manfromexistence-auth/plugins"
import { passkey } from "manfromexistence-auth/plugins/passkey";

export const auth = betterAuth({

  plugins: [
    oAuthProxy(),
    openAPI(),
    username(),
    anonymous(),
    passkey(),
    oneTap(),
    haveIBeenPwned(),
    multiSession({
      maximumSessions: 10
    }),
    phoneNumber({
      sendOTP: ({ phoneNumber, code }, request) => {
        // Implement sending OTP code via SMS
      }
    }),
    magicLink({
      sendMagicLink: async ({ email, token, url }, request) => {
        // send email to user
      }
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Implement the sendVerificationOTP method to send the OTP to the user's email address
      },
    }),
  ],

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "twitter", "tiktok", "gitlab", "facebook", "discord,", "zoom", "reddit", "spotify", "kick"],
    }
  },

  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {
      // Send an email to the user with a link to reset their password
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: "https://9000-firebase-friday-1748263743234.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev/api/auth/callback/google"
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
    },
    tiktok: {
      clientId: process.env.TIKTOK_CLIENT_ID as string,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET as string,
      clientKey: process.env.TIKTOK_CLIENT_KEY as string,
    },

    gitlab: {
      clientId: process.env.GITLAB_CLIENT_ID as string,
      clientSecret: process.env.GITLAB_CLIENT_SECRET as string,
      issuer: process.env.GITLAB_ISSUER as string,
    },

    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
    reddit: {
      clientId: process.env.REDDIT_CLIENT_ID as string,
      clientSecret: process.env.REDDIT_CLIENT_SECRET as string,
      duration: "permanent",
      scope: ["read", "submit"]
    },
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
    },
    zoom: {
      clientId: process.env.ZOOM_CLIENT_ID as string,
      clientSecret: process.env.ZOOM_CLIENT_SECRET as string,
    },

    kick: {
      clientId: process.env.KICK_CLIENT_ID as string,
      clientSecret: process.env.KICK_CLIENT_SECRET as string,
    },

    dropbox: {
      clientId: process.env.DROPBOX_CLIENT_ID as string,
      clientSecret: process.env.DROPBOX_CLIENT_SECRET as string,
    },

    // facebook: {
    //   clientId: process.env.FACEBOOK_CLIENT_ID as string,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    //   scopes: ["email", "public_profile", "user_friends"], // Overwrites permissions
    //   fields: ["user_friends"], // Extending list of fields
    // },
  },

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
});
