import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { tenantFromHost } from "@/lib/tenant-from-host";

const roleRedirects: Record<string, string> = {
  admin: "/admin/programs",
  manager: "/manager/programs",
  eso: "/eso/programs",
  participant: "/coach/onboarding",
};

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      async authorize(credentials, request) {
        const host = request.headers.get("host") ?? "";
        const tenant = tenantFromHost(host);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Tenant-Domain": tenant,
              },
              body: JSON.stringify(credentials),
              signal: controller.signal,
            },
          );

          if (!response.ok) return null;

          const result = await response.json();
          const data = result.data;

          return {
            id: String(data.user.id),
            userId: data.user.id,
            name: data.user.username,
            username: data.user.username,
            avatar: data.user.avatar ?? "",
            userType: data.user.accountType,
            permission: [],
            tenant,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpiry: data.accessTokenExpiry,
            refreshTokenExpiry: data.refreshTokenExpiry,
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
  session: { strategy: "jwt" },
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
            const refreshed = await response.json();
            token.accessToken = refreshed.accessToken;
            token.refreshToken = refreshed.refreshToken;
            token.accessTokenExpiry = refreshed.accessTokenExpiry;
            token.refreshTokenExpiry = refreshed.refreshTokenExpiry;
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
      session.user.userType = token.userType as
        | "admin"
        | "manager"
        | "eso"
        | "participant";
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
  // role-based redirect is handled in middleware after sign-in
  events: {},
  // expose roleRedirects for middleware use
} satisfies NextAuthConfig;

export { roleRedirects };
