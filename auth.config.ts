import type { NextAuthConfig } from "next-auth";
import { CredentialsSignin } from "next-auth";
import { encode as defaultEncode } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

class LoginError extends CredentialsSignin {
  constructor(message: string) {
    super();
    this.code = message;
  }
}

const REMEMBERED_MAX_AGE = 30 * 24 * 60 * 60; // 30 days
const DEFAULT_MAX_AGE = 24 * 60 * 60; // 1 day

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
    Google({}),
    Credentials({
      async authorize(credentials) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: credentials?.username,
                password: credentials?.password,
                loginAs: credentials?.loginAs,
              }),
              signal: controller.signal,
            },
          );

          const json = await response.json();
          if (!json.data) {
            throw new LoginError(json.message ?? json.error ?? "Invalid credentials");
          }

          const d = json.data;
          const accountType = d.user.accountType as "vendor" | "bidder";

          return {
            id: String(d.user.id),
            userId: String(d.user.id),
            name: d.user.username,
            email: d.user.email,
            username: d.user.username,
            avatar: d.user.avatar ?? "",
            phone: d.user.phone,
            isVerified: d.user.isVerified ?? false,
            userType: accountType,
            permission: [],
            tenant: accountType,
            accessToken: d.accessToken,
            refreshToken: d.refreshToken,
            accessTokenExpiry: d.accessTokenExpiry * 1000,
            refreshTokenExpiry: d.refreshTokenExpiry * 1000,
            onboarding: false,
            organizationId: "",
            rememberMe: credentials?.rememberMe === "true",
          };
        } catch (err) {
          if (err instanceof LoginError) throw err;
          throw new LoginError("Network error. Please try again.");
        } finally {
          clearTimeout(timeout);
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: REMEMBERED_MAX_AGE },
  jwt: {
    async encode(params) {
      const rememberMe = (params.token as { rememberMe?: boolean } | undefined)
        ?.rememberMe;
      const maxAge = rememberMe === false ? DEFAULT_MAX_AGE : REMEMBERED_MAX_AGE;
      return defaultEncode({ ...params, maxAge });
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // ── Social OAuth sign-in (Google, etc.) ────────────────────────────────
      if (account?.provider && account.provider !== "credentials") {
        // Edge runtime only needs to know the user is authenticated
        if (process.env.NEXT_RUNTIME === "edge") return token;

        // Read the role the user selected before clicking "Continue with Google"
        let socialRole = "bidder";
        try {
          const { cookies } = await import("next/headers");
          const cookieStore = await cookies();
          socialRole = cookieStore.get("social_auth_role")?.value ?? "bidder";
        } catch {}

        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/social-login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                provider: account.provider,
                idToken: account.id_token,
                loginAs: socialRole,
              }),
              signal: controller.signal,
            },
          );
          clearTimeout(timeout);

          const json = await response.json();
          console.log("loginAs:", socialRole);
          console.log("SOCIAL LOGIN RESPONSE:", json);
          if (json.data) {
            const d = json.data;
            const accountType = (d.user.accountType ?? socialRole) as "vendor" | "bidder";
            token.userId = String(d.user.id);
            token.username = d.user.username;
            token.avatar = d.user.avatar ?? "";
            token.phone = d.user.phone ?? "";
            token.isVerified = d.user.isVerified ?? false;
            token.userType = accountType;
            token.permission = [];
            token.tenant = accountType;
            token.accessToken = d.accessToken;
            token.refreshToken = d.refreshToken;
            token.accessTokenExpiry = d.accessTokenExpiry * 1000;
            token.refreshTokenExpiry = d.refreshTokenExpiry * 1000;
            token.onboarding = false;
            token.organizationId = "";
            token.rememberMe = true;
          }
        } catch {}

        return token;
      }

      // ── Credentials sign-in ────────────────────────────────────────────────
      if (user && account?.provider === "credentials") {
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
        token.rememberMe = user.rememberMe;
      }

      // Skip the network refresh in Edge Runtime (middleware). Middleware only
      // needs to know the user is authenticated; stale access tokens are fine
      // there. Blocking the Edge request with a fetch causes navigation hangs.
      if (process.env.NEXT_RUNTIME === "edge") return token;

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
