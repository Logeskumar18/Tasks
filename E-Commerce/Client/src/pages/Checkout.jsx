import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api.js";

function Checkout({ cart, onOrder }) {
  const [complete, setComplete] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  const submit = async (event) => {
    event.preventDefault();
    try {
      await API.post("/orders", {
        total,
        items: cart,
        shippingName: form.name,
        shippingAddress: form.address,
        shippingCity: form.city,
        shippingPostalCode: form.postalCode,
      });
      onOrder({ ...form, total, items: cart });
      setComplete(true);
    } catch {
      setComplete(false);
    }
  };
  if (complete)
    return (
      <section className="container py-5">
        <p className="text-secondary text-uppercase small fw-semibold">
          Order confirmed
        </p>
        <h1 className="display-5 fw-bold">Thank you for your order.</h1>
        <p className="text-secondary">
          Your order has been placed successfully.
        </p>
        <Link className="btn btn-light" to="/orders">
          View orders
        </Link>
      </section>
    );

  return (
    <section className="container py-5">
      <p className="text-secondary text-uppercase small fw-semibold">
        Almost yours
      </p>
      <h1 className="display-4 fw-bold mb-4">Checkout.</h1>
      <div className="row">
        <form className="col-12 col-lg-7 vstack gap-3" onSubmit={submit}>
          <label className="form-label">
            Full name
            <input
              className="form-control bg-dark text-light border-secondary mt-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label className="form-label">
            Address
            <input
              className="form-control bg-dark text-light border-secondary mt-2"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
            />
          </label>
          <div className="row g-3">
            <label className="form-label col-md-6">
              City
              <input
                className="form-control bg-dark text-light border-secondary mt-2"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </label>
            <label className="form-label col-md-6">
              Postal code
              <input
                className="form-control bg-dark text-light border-secondary mt-2"
                value={form.postalCode}
                onChange={(e) =>
                  setForm({ ...form, postalCode: e.target.value })
                }
                required
              />
            </label>
          </div>
          <button
            className="btn btn-light"
            type="submit"
            disabled={!cart.length}
          >
            Place order · ${total.toLocaleString()}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Checkout;
