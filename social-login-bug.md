# Bug: `POST /auth/social-login` ignores `loginAs` and returns wrong `accountType`

## Summary

When a user authenticates with Google and passes `loginAs: "vendor"`, the endpoint returns `accountType: "bidder"` (the account's existing type). The `loginAs` field is being ignored.

## Request

```
POST /auth/social-login
Content-Type: application/json

{
  "provider": "google",
  "idToken": "<google_id_token>",
  "loginAs": "vendor"
}
```

## Actual Response

```json
{
  "data": {
    "user": {
      "accountType": "bidder",
      ...
    },
    "accessToken": "...",
    ...
  }
}
```

## Expected Behavior

The response `accountType` should match the `loginAs` value passed in the request. If a user selects **vendor** on the login screen and authenticates with Google, they should be logged in as a vendor.

## Impact

On the frontend, the session role is determined by `d.user.accountType` from this response. If it returns `bidder` when `vendor` was requested, the user is silently logged into the wrong account type and redirected to the wrong dashboard.

## Suggested Fix

The endpoint should use `loginAs` to determine which account type to look up or create for the given Google identity. Possible behaviors:

- If a `vendor` account exists for this Google email → return it
- If no `vendor` account exists but a `bidder` one does → return an error (e.g. `"No vendor account found for this Google account"`)
- If neither exists → create a new account of the requested type

This allows one Google identity to potentially hold both a bidder and a vendor account, looked up by `loginAs`.
