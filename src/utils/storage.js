import { defaultAccount } from '../constants/data'

export const ACCOUNTS_STORAGE_KEY = 'gametask_accounts'
export const AUTH_SESSION_STORAGE_KEY = 'gametask_auth_session'
export const STORE_STATE_STORAGE_KEY = 'gametask_store_state'
export const TASK_STATE_STORAGE_KEY = 'gametask_task_state'

function safeParse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback
  } catch {
    return fallback
  }
}

export function loadStoredAccounts() {
  if (typeof window === 'undefined') return [defaultAccount]
  const parsed = safeParse(window.localStorage.getItem(ACCOUNTS_STORAGE_KEY), null)
  return Array.isArray(parsed) && parsed.length > 0 ? parsed : [defaultAccount]
}

export function saveAccounts(accounts) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
  } catch {
    // storage unavailable — fail silently
  }
}

export function loadStoredSession() {
  if (typeof window === 'undefined') return null
  return safeParse(window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY), null)
}

export function saveSession(session) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // storage unavailable — fail silently
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY)
  } catch {
    // storage unavailable — fail silently
  }
}

function loadScopedState(storageKey, profileKey, fallback) {
  if (typeof window === 'undefined') return fallback
  const bucket = safeParse(window.localStorage.getItem(storageKey), {})
  return bucket?.[profileKey] ?? fallback
}

function saveScopedState(storageKey, profileKey, state) {
  if (typeof window === 'undefined' || !profileKey) return
  try {
    const bucket = safeParse(window.localStorage.getItem(storageKey), {})
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        ...bucket,
        [profileKey]: state,
      }),
    )
  } catch {
    // storage unavailable — fail silently
  }
}

export function loadStoredStoreState(profileKey, fallback) {
  return loadScopedState(STORE_STATE_STORAGE_KEY, profileKey, fallback)
}

export function saveStoredStoreState(profileKey, state) {
  saveScopedState(STORE_STATE_STORAGE_KEY, profileKey, state)
}

export function loadStoredTaskState(profileKey, fallback) {
  return loadScopedState(TASK_STATE_STORAGE_KEY, profileKey, fallback)
}

export function saveStoredTaskState(profileKey, state) {
  saveScopedState(TASK_STATE_STORAGE_KEY, profileKey, state)
}
