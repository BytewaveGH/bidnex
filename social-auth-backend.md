# Social Auth — Backend Integration

## New Endpoint Required

### `POST /auth/social-login`

**Request body:**
```json
{
  "provider": "google",
  "idToken": "<Google ID token string>",
  "loginAs": "bidder" | "vendor"
}
```

**Logic:**
1. Verify the `idToken` with Google:
   - Use Google's tokeninfo endpoint: `https://oauth2.googleapis.com/tokeninfo?id_token=<token>`
   - Or use an official Google SDK/library for your backend language
2. Extract `email`, `name`, `picture` from the verified token payload
3. Look up user by `email` in the database:
   - **User exists** → log them in, return their existing `accountType` (ignore `loginAs`)
   - **User is new** → create account with `email`, `name` as username, `picture` as avatar, `accountType = loginAs`. Phone can be null/empty and filled in later.

**Success response — same shape as `/auth/login`:**
```json
{
  "status": true,
  "data": {
    "user": {
      "id": 123,
      "username": "John Doe",
      "email": "john@example.com",
      "avatar": "https://lh3.googleusercontent.com/...",
      "phone": "",
      "isVerified": true,
      "accountType": "bidder"
    },
    "accessToken": "...",
    "refreshToken": "...",
    "accessTokenExpiry": 1234567890,
    "refreshTokenExpiry": 1234567890
  }
}
```

**Notes:**
- `accessTokenExpiry` / `refreshTokenExpiry` are Unix timestamps **in seconds** (frontend multiplies by 1000 — same as credentials login)
- `isVerified` should always be `true` for social accounts (Google already verified the email)
- No OTP required for social auth users
- The existing `/auth/refresh` endpoint works as-is — no changes needed

---

## No Changes Needed

- `/auth/refresh` — works as-is
- `/auth/login` — works as-is
- `/auth/register` — works as-is

---

## Frontend Environment Variables Needed

Add these to `.env.local` (get them from Google Cloud Console):

```env
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

---

## Google Cloud Console Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (type: Web application)
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local dev)
   - `https://<production-domain>/api/auth/callback/google` (production)
4. Copy the Client ID and Client Secret into `.env.local`
