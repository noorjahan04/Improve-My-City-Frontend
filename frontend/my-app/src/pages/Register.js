import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, verifyOtp } from "../services/auth";
import { FaUser, FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";

export default function Register() {
  const [step, setStep] = useState(1); // 1 = register, 2 = OTP
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [hoverBtn, setHoverBtn] = useState(false);
  const [hoverHome, setHoverHome] = useState(false);

  const navigate = useNavigate();

  // Step 1: Register user
  const handleRegister = async () => {
    if (!name || !email || !password) return alert("All fields are required");

    try {
      await register({ name, email, password });
      alert("OTP sent to your email. Please verify to complete registration.");
      setStep(2);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Registration failed");
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) return alert("Enter OTP");

    try {
      await verifyOtp({ email, otp });
      alert("Email verified! Please login now.");
      navigate("/login"); // go to login page
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "OTP verification failed");
    }
  };

  return (
    <div style={pageWrapper}>
      <div style={overlayStyle}></div>

      <Link
        to="/"
        style={{
          ...homeBtnStyle,
          transform: hoverHome ? "scale(1.05)" : "scale(1)",
          backgroundColor: hoverHome ? "#f5f5f5" : "#fff",
        }}
        onMouseEnter={() => setHoverHome(true)}
        onMouseLeave={() => setHoverHome(false)}
      >
        <FaArrowLeft size={20} /> Home
      </Link>

      <div style={containerStyle}>
        {step === 1 ? (
          <>
            <h2 style={titleStyle}>Register</h2>
            <div style={inputWrapper}>
              <FaUser style={iconStyle} />
              <input
                style={inputStyle}
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div style={inputWrapper}>
              <FaEnvelope style={iconStyle} />
              <input
                style={inputStyle}
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div style={inputWrapper}>
              <FaLock style={iconStyle} />
              <input
                style={inputStyle}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              style={{
                ...buttonStyle,
                transform: hoverBtn ? "scale(1.05)" : "scale(1)",
                backgroundColor: hoverBtn ? "#45a049" : "#4CAF50",
              }}
              onMouseEnter={() => setHoverBtn(true)}
              onMouseLeave={() => setHoverBtn(false)}
              onClick={handleRegister}
            >
              Register
            </button>
          </>
        ) : (
          <>
            <h2 style={titleStyle}>Verify OTP</h2>
            <div style={inputWrapper}>
              <input
                style={inputStyle}
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button
              style={{
                ...buttonStyle,
                transform: hoverBtn ? "scale(1.05)" : "scale(1)",
                backgroundColor: hoverBtn ? "#45a049" : "#4CAF50",
              }}
              onClick={handleVerifyOtp}
              onMouseEnter={() => setHoverBtn(true)}
              onMouseLeave={() => setHoverBtn(false)}
            >
              Verify OTP
            </button>
          </>
        )}

        <p style={{ marginTop: "1.5rem", color: "#fff", fontWeight: "bold" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: "#4CAF50", fontWeight: "bold", textDecoration: "none" }}
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

// ---------------------- STYLES ----------------------
const pageWrapper = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage:
    "url('https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=1470&q=80')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
};

const overlayStyle = {
  position: "absolute",
  top: 0, left: 0, width: "100%", height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(5px)",
};

const homeBtnStyle = {
  position: "absolute", top: "20px", left: "20px",
  display: "flex", alignItems: "center", gap: "6px",
  padding: "8px 12px", borderRadius: "8px", backgroundColor: "#fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.2)", fontWeight: "bold", color: "#333",
  textDecoration: "none", transition: "all 0.3s ease", zIndex: 3,
};

const containerStyle = {
  maxWidth: "400px", padding: "2rem", borderRadius: "12px",
  boxShadow: "0px 8px 20px rgba(0,0,0,0.25)", textAlign: "center",
  backgroundColor: "rgba(255,255,255,0.1)", zIndex: 2,
};

const titleStyle = { marginBottom: "1.5rem", color: "#fff" };
const inputWrapper = { display: "flex", alignItems: "center", backgroundColor: "#f1f1f1", borderRadius: "8px", padding: "0.5rem 0.8rem", margin: "0.7rem 0" };
const iconStyle = { marginRight: "8px", color: "#666" };
const inputStyle = { flex: 1, padding: "0.6rem", border: "none", outline: "none", fontSize: "1rem", backgroundColor: "transparent" };
const buttonStyle = { width: "100%", padding: "0.8rem", marginTop: "1rem", borderRadius: "8px", border: "none", backgroundColor: "#4CAF50", color: "white", fontSize: "1rem", cursor: "pointer", transition: "all 0.2s ease" };
