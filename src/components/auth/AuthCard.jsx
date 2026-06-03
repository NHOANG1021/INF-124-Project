export function AuthCard({
  mode,
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
  const isLogin = mode === 'login'

  return (
    <div className="auth-card auth-card-large">
        <form className="auth-form">
        {authFeedback && <p className="auth-feedback">{authFeedback}</p>}

        {isLogin ? (
          <LoginFields
            form={loginForm}
            onChange={onLoginFormChange}
            onLogin={onLogin}
            onEnterApp={onEnterApp}
            onSwitchMode={onSwitchMode}
          />
        ) : (
          <SignupFields
            form={signupForm}
            onChange={onSignupFormChange}
            onSignup={onSignup}
            onEnterApp={onEnterApp}
            onSwitchMode={onSwitchMode}
          />
        )}
      </form>
    </div>
  )
}

function LoginFields({ form, onChange, onLogin, onEnterApp, onSwitchMode }) {
  return (
    <>
      <label>
        Username or Email
        <input
          type="text"
          placeholder="case-sensitive"
          value={form.identifier}
          onChange={(e) => onChange((c) => ({ ...c, identifier: e.target.value }))}
        />
      </label>
      <label>
        <div className="label-row">
          <span>Password</span>
          <button type="button" className="linkish">
            Forgot Password?
          </button>
        </div>
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => onChange((c) => ({ ...c, password: e.target.value }))}
        />
      </label>
      <button type="button" className="primary-btn full-width" onClick={onLogin}>
        Log In
      </button>
      <button
        type="button"
        className="secondary-btn full-width"
        onClick={() => onEnterApp('guest')}
      >
        Continue as Guest
      </button>
      <p className="form-foot">
        Don&apos;t have a GAMETASK account?{' '}
        <button type="button" className="text-link" onClick={() => onSwitchMode('signup')}>
          Sign Up
        </button>
      </p>
    </>
  )
}

function SignupFields({ form, onChange, onSignup, onEnterApp, onSwitchMode }) {
  const field = (key) => ({
    value: form[key],
    onChange: (e) => onChange((c) => ({ ...c, [key]: e.target.value })),
  })

  return (
    <>
      <label>
        First Name
        <input type="text" placeholder="e.g. Peter" {...field('firstName')} />
      </label>
      <label>
        Last Name
        <input type="text" placeholder="e.g. Anteater" {...field('lastName')} />
      </label>
      <label>
        Username
        <input type="text" placeholder="Choose a username" {...field('username')} />
      </label>
      <label>
        Email
        <input type="email" placeholder="e.g. peteranteater@example.com" {...field('email')} />
      </label>
      <label>
        Password
        <input type="password" placeholder="e.g. *************" {...field('password')} />
      </label>
      <label>
        Confirm Password
        <input type="password" placeholder="Make sure it matches." {...field('confirmPassword')} />
      </label>
      <button type="button" className="primary-btn full-width" onClick={onSignup}>
        Continue
      </button>
      <button
        type="button"
        className="secondary-btn full-width"
        onClick={() => onEnterApp('guest')}
      >
        Continue as Guest
      </button>
      <p className="form-foot">
        Already have a GAMETASK account?{' '}
        <button type="button" className="text-link" onClick={() => onSwitchMode('login')}>
          Log In
        </button>
      </p>
    </>
  )
}
