import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

const roleRedirects: Record<string, string> = {
  admin: "/admin/programs",
  manager: "/manager/programs",
  eso: "/eso/programs",
  participant: "/coach/onboarding",
  vendor: "/vendor/dashboard/home",
  bidder: "/bidder/all-items",
};

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/customer-login/vendor`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: credentials?.username,
                password: credentials?.password,
              }),
              signal: controller.signal,
            },
          );

          const json = await response.json();
          if (!json.status || !json.data) return null;

          const d = json.data;
          const accountType = d.user.accountType as "vendor" | "bidder";

          return {
            id: String(d.user.id),
            userId: String(d.user.id),
            name: d.user.username,
            email: d.user.email,
            username: d.user.username,
            avatar: d.user.avatar,
            phone: d.user.phone,
            isVerified: d.user.isVerified,
            userType: accountType,
            permission: [],
            tenant: accountType,
            accessToken: d.accessToken,
            refreshToken: d.refreshToken,
            accessTokenExpiry: d.accessTokenExpiry * 1000,
            refreshTokenExpiry: d.refreshTokenExpiry * 1000,
            onboarding: false,
            organizationId: "",
          };
        } catch {
          return null;
        } finally {
          clearTimeout(timeout);
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.userId;
        token.username = user.username;
        token.avatar = user.avatar;
        token.phone = user.phone;
        token.isVerified = user.isVerified;
        token.userType = user.userType;
        token.permission = user.permission;
        token.tenant = user.tenant;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpiry = user.accessTokenExpiry;
        token.refreshTokenExpiry = user.refreshTokenExpiry;
        token.onboarding = user.onboarding;
        token.organizationId = user.organizationId;
      }

      const fiveMinutes = 5 * 60 * 1000;
      const now = Date.now();

      if (
        token.accessTokenExpiry &&
        now >= (token.accessTokenExpiry as number) - fiveMinutes
      ) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
              method: "POST",
              headers: {
                "X-Refresh-Token": token.refreshToken as string,
                "X-Tenant-Domain": token.tenant as string,
              },
              signal: controller.signal,
            },
          );

          clearTimeout(timeout);

          if (response.ok) {
            const json = await response.json();
            const refreshed = json.data ?? json;
            token.accessToken = refreshed.accessToken;
            token.refreshToken = refreshed.refreshToken;
            token.accessTokenExpiry = refreshed.accessTokenExpiry * 1000;
            token.refreshTokenExpiry = refreshed.refreshTokenExpiry * 1000;
          }
        } catch {
          // Fall back gracefully — keep existing token
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.userId = token.userId as string;
      session.user.username = token.username as string;
      session.user.avatar = token.avatar as string;
      session.user.phone = token.phone as string;
      session.user.isVerified = token.isVerified as boolean;
      session.user.userType = token.userType as
        | "admin"
        | "manager"
        | "eso"
        | "participant"
        | "vendor"
        | "bidder";
      session.user.permission = token.permission as string[];
      session.user.tenant = token.tenant as string;
      session.user.accessToken = token.accessToken as string;
      session.user.refreshToken = token.refreshToken as string;
      session.user.accessTokenExpiry = token.accessTokenExpiry as number;
      session.user.refreshTokenExpiry = token.refreshTokenExpiry as number;
      session.user.onboarding = token.onboarding as boolean;
      session.user.organizationId = token.organizationId as string;
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  events: {},
} satisfies NextAuthConfig;

export { roleRedirects };
