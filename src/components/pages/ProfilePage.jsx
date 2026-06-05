import { useState } from 'react'
import { Avatar } from '../shared/Avatar'
import { ThemeArt } from '../shared/ThemeArt'
import '../../styles/pages/profile.css'

const INVENTORY_CATEGORIES = ['Themes', 'Frames']

export function ProfilePage({ settings = {}, onUpdateProfile, inventory, equippedItems, onEquipItem }) {
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [draftBio, setDraftBio] = useState(settings.bio || '')
  const groupedInventory = INVENTORY_CATEGORIES.map((category) => ({
    category,
    items: inventory.filter((item) => item.category === category),
  }))

  return (
    <section className="profile-page">
      <div className="left-column">
        <div className="profile-card">
          <h3>Software Engineering Student</h3>
          {!isEditingBio ? (
            <>
              <p>{settings.bio || 'Senior student at UCI as a SWE major with minor in statistics. Passionate about web development, UI/UX, and building full stack applications.'}</p>
              <button
                className="edit-profile-btn"
                onClick={() => {
                  setDraftBio(settings.bio || '')
                  setIsEditingBio(true)
                }}
              >
                Edit Bio
              </button>
            </>
          ) : (
            <div className="profile-description-editor">
              <textarea
                className="profile-description-input"
                value={draftBio}
                onChange={(e) => setDraftBio(e.target.value)}
                rows={4}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  className="primary-btn"
                  onClick={() => {
                    onUpdateProfile?.({ bio: draftBio })
                    setIsEditingBio(false)
                  }}
                >
                  Save
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => {
                    setDraftBio(settings.bio || '')
                    setIsEditingBio(false)
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="profile-card">
          <div className="inventory-header">
            <h3>Inventory</h3>
            {/* <div className="search-pill inventory-search">Search Items</div> */}
          </div>

          <div className="inventory-tag-list">
            {groupedInventory.map(({ category, items }) => (
              <div key={category} className="inventory-section">
                <div className="inventory-tag-row">
                  <h4>{category}</h4>
                  <span className="inventory-count">{items.length} owned</span>
                </div>

                <div className="inventory-grid">
                  {items.length > 0 ? (
                    items.map((item) => {
                      const isEquipped = equippedItems[item.category] === item.id
                      return (
                        <div
                          key={item.id}
                          className={isEquipped ? 'item-card is-equipped' : 'item-card'}
                        >
                          <ThemeArt art={item.art} compact />
                          <h4>{item.title}</h4>
                          <p>{isEquipped ? 'Equipped' : 'Owned'}</p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {isEquipped ? (
                              <>
                                <button className="equip-btn is-equipped" disabled>
                                  Active
                                </button>
                                <button
                                  className="equip-btn"
                                  onClick={() => onEquipItem(null, item.category)}
                                >
                                  Unequip
                                </button>
                              </>
                            ) : (
                              <button
                                className="equip-btn"
                                onClick={() => onEquipItem(item)}
                              >
                                Equip
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="empty-inventory-copy">
                      No {category.toLowerCase()} purchased yet.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* <div className="statistics-card">
        <h3>Statistics</h3>
        <p>
          Task Completed: <b>458</b>
        </p>
        <p>
          Achievement Unlocked: <b>12</b>
        </p>
        <p>
          Total Coins Earned: <b>12,400</b>
        </p>
        <p>
          Total Number of friends: <b>3</b>
        </p>
      </div> */}
    </section>
  )
}