import { useEffect, useState } from 'react'
import { Avatar } from '../shared/Avatar'
import { ThemeArt } from '../shared/ThemeArt'
import '../../styles/pages/profile.css'

const INVENTORY_CATEGORIES = ['Themes', 'Frames']

const defaultDescription =
  'Senior student at UCI as a SWE major with minor in statistics. Passionate about web development, UI/UX, and building full stack applications.'

export function ProfilePage({
  settings,
  onUpdateProfile,
  inventory,
  equippedItems,
  onEquipItem,
}) {
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [descriptionDraft, setDescriptionDraft] = useState(
    settings.description || defaultDescription,
  )

  useEffect(() => {
    setDescriptionDraft(settings.description || defaultDescription)
  }, [settings.description])

  const handleSaveDescription = () => {
    onUpdateProfile({ description: descriptionDraft.trim() || defaultDescription })
    setIsEditingDescription(false)
  }

  const handleCancelDescription = () => {
    setDescriptionDraft(settings.description || defaultDescription)
    setIsEditingDescription(false)
  }

  const groupedInventory = INVENTORY_CATEGORIES.map((category) => ({
    category,
    items: inventory.filter((item) => item.category === category),
  }))

  const description = settings.description || defaultDescription

  return (
    <section className="profile-page">
      <div className="left-column">
        <div className="profile-card">
          <h3>Software Engineering Student</h3>
          {isEditingDescription ? (
            <div className="profile-description-editor">
              <textarea
                className="profile-description-input"
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                rows={4}
              />
              <div className="button-group-row">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleSaveDescription}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleCancelDescription}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p>{description}</p>
              <button
                type="button"
                className="edit-profile-btn"
                onClick={() => setIsEditingDescription(true)}
              >
                Edit Profile
              </button>
            </>
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

      <div className="statistics-card">
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
      </div>
    </section>
  )
}
