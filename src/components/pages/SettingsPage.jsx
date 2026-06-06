import { useState } from 'react'

export function SettingsPage({ settings, onUpdateSettings, onLogout }) {
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (field, value) => {
    onUpdateSettings({ ...settings, [field]: value })
  }

  return (
    <section className="dashboard-layout">
      <div className="section-header">
        <p className="section-kicker">Preferences</p>
        <h2>Account Settings</h2>
      </div>

      <div className="planner-grid">
        <div className="planner-panel">
          <div className="panel-heading">
            <div>
              <h3>Personal Info</h3>
              <p>Update your display details and account credentials.</p>
            </div>
          </div>

          <div className="task-form">
            <div className="form-row-split">
              <label>
                First Name
                <input
                  type="text"
                  value={settings.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </label>
              <label>
                Last Name
                <input
                  type="text"
                  value={settings.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </label>
            </div>

            <label>
              Email Address
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </label>

            <label>
              Username
              <input
                type="text"
                value={settings.username}
                onChange={(e) => handleChange('username', e.target.value)}
              />
            </label>

            <label>
              Password
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={settings.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="password-input-field"
                />
                <button
                  type="button"
                  className="password-toggle-btn-inline"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <div className="button-group-row">
              <button className="primary-btn">Save Changes</button>
              <button className="secondary-btn">Cancel</button>
            </div>
          </div>
        </div>

        <aside className="planner-panel planner-side">
          {/* Panel-heading and avatar sections have been completely removed */}

          <div className="danger-zone-v2">
            <h4>Danger Zone</h4>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button className="primary-btn full-width danger-bg" onClick={onLogout}>
              Delete Account
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}