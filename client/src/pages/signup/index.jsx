import { useState } from "react";
import { Link } from "react-router-dom";
import { signup } from "../../api/auth";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { showLoader, hideLoader } from "../../redux/loaderSlice";

function Signup() {
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }

    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }

    if (!/\d/.test(password)) {
      return "Password must contain at least one number";
    }

    if (!/[@$!%*?&.#]/.test(password)) {
      return "Password must contain at least one special character";
    }

    return null; 
  };
  

  const validateSignup = () => {
    if (
      !user.firstname.trim() ||
      !user.lastname.trim() ||
      !user.email.trim() ||
      !user.password.trim()
    ) {
      toast.error("Please fill in all fields.");
      return false;
    }

    if (user.firstname.trim().length < 2 || user.lastname.trim().length < 2) {
      toast.error("First and last name must be at least 2 characters.");
      return false;
    }

    if (!validateEmail(user.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    const passwordError = validatePassword(user.password);

    if (passwordError) {
      toast.error(passwordError);
      return false;
    }

    return true;
  };

  async function handleSubmit(e) {
    let response = null;
    e.preventDefault();

    if (!validateSignup()) {
      return;
    }

    try {
      dispatch(showLoader());
      response = await signup(user);
      dispatch(hideLoader());

      if (response.success) {
        toast.success(response.message);

        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      dispatch(hideLoader());
      toast.error(error.message || "Unable to sign up. Please try again.");
    }
  }

  return (
    <div className="container">
      <div className="container-back-img"></div>
      <div className="container-back-color"></div>
      <div className="card">
        <div className="card_title">
          <h1>Create Account</h1>
        </div>
        <div className="form">
          <form onSubmit={handleSubmit}>
            <div className="column">
              <input
                type="text"
                placeholder="First Name"
                value={user.firstname}
                onChange={(e) =>
                  setUser({ ...user, firstname: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Last Name"
                value={user.lastname}
                onChange={(e) => setUser({ ...user, lastname: e.target.value })}
              />
            </div>
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
            <button>Sign Up</button>
          </form>
        </div>
        <div className="card_terms">
          <span>
            Already have an account?
            <Link to="/login">Login Here</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Signup;
