import { Link } from "react-router-dom";

function Cart({ cart, onUpdate, onRemove }) {
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  return (
    <section className="container py-5">
      <div className="d-flex justify-content-between align-items-end mb-5">
        <div>
          <p className="text-secondary text-uppercase small fw-semibold">
            Your selection
          </p>
          <h1 className="display-4 fw-bold">Shopping cart.</h1>
        </div>
        <p className="text-secondary">
          {cart.length} {cart.length === 1 ? "item" : "items"}
        </p>
      </div>
      {cart.length === 0 ? (
        <div className="py-4">
          <p className="text-secondary">
            Your cart is waiting for something special.
          </p>
          <Link to="/products" className="btn btn-light">
            Explore collection
          </Link>
        </div>
      ) : (
        <div className="row g-5">
          <div className="col-lg-8">
            {cart.map((item) => (
              <article
                className="d-flex flex-wrap align-items-center gap-3 border-top border-secondary py-3"
                key={item.id}
              >
                <img
                  src={item.image_url || "/product-placeholder.svg"}
                  alt={item.name}
                  className="rounded object-fit-cover"
                  width="80"
                  height="80"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/product-placeholder.svg";
                  }}
                />
                <div className="flex-grow-1">
                  <h2 className="h5 mb-1">{item.name}</h2>
                  <p className="text-secondary small mb-1">
                    {item.storage} · {item.color}
                  </p>
                  <strong>${Number(item.price).toLocaleString()}</strong>
                </div>
                <div className="btn-group">
                  <button
                    className="btn btn-outline-light"
                    type="button"
                    onClick={() => onUpdate(item.id, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="btn btn-outline-secondary disabled">
                    {item.quantity}
                  </span>
                  <button
                    className="btn btn-outline-light"
                    type="button"
                    onClick={() => onUpdate(item.id, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  className="btn btn-link text-danger"
                  type="button"
                  onClick={() => onRemove(item.id)}
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
          <aside className="col-lg-4">
            <div className="card bg-dark border-secondary">
              <div className="card-body">
                <p className="fw-semibold">Order summary</p>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary">Subtotal</span>
                  <strong>${total.toLocaleString()}</strong>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <span className="text-secondary">Delivery</span>
                  <span>Free</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span>Total</span>
                  <strong>${total.toLocaleString()}</strong>
                </div>
                <Link to="/checkout" className="btn btn-light w-100">
                  Continue to checkout
                </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

export default Cart;
