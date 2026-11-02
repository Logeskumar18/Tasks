import { useEffect, useState } from "react";
import API from "../../services/api.js";
function Orders() {
  const [orders, setOrders] = useState([]);
  const load = () =>
    API.get("/admin/orders").then(({ data }) => setOrders(data.orders));
  useEffect(() => {
    load();
  }, []);
  const update = async (id, status) => {
    await API.put(`/admin/orders/${id}/status`, { status });
    load();
  };
  return (
    <section>
      <p className="text-secondary text-uppercase small fw-semibold mb-1">
        Fulfilment
      </p>
      <h1 className="mb-4">Orders</h1>
      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>
                  {o.customer_name}
                  <br />
                  <small className="text-secondary">{o.customer_email}</small>
                </td>
                <td>${Number(o.total).toLocaleString()}</td>
                <td>
                  <select
                    className="form-select form-select-sm bg-dark text-light border-secondary"
                    value={o.status}
                    onChange={(e) => update(o.id, e.target.value)}
                  >
                    {[
                      "pending",
                      "processing",
                      "shipped",
                      "delivered",
                      "cancelled",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export default Orders;
