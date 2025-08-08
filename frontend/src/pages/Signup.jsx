import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: '',
        societe: '' 
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        const { name, email, password } = signupInfo;

      if (!name || !email || !password || !signupInfo.societe) {
        toast.error('Tous les champs (nom, email, mot de passe et société) sont requis.');
        return;
      }


        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupInfo),
            });

            // Vérifier le code de statut HTTP pour voir si la réponse est correcte
            const result = await response.json();

            if (!response.ok) {
                toast.error(result.message || 'Une erreur est survenue.');
                return;
            }

            // Vérifiez si le champ "success" existe et est true
            if (result.success) {
                toast.success('Inscription réussie! Redirection vers la page de connexion.');
                navigate('/login');  // Rediriger vers la page de connexion après l'inscription réussie
            } else {
                toast.error(result.message || 'Une erreur est survenue.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'inscription :', error);
            toast.error('Impossible de se connecter au serveur. Veuillez réessayer plus tard.');
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
          <span style={{ color: "var(--primary)" }}>Sign up</span> for an account
        </h1>

        <form onSubmit={handleSignup} className="space-y-6">

          {/* Name Input */}
          <div className="relative">
            <input
              id="name"
              type="text"
              name="name"
              value={signupInfo.name}
              onChange={handleChange}
              placeholder=" "
              className="peer w-full border rounded-md px-3 pt-6 pb-2.5 text-base placeholder-transparent focus:outline-none transition-colors duration-150"
              style={{
                borderColor: "var(--med-light-gray)",
                backgroundColor: "white",
              }}
            />
            <label
              htmlFor="name"
              className="absolute left-2 text-gray text-base transition-all duration-150 pointer-events-none bg-white px-1"
              style={{
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              Name
            </label>
          </div>
          {/* Societe Input */}
<div className="relative">
  <input
    id="societe"
    type="text"
    name="societe"
    value={signupInfo.societe}
    onChange={handleChange}
    placeholder=" "
    className="peer w-full border rounded-md px-3 pt-6 pb-2.5 text-base placeholder-transparent focus:outline-none transition-colors duration-150"
    style={{
      borderColor: "var(--med-light-gray)",
      backgroundColor: "white",
    }}
  />
  <label
    htmlFor="societe"
    className="absolute left-2 text-gray text-base transition-all duration-150 pointer-events-none bg-white px-1"
    style={{
      top: "50%",
      transform: "translateY(-50%)",
    }}
  >
    Société
  </label>
</div>


          {/* Email Input */}
          <div className="relative">
            <input
              id="email"
              type="email"
              name="email"
              value={signupInfo.email}
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
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              id="password"
              type="password"
              name="password"
              value={signupInfo.password}
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
          </div>

          <style>{`
            input.peer:focus + label,
            input.peer:not(:placeholder-shown) + label {
              top: 0 !important;
              left: 0.5rem !important;
              font-size: 12px;
              color: var(--primary);
            }
            input.peer:focus {
              border-color: var(--primary);
            }
          `}</style>

          <button
            type="submit"
            className="w-full text-white font-semibold text-lg rounded-md cursor-pointer py-2.5 transition duration-200 shadow-md hover:shadow-lg"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Signup
          </button>

          <p className="text-center text-base mt-2" style={{ color: "var(--gray)" }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "var(--accent)", fontWeight: "500" }}
              className="hover:underline"
            >
              Login
            </Link>
          </p>
        </form>

        <ToastContainer />
      </div>
    </div>
  );
}

export default Signup;
