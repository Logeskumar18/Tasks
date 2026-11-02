import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api.js";

function Products() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const load = () =>
    API.get("/admin/products").then(({ data }) => setProducts(data.products));
  useEffect(() => {
    load();
  }, []);
  const remove = async (id) => {
    if (window.confirm("Delete this product?")) {
      await API.delete(`/admin/products/${id}`);
      load();
    }
  };
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <p className="text-secondary text-uppercase small fw-semibold mb-1">
            Catalogue
          </p>
          <h1>Products</h1>
        </div>
        <Link className="btn btn-light" to="/admin/products/new">
          Add product
        </Link>
      </div>
      <input
        className="form-control bg-dark text-light border-secondary mb-4"
        placeholder="Search products"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="table-responsive">
        <table className="table table-dark table-hover align-middle">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>${Number(p.price).toLocaleString()}</td>
                <td>{p.stock}</td>
                <td>
                  <Link
                    to={`/admin/products/${p.id}/edit`}
                    className="btn btn-outline-light btn-sm me-2"
                  >
                    Edit
                  </Link>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => remove(p.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export default Products;
