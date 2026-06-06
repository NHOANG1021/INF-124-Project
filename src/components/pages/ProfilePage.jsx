import { useState } from 'react'
import { Avatar } from '../shared/Avatar'
import { ThemeArt } from '../shared/ThemeArt'
import '../../styles/pages/profile.css'

// Removed 'Powerups' from the global inventory category configurations
const INVENTORY_CATEGORIES = ['Themes', 'Frames']

export function ProfilePage({ inventory, equippedItems, onEquipItem, initialBio, onSaveBio }) {
  const [isEditing, setIsEditing] = useState(false)
  const [bioText, setBioText] = useState(
    initialBio || "Senior student at UCI as a SWE major with minor in statistics. Passionate about web development, UI/UX, and building full stack applications."
  )

  const groupedInventory = INVENTORY_CATEGORIES.map((category) => ({
    category,
    items: inventory.filter((item) => item.category === category),
  }))

  const handleSave = () => {
    setIsEditing(false)
    if (onSaveBio) {
      onSaveBio(bioText)
    }
  }

  return (
    <section className="profile-page">
      <div className="left-column">
        <div className="profile-card">
          <h3>Software Engineering Student</h3>
          
          {isEditing ? (
            <div className="edit-bio-container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
              <textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ccc',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="equip-btn" onClick={handleSave}>Save</button>
                <button className="equip-btn" style={{ backgroundColor: '#ccc', color: '#333' }} onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p>{bioText}</p>
              <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>Edit Bio</button>
            </>
          )}
        </div>

        <div className="profile-card">
          <div className="inventory-header">
            <h3>Inventory</h3>
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
    </section>
  )
}