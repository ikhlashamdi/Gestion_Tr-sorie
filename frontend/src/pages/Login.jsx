import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils/toastUtils';

function Login({ setIsAuthenticated }) {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo(prevInfo => ({ ...prevInfo, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;

    if (!email || !password) {
      return handleError('Email and password are required');
    }

    try {
      const url = `http://localhost:5000/api/auth/login`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginInfo)
      });
      const result = await response.json();
      const { message, token, user, error } = result;

      if (token) {
        localStorage.setItem('token', token);
        if (user) {
          // Stockage CORRECT de l'utilisateur
          localStorage.setItem('user', JSON.stringify(user));
        }
        if (setIsAuthenticated) {
          setIsAuthenticated(true);
        }
        handleSuccess('Login successful!');
        navigate('/home');
      } else {
        const details = error?.details?.[0]?.message || message || 'Login failed. Please try again.';
        handleError(details);
      }
    } catch (err) {
      handleError(err.message || 'An unexpected error occurred during login.');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--light-gray)" }}
    >
      <div
        className="bg-white p-8 md:p-12 rounded-lg w-full max-w-md shadow-xl"
        style={{ color: "var(--dark-gray)" }}
      >
        <h1 className="text-3xl font-bold mb-8 text-center">
          <span style={{ color: "var(--primary)" }}>Log in</span> to your
          account
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <input
              id="email"
              type="email"
              name="email"
              value={loginInfo.email}
              onChange={handleChange}
              placeholder=" "
              className="peer w-full border rounded-md px-3 pt-6 pb-2.5 text-base placeholder-transparent focus:outline-none transition-colors duration-150"
              style={{
                borderColor: "var(--med-light-gray)",
                backgroundColor: "white",
              }}
            />
            <label
              htmlFor="email"
              className="absolute left-2 text-gray text-base transition-all duration-150 pointer-events-none bg-white px-1"
              style={{
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              Email
            </label>
            <style>{`
              input:focus + label,
              input:not(:placeholder-shown) + label {
                top: 0 !important;
                left: 0.5rem !important;
                font-size: 12px;
                color: var(--primary);
              }
              input:focus {
                border-color: var(--primary);
              }
            `}</style>
          </div>

          <div className="relative">
            <input
              id="password"
              type="password"
              name="password"
              value={loginInfo.password}
              onChange={handleChange}
              placeholder=" "
              className="peer w-full border rounded-md px-3 pt-6 pb-2.5 text-base placeholder-transparent focus:outline-none transition-colors duration-150"
              style={{
                borderColor: "var(--med-light-gray)",
                backgroundColor: "white",
              }}
            />
            <label
              htmlFor="password"
              className="absolute left-2 text-gray text-base transition-all duration-150 pointer-events-none bg-white px-1"
              style={{
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              Password
            </label>
            <style>{`
              input:focus + label,
              input:not(:placeholder-shown) + label {
                top: 0 !important;
                left: 0.5rem !important;
                font-size: 12px;
                color: var(--primary);
              }
              input:focus {
                border-color: var(--primary);
              }
            `}</style>
          </div>

          <button
            type="submit"
            className="w-full text-white font-semibold text-lg rounded-md cursor-pointer py-2.5 transition duration-200 shadow-md hover:shadow-lg"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Login
          </button>

          <p className="text-center text-base mt-2" style={{ color: "var(--gray)" }}>
            Don’t have an account?{" "}
            <Link
              to="/signup"
              style={{ color: "var(--accent)", fontWeight: "500" }}
              className="hover:underline"
            >
              Signup
            </Link>
          </p>
        </form>

        <ToastContainer />
      </div>
    </div>
  );
}

export default Login;
