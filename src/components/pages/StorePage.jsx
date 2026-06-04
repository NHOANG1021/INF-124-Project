import { ThemeArt } from '../shared/ThemeArt'
import '../../styles/pages/store.css'

export function StorePage({
  filter,
  onFilterChange,
  items,
  onAddToCart,
  cart,
  total,
  onRemoveFromCart,
  ownedItemIds,
  cartItemIds,
  onCheckout,
  storeFeedback,
  storeLoading,
  storeError,
}) {
  return (
    <section>
      <div className="section-header split">
        <div>
          <p className="section-kicker">Rewards</p>
          <h2>Store</h2>
        </div>
        <div className="search-pill">Search Store</div>
      </div>

      <div className="chip-row with-gap">
        {['All', 'Themes', 'Frames', 'Powerups'].map((chip) => (
          <button
            key={chip}
            className={filter === chip ? 'chip is-active' : 'chip'}
            onClick={() => onFilterChange(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {storeLoading && <p className="store-feedback">Loading store items...</p>}
      {storeError && <p className="store-feedback">{storeError}</p>}
      {storeFeedback && <p className="store-feedback">{storeFeedback}</p>}

      <div className="cart-layout">
        <div className="store-grid">
          {!storeLoading && !storeError && items.length === 0 && (
            <p className="empty-cart-copy">No store items found.</p>
          )}

          {!storeLoading &&
            !storeError &&
            items.map((item) => (
              <article key={item.id} className="store-card">
                <ThemeArt art={item.art} />
                <div className="store-body">
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                  <div className="store-footer">
                    <div className="price-tag">🪙 {item.price.toLocaleString()}</div>
                    <button
                      className="primary-btn"
                      disabled={ownedItemIds.has(item.id) || cartItemIds.has(item.id)}
                      onClick={() => onAddToCart(item)}
                    >
                      {ownedItemIds.has(item.id)
                        ? 'Owned'
                        : cartItemIds.has(item.id)
                          ? 'In Cart'
                          : 'Add'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
        </div>

        <StoreCheckout
          cart={cart}
          total={total}
          onRemove={onRemoveFromCart}
          onCheckout={onCheckout}
        />
      </div>
    </section>
  )
}

function StoreCheckout({ cart, total, onRemove, onCheckout }) {
  return (
    <aside className="summary-card">
      <h3>Order Summary</h3>
      <div className="summary-lines">
        {cart.map((item) => (
          <div key={item.id} className="summary-line summary-line-card">
            <span>{item.title}</span>
            <div className="summary-actions">
              <strong>🪙 {item.price}</strong>
              <button className="summary-remove" onClick={() => onRemove(item.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
        {cart.length === 0 && (
          <p className="empty-cart-copy">Add items here, then check out.</p>
        )}
      </div>
      <div className="summary-total">
        <span>Total</span>
        <strong>🪙 {total}</strong>
      </div>
      <button className="primary-btn full-width" onClick={onCheckout}>
        Checkout
      </button>
    </aside>
  )
}
