import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../services/api.js";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
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
      const response = await API.post("/auth/login", formData);
      localStorage.setItem("IPlantToken", response.data.token);
      localStorage.setItem("IPlantUser", JSON.stringify(response.data.user));
      onLogin(response.data.user);
      setMessage({ type: "success", text: response.data.message });
      navigate(
        response.data.user.role === "admin"
          ? "/admin"
          : location.state?.from || "/",
      );
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Login failed.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="text-white container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card text-white bg-dark border-secondary">
            <div className="card-body p-4 p-md-5">
              <p className="text-white text-uppercase small fw-semibold">
                Welcome back
              </p>
              <h1 className="h2 fw-bold">Pick up where you left off.</h1>
              <p className="text-white">Sign in to revisit your saved finds.</p>
              {message.text && (
                <div
                  className={`alert alert-${message.type === "error" ? "danger" : "success"}`}
                  role="alert"
                >
                  {message.text}
                </div>
              )}
              <form onSubmit={handleSubmit} className="vstack gap-3">
                <label className="form-label mb-0" htmlFor="login-email">
                  Email address
                </label>
                <input
                  className="form-control bg-black text-light border-secondary"
                  id="login-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
                <label className="form-label mb-0" htmlFor="login-password">
                  Password
                </label>
                <input
                  className="form-control bg-black text-light border-secondary"
                  id="login-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
                <button
                  className="btn btn-light"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </form>
              <p className="text-white mt-4 mb-0">
                New here?{" "}
                <Link className="text-white" to="/register">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;
