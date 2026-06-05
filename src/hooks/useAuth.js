import { useCallback, useEffect, useState } from 'react'
import { defaultAccount } from '../constants/data'
import {
  clearSession,
  loadStoredAccounts,
  loadStoredSession,
  saveAccounts,
  saveSession,
} from '../utils/storage'

const defaultUserSettings = {
  ...defaultAccount,
  darkMode: true,
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useAuth() {
  const initialAccounts = loadStoredAccounts()
  const initialSession = loadStoredSession()
  const restoredAccount =
    initialSession?.type === 'member'
      ? initialAccounts.find(
          (account) => account.username?.toLowerCase() === initialSession.username?.toLowerCase(),
        ) ?? null
      : null

  const [accounts, setAccounts] = useState(initialAccounts)
  const [hasEntered, setHasEntered] = useState(Boolean(initialSession))
  const [sessionType, setSessionType] = useState(initialSession?.type || 'guest')
  const [userSettings, setUserSettings] = useState(
    restoredAccount
      ? {
          ...defaultUserSettings,
          ...restoredAccount,
          darkMode: true,
        }
      : defaultUserSettings,
  )
  const [authMode, setAuthMode] = useState('login')
  const [authFeedback, setAuthFeedback] = useState('')
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' })
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Persist accounts whenever they change
  useEffect(() => {
    saveAccounts(accounts)
  }, [accounts])

  useEffect(() => {
    if (!hasEntered) {
      clearSession()
      return
    }

    if (sessionType === 'member') {
      saveSession({
        type: 'member',
        username: userSettings.username,
      })
      return
    }

    saveSession({ type: 'guest' })
  }, [hasEntered, sessionType, userSettings.username])

  const enterApp = useCallback((type, account = null) => {
    setSessionType(type)
    setHasEntered(true)
    setAuthFeedback('')
    if (account) {
      setUserSettings((current) => ({
        ...current,
        firstName: account.firstName || current.firstName,
        lastName: account.lastName || current.lastName,
        username: account.username,
        email: account.email,
        password: account.password,
      }))
    }
  }, [])

  const logout = useCallback(() => {
    setHasEntered(false)
    setSessionType('guest')
    setLoginForm({ identifier: '', password: '' })
    setAuthFeedback('')
  }, [])

  const handleLogin = useCallback(() => {
    const identifier = loginForm.identifier.trim().toLowerCase()
    const { password } = loginForm

    const matched = accounts.find(
      (a) =>
        (a.username.toLowerCase() === identifier ||
          a.email.toLowerCase() === identifier) &&
        a.password === password,
    )

    if (!matched) {
      setAuthFeedback('Login failed. Enter a valid username/email and password.')
      return
    }

    enterApp('member', matched)
  }, [accounts, loginForm, enterApp])

  const handleSignup = useCallback(() => {
    const firstName = signupForm.firstName.trim()
    const lastName = signupForm.lastName.trim()
    const username = signupForm.username.trim()
    const email = signupForm.email.trim().toLowerCase()
    const { password, confirmPassword } = signupForm

    if (!firstName || !lastName || !username || !email || !password) {
      setAuthFeedback('Please complete every sign up field before continuing.')
      return
    }

    if (!emailPattern.test(email)) {
      setAuthFeedback('Please enter a valid email address.')
      return
    }

    if (password !== confirmPassword) {
      setAuthFeedback('Passwords do not match.')
      return
    }

    const alreadyExists = accounts.some(
      (a) =>
        a.username.toLowerCase() === username.toLowerCase() ||
        a.email.toLowerCase() === email,
    )

    if (alreadyExists) {
      setAuthFeedback('That username or email is already registered.')
      return
    }

    const created = { firstName, lastName, username, email, password }
    setAccounts((current) => [...current, created])
    setSignupForm({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
    enterApp('member', created)
  }, [accounts, signupForm, enterApp])

  const switchAuthMode = useCallback((mode) => {
    setAuthMode(mode)
    setAuthFeedback('')
  }, [])

  return {
    // state
    hasEntered,
    sessionType,
    profileKey: sessionType === 'member' ? `member:${userSettings.username.toLowerCase()}` : 'guest',
    userSettings,
    setUserSettings,
    authMode,
    authFeedback,
    loginForm,
    setLoginForm,
    signupForm,
    setSignupForm,
    // actions
    enterApp,
    logout,
    handleLogin,
    handleSignup,
    switchAuthMode,
  }
}
