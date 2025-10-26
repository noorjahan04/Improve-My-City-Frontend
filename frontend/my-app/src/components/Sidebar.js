import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Sidebar({ activeSection, setActiveSection }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [menuOpen, setMenuOpen] = useState(false);

  // Track window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await axios.get(
          "https://improve-my-city-backend-hj52.onrender.com/api/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data.user);
      } catch (err) {
        console.log("Error fetching user:", err);
      }
    };
    fetchProfile();
  }, [token]);

  const linkStyle = (menu) => ({
    textDecoration: "none",
    color: activeSection === menu ? "#4CAF50" : "#fff",
    padding: "0.8rem 1rem",
    display: "block",
    borderRadius: "8px",
    margin: "0.1rem 0",
    transition: "all 0.2s",
    cursor: "pointer",
    fontWeight: "bold",
    backgroundColor: activeSection === menu ? "#222" : "transparent",
  });

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: menuOpen ? "block" : "none",
    zIndex: 999,
    cursor: "pointer",
  };

  return (
    <>
      {/* Hamburger icon for mobile */}
      {isMobile && (
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            position: "fixed",
            top: "15px",
            left: "15px",
            zIndex: 1100,
            fontSize: "24px",
            color: "#737373ff",
            cursor: "pointer",
          }}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
      )}

      {/* Overlay for mobile */}
      {isMobile && <div style={overlayStyle} onClick={() => setMenuOpen(false)}></div>}

      {/* Sidebar */}
      <div
        style={{
          ...sidebarStyle,
          left: isMobile ? (menuOpen ? 0 : "-260px") : 0,
          transition: "left 0.3s ease",
        }}
      >
        {/* Top Profile */}
        <div style={{ padding: "0.5rem", borderBottom: "1px solid #444", textAlign: "center" }}>
          {user ? (
            <>
              <img
                src={user.profilePic || "https://via.placeholder.com/80"}
                alt="Profile"
                style={{
                  borderRadius: "50%",
                  marginBottom: "0.2rem",
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                }}
              />
              <h3 style={{ color: "white", margin: 0 }}>{user.name}</h3>
              <p style={{ color: "#ccc", fontSize: "0.9rem" }}>{user.email}</p>
            </>
          ) : (
            <h3 style={{ color: "white" }}>Welcome</h3>
          )}
        </div>

        {/* Menu Links */}
        <div style={{ marginTop: "0.1rem", flex: 1 }}>
          {[
            "Dashboard",
            "Support",
          ].map((menu) => (
            <div
              key={menu}
              style={linkStyle(menu)}
              onClick={() => {
                setActiveSection(menu);
                if (isMobile) setMenuOpen(false); // auto-close on mobile
              }}
            >
              {menu}
            </div>
          ))}
        </div>

        {/* Bottom Settings / Logout */}
        <div style={{ marginTop: "auto" }}>
          <div
            style={linkStyle("Profile")}
            onClick={() => {
              setActiveSection("Profile");
              if (isMobile) setMenuOpen(false);
            }}
          >
            Profile Settings
          </div>
          <div
            style={{ ...linkStyle("Logout"), backgroundColor: "#ff4d4d", textAlign: "center", marginTop: "0.5rem" }}
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
          >
            Logout
          </div>
        </div>
      </div>
    </>
  );
}

const sidebarStyle = {
  width: "250px",
  minHeight: "98vh",
  backgroundColor: "#111",
  padding: "0.5rem",
  position: "fixed",
  top: 0,
  left: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  zIndex: 1000,
};
