import { useCallback, useState } from 'react'
import { defaultAccount } from '../constants/data'
import { loginAccount, signupAccount, validateAccount } from '../utils/storage'

const defaultUserSettings = {
  ...defaultAccount,
  darkMode: true,
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useAuth() {
  const [hasEntered, setHasEntered] = useState(false)
  const [sessionType, setSessionType] = useState('guest')
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
  const [userSettings, setUserSettings] = useState(defaultUserSettings)
  const [currentAccount, setCurrentAccount] = useState(null)

  const enterApp = useCallback((type, account = null) => {
    setSessionType(type)
    setHasEntered(true)
    setAuthFeedback('')
    setCurrentAccount(account)

    if (account) {
      setUserSettings((current) => ({
        ...current,
        firstName: account.firstName || account.FirstName || current.firstName,
        lastName: account.lastName || account.LastName || current.lastName,
        username: account.username || account.Username || current.username,
        email: account.email || account.Email || current.email,
        password: '',
      }))
    }
  }, [])

  const logout = useCallback(() => {
    setHasEntered(false)
    setSessionType('guest')
    setCurrentAccount(null)
    setLoginForm({ identifier: '', password: '' })
    setAuthFeedback('')
  }, [])

  const handleLogin = useCallback(async () => {
    const identifier = loginForm.identifier.trim().toLowerCase()
    const { password } = loginForm

    if (!identifier || !password) {
      setAuthFeedback('Enter your username/email and password.')
      return
    }

    const account = await loginAccount(identifier, password)

    if (!account) {
      setAuthFeedback('Login failed. Enter a valid username/email and password.')
      return
    }

    enterApp('member', account)
  }, [loginForm, enterApp])

  const handleSignup = useCallback(async () => {
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

    const alreadyExists = await validateAccount(username, email)

    if (alreadyExists) {
      setAuthFeedback('That username or email is already registered.')
      return
    }

    const result = await signupAccount({
      firstName,
      lastName,
      username,
      email,
      password,
    })

    if (!result.ok) {
      setAuthFeedback(result.data.error || 'Account creation failed.')
      return
    }

    setSignupForm({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    })

    enterApp('member', result.data.user)
  }, [signupForm, enterApp])

  const switchAuthMode = useCallback((mode) => {
    setAuthMode(mode)
    setAuthFeedback('')
  }, [])

  const updateCurrentAccount = useCallback((account) => {
    setCurrentAccount(account)
  }, [])

  const profileKey =
    sessionType === 'member'
      ? `member:${currentAccount?.id ?? userSettings.username.toLowerCase()}`
      : 'guest'

  return {
    hasEntered,
    sessionType,
    profileKey,
    userSettings,
    setUserSettings,
    authMode,
    authFeedback,
    loginForm,
    setLoginForm,
    signupForm,
    setSignupForm,
    currentAccount,
    enterApp,
    logout,
    handleLogin,
    handleSignup,
    switchAuthMode,
    updateCurrentAccount,
  }
}
