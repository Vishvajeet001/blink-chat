import { useState } from "react";
import { Link } from "react-router-dom";
import { login } from "../../api/auth";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../../redux/loaderSlice";

function Login() {
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateLogin = () => {
    if (!user.email.trim() || !user.password.trim()) {
      toast.error("Please enter both email and password.");
      return false;
    }

    if (!validateEmail(user.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  async function handleSubmit(e) {
    let response = null;
    e.preventDefault();

    if (!validateLogin()) {
      return;
    }

    try {
      dispatch(showLoader());
      response = await login(user);
      dispatch(hideLoader());

      if (response.success) {
        localStorage.setItem("token", response.token);
        toast.success(response.message);
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }else {
        toast.error(response.message);
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.message || "Unable to login. Please try again.");
    }
  }

  return (
    <div className="container">
      <div className="container-back-img"></div>
      <div className="container-back-color"></div>
      <div className="card">
        <div className="card_title">
          <h1>Login Here</h1>
        </div>
        <div className="form">
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
            <button>Login</button>
          </form>
        </div>
        <div className="card_terms">
          <span>
            Don't have an account yet?
            <Link to="/signup">Signup Here</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
