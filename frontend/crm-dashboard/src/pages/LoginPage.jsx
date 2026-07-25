import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../api/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { login: setSession } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { token } = await login(email, password);
      const payload = JSON.parse(atob(token.split(".")[1]));
      setSession(token, { id: payload.sub, email: payload.email, role: payload.role });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Log in</h1>
        <p className="auth-subtitle">Access your assigned leads</p>
        {error && <p className="error-text">{error}</p>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { login } from "../api/auth";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const { login: setSession } = useAuth();
//   const navigate = useNavigate();

//   const { token } = await login(email, password);
//   const payload = JSON.parse(atob(token.split(".")[1]));
//   setSession(token, { id: payload.sub, email: payload.email, role: payload.role });


//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError(null);
//     setSubmitting(true);
//     try {
//       const { token } = await login(email, password);
//       setSession(token);
//       navigate("/");
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   return (
//     <div className="auth-page">
//       <form className="auth-card" onSubmit={handleSubmit}>
//         <h1>Log in</h1>
//         <p className="auth-subtitle">Access your assigned leads</p>
//         {error && <p className="error-text">{error}</p>}
//         <label>
//           Email
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </label>
//         <label>
//           Password
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </label>
//         <button type="submit" disabled={submitting}>
//           {submitting ? "Logging in…" : "Log in"}
//         </button>
//       </form>
//     </div>
//   );
// }
