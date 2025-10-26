import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Sidebar({ activeSection, setActiveSection }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // ✅ Track window resize properly
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMenuOpen(false); // Close menu when resizing back to desktop
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Fetch user
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
    margin: "0.2rem 0",
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
    zIndex: 998,
  };

  return (
    <>
      {/* ✅ Hamburger Icon for Mobile */}
      {isMobile && (
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            position: "fixed",
            top: "15px",
            left: "15px",
            zIndex: 1101,
            fontSize: "28px",
            color: "#4CAF50",
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "6px 8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            cursor: "pointer",
          }}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </div>
      )}

      {/* ✅ Overlay when menu open */}
      {isMobile && menuOpen && (
        <div style={overlayStyle} onClick={() => setMenuOpen(false)}></div>
      )}

      {/* ✅ Sidebar */}
      <div
        style={{
          ...sidebarStyle,
          left: isMobile ? (menuOpen ? "0" : "-260px") : "0",
          transition: "left 0.3s ease-in-out",
          boxShadow: isMobile && menuOpen ? "2px 0 10px rgba(0,0,0,0.5)" : "none",
        }}
      >
        {/* Profile Section */}
        <div
          style={{
            padding: "1rem 0.5rem",
            borderBottom: "1px solid #444",
            textAlign: "center",
          }}
        >
          {user ? (
            <>
              <img
                src={user.profilePic || "https://via.placeholder.com/80"}
                alt="Profile"
                style={{
                  borderRadius: "50%",
                  marginBottom: "0.5rem",
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
        <div style={{ marginTop: "0.5rem", flex: 1 }}>
          {["Dashboard", "Support"].map((menu) => (
            <div
              key={menu}
              style={linkStyle(menu)}
              onClick={() => {
                setActiveSection(menu);
                if (isMobile) setMenuOpen(false);
              }}
            >
              {menu}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
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
            style={{
              ...linkStyle("Logout"),
              backgroundColor: "#ff4d4d",
              textAlign: "center",
              marginTop: "0.5rem",
            }}
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
  minHeight: "100vh",
  backgroundColor: "#111",
  padding: "0.5rem",
  position: "fixed",
  top: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  zIndex: 1000,
};
