import { AuthCard } from './AuthCard'

export function EntryScreen({
  authMode,
  onSwitchMode,
  onEnterApp,
  authFeedback,
  loginForm,
  onLoginFormChange,
  signupForm,
  onSignupFormChange,
  onLogin,
  onSignup,
}) {
  return (
    <section className="entry-screen-shell">
      <div className="entry-screen-card">
        <div className="auth-toggle large">
          <button
            className={authMode === 'login' ? 'is-active' : ''}
            onClick={() => onSwitchMode('login')}
          >
            Log In
          </button>
          <button
            className={authMode === 'signup' ? 'is-active' : ''}
            onClick={() => onSwitchMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <AuthCard
          mode={authMode}
          onSwitchMode={onSwitchMode}
          onEnterApp={onEnterApp}
          authFeedback={authFeedback}
          loginForm={loginForm}
          onLoginFormChange={onLoginFormChange}
          signupForm={signupForm}
          onSignupFormChange={onSignupFormChange}
          onLogin={onLogin}
          onSignup={onSignup}
        />
      </div>
    </section>
  )
}
