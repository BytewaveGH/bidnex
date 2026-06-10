import type { Session } from "next-auth"

// undefined = not yet loaded; null = loaded but no session; Session = loaded with session
let sessionCache: Session | null | undefined = undefined
let sessionResolve: ((s: Session | null) => void) | null = null
let sessionPromise: Promise<Session | null> | null = null

export function setSession(session: Session | null) {
  sessionCache = session
  if (sessionResolve) {
    sessionResolve(session)
    sessionResolve = null
    sessionPromise = null
  }
}

export function getSession(): Promise<Session | null> {
  if (sessionCache !== undefined) {
    return Promise.resolve(sessionCache)
  }
  if (!sessionPromise) {
    sessionPromise = new Promise((resolve) => {
      sessionResolve = resolve
    })
  }
  return sessionPromise
}

export function clearSession() {
  sessionCache = undefined
  sessionResolve = null
  sessionPromise = null
}

export const waitForSession = getSession
