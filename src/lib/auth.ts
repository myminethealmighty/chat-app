import { fetchReids } from "@/helpers/redis";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";

const googleClientCredentials = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || clientId.length == 0) {
    throw new Error("Missing GOOGLE_CLIENT_ID");
  }

  if (!clientSecret || clientSecret.length == 0) {
    throw new Error("Missing GOOGLE_CLIENT_SECRET");
  }
  return { clientId, clientSecret };
};

export const authOptions: NextAuthOptions = {
  adapter: UpstashRedisAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: googleClientCredentials().clientId,
      clientSecret: googleClientCredentials().clientSecret,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      {
        /* Save the first login account{Caching Behavior} 
        const dbUser = (await db.get(`user:${token.id}`)) as User | null;
        */
      }
      const dbUserResult = (await fetchReids("get", `user:${token.id}`)) as
        | string
        | null;

      if (!dbUserResult) {
        token.id = user!.id;
        return token;
      }
      const dbUser = JSON.parse(dbUserResult) as User;
      return {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        picture: dbUser.image,
      };
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    redirect() {
      return "/dashboard";
    },
  },
};
