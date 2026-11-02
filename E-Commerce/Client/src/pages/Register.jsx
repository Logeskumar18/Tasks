import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api.js";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });
    setIsSubmitting(true);

    try {
      const response = await API.post("/auth/register", formData);
      setMessage({ type: "success", text: response.data.message });
      setTimeout(() => navigate("/login"), 900);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Registration failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card bg-dark border-secondary">
            <div className="card-body p-4 p-md-5">
              <p className="text-white text-uppercase small fw-semibold">
                New account
              </p>
              <h1 className="h2 fw-bold text-white">
                Make room for what you love.
              </h1>
              <p className="text-white">
                Create an account to keep your favorites close.
              </p>
              {message.text && (
                <div
                  className={`alert alert-${message.type === "error" ? "danger" : "success"}`}
                  role="alert"
                >
                  {message.text}
                </div>
              )}
              <form onSubmit={handleSubmit} className="text-white vstack gap-3">
                <label className="form-label mb-0" htmlFor="register-name">
                  Full name
                </label>
                <input
                  className="form-control bg-black text-light border-secondary"
                  id="register-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
                <label className="form-label mb-0" htmlFor="register-email">
                  Email address
                </label>
                <input
                  className="form-control bg-black text-light border-secondary"
                  id="register-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
                <label className="form-label mb-0" htmlFor="register-password">
                  Password
                </label>
                <input
                  className="form-control bg-black text-light border-secondary"
                  id="register-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength="8"
                  required
                />
                <button
                  className="btn btn-light"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : "Create account"}
                </button>
              </form>
              <p className="text-white mt-4 mb-0">
                Already have an account?{" "}
                <Link className="text-white" to="/login">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;
