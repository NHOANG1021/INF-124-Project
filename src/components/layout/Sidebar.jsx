import { navItems } from '../../constants/data'

export function Sidebar({ currentPage, onSelectPage, onLogout }) {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">GAMETASK</div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item}
              className={currentPage === item ? 'nav-item is-current' : 'nav-item'}
              onClick={() => onSelectPage(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <button
          className={currentPage === 'Settings' ? 'nav-item is-current' : 'nav-item'}
          onClick={() => onSelectPage('Settings')}
        >
          Settings
        </button>
        <button className="nav-item" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  )
}
