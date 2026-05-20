import { defaultAccount } from '../constants/data'

export const ACCOUNTS_STORAGE_KEY = 'gametask_accounts'

export function loadStoredAccounts() {
  if (typeof window === 'undefined') return [defaultAccount]
  try {
    const stored = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    if (!stored) return [defaultAccount]
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [defaultAccount]
  } catch {
    return [defaultAccount]
  }
}

export function saveAccounts(accounts) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts))
  } catch {
    // storage unavailable — fail silently
  }
}
