import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api.js";
import ProductForm from "./ProductForm.jsx";
function EditProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  useEffect(() => {
    API.get(`/products/${id}`).then(({ data }) => setProduct(data.product));
  }, [id]);
  return (
    <section>
      <p className="text-secondary text-uppercase small fw-semibold mb-1">
        Catalogue
      </p>
      <h1 className="mb-4">Edit product</h1>
      {product && <ProductForm initial={product} />}
    </section>
  );
}
export default EditProduct;
