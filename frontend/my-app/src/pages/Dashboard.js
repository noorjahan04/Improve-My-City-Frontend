import { useState, useEffect } from "react";
import axios from "axios";
import { FaBars, FaTimes } from "react-icons/fa";
import ProfileSettings from "../pages/ProfileSettings";
import SupportTicket from "./Support";
import Complaint from "./UserComplaints";
import ComplaintStatus from "./complaintStatus";
import Chatbot from "./chatbot";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await axios.get(
          "https://improve-my-city-backend-hj52.onrender.com/api/profile",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data.user);
      } catch (err) {
        console.error("Authorization error:", err);
        localStorage.removeItem("token");
        alert("Not authorized. Please login again.");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User data not found.</p>;

  const sections = ["Dashboard", "Complaints", "Status", "Support", "Profile"];

  const renderSection = () => {
    switch (activeSection) {
      case "Dashboard":
        return (
          <div style={cards}>
            <div style={cardStyle(isMobile)}>
              <h2>Welcome, {user.name}</h2>
              <p>This is your dashboard overview.</p>
            </div>
          </div>
        );
      case "Profile":
        return <ProfileSettings user={user} />;
      case "Support":
        return <SupportTicket user={user} />;
      case "Complaints":
      case "Assigned Complaints":
      case "All Complaints":
        return <Complaint user={user} />;
      case "Status":
        return <ComplaintStatus user={user} />;
      case "Manage Users":
      case "Reports":
        return <p>{activeSection} content for Admin</p>;
      default:
        return <p>Section not found</p>;
    }
  };

  return (
    <div style={mainContainer}>
      {/* Mobile Header with Hamburger and Logout */}
      {isMobile && (
        <div style={mobileHeaderStyle}>
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            style={hamburgerStyle}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </div>
          <div style={mobileTitleStyle}>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{activeSection}</h2>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            style={mobileLogoutStyle}
          >
            Logout
          </button>
        </div>
      )}

      {/* Overlay for mobile menu */}
      {isMobile && menuOpen && (
        <div style={overlayStyle} onClick={() => setMenuOpen(false)} />
      )}

      {/* Sidebar/Menu */}
      <div
        style={{
          ...menuStyle,
          left: isMobile ? (menuOpen ? "0" : "-280px") : "0", // Increased negative margin to hide completely
          boxShadow:
            isMobile && menuOpen ? "2px 0 8px rgba(0,0,0,0.3)" : "none",
          transition: "left 0.3s ease-in-out",
          top: isMobile ? "60px" : "0", // Account for mobile header
          height: isMobile ? "calc(100% - 60px)" : "100%", // Adjust height for mobile
        }}
      >
        <div style={userInfoStyle}>
          <img
            src={user.profilePic || "https://via.placeholder.com/60"}
            alt="Profile"
            style={profilePicStyle}
          />
          <div>
            <p style={{ margin: 0, fontWeight: "bold" }}>{user.name}</p>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#ccc" }}>
              {user.email}
            </p>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#aaa" }}>
              Role: {user.role?.toUpperCase() || "USER"}
            </p>
          </div>
        </div>

        {sections.map((section) => (
          <div
            key={section}
            style={menuItemStyle(activeSection === section)}
            onClick={() => {
              setActiveSection(section);
              if (isMobile) setMenuOpen(false);
            }}
          >
            {section}
          </div>
        ))}

        {/* Desktop Logout Button */}
        {!isMobile && (
          <button
            style={logoutButtonStyle}
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        )}
      </div>

      {/* Main Content */}
      <div style={contentStyle(isMobile, menuOpen)}>
        {renderSection()}
        <Chatbot userId={user._id} />
      </div>
    </div>
  );
}

// ---------------- STYLES ----------------
const mainContainer = {
  display: "flex",
  minHeight: "100vh",
  position: "relative",
  overflowX: "hidden", // Prevent horizontal scrolling
};

const mobileHeaderStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: "60px",
  backgroundColor: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 15px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  zIndex: 999,
};

const hamburgerStyle = {
  fontSize: "22px",
  color: "#000000",
  cursor: "pointer",
  padding: "8px",
  borderRadius: "6px",
  backgroundColor: "#f5f5f5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "40px",
  height: "40px",
  zIndex: 1001,
};

const mobileTitleStyle = {
  flex: 1,
  textAlign: "center",
  padding: "0 10px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const mobileLogoutStyle = {
  fontSize: "14px",
  color: "#fff",
  backgroundColor: "#e74c3c",
  cursor: "pointer",
  padding: "8px 12px",
  borderRadius: "6px",
  border: "none",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "40px",
  whiteSpace: "nowrap",
  zIndex: 1001,
};

const overlayStyle = {
  position: "fixed",
  top: "60px", // Below mobile header
  left: 0,
  width: "100%",
  height: "calc(100% - 60px)",
  backgroundColor: "rgba(0,0,0,0.5)",
  zIndex: 998,
};

const menuStyle = {
  width: "230px",
  background: "#111",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  padding: "1rem",
  position: "fixed",
  bottom: 0,
  zIndex: 1000,
  overflowY: "auto",
};

const userInfoStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "2rem",
  paddingTop: "1rem",
  textAlign: "center",
};

const profilePicStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  marginBottom: "0.5rem",
  objectFit: "cover",
};

const menuItemStyle = (isActive) => ({
  padding: "12px 16px",
  marginBottom: "5px",
  borderRadius: "6px",
  cursor: "pointer",
  backgroundColor: isActive ? "#222" : "transparent",
  color: isActive ? "#4CAF50" : "#fff",
  fontWeight: isActive ? "bold" : "normal",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: "#222",
  },
});

const logoutButtonStyle = {
  marginTop: "auto",
  padding: "12px 16px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#e74c3c",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: "#c0392b",
  },
};

const contentStyle = (isMobile, menuOpen) => ({
  flex: 1,
  padding: isMobile ? "1rem" : "2rem",
  paddingTop: isMobile ? "80px" : "2rem", // Account for mobile header
  marginLeft: isMobile ? "0" : "250px",
  transition: "margin-left 0.3s ease-in-out",
  background: "linear-gradient(135deg, #f4f4f4, #e0e7ff)",
  minHeight: "100vh",
  width: "100%",
  boxSizing: "border-box",
  position: "relative",
  // Ensure content takes full width on mobile
  maxWidth: isMobile ? "100vw" : "calc(100vw - 250px)",
  overflowX: "hidden", // Prevent horizontal scrolling
});

const cards = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "20px",
  width: "100%",
};

const cardStyle = (isMobile) => ({
  background: "linear-gradient(135deg, #ffffff, #f0f4ff)",
  borderRadius: "15px",
  padding: isMobile ? "1.5rem" : "2rem",
  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
  marginTop: isMobile ? "10px" : "20px",
  width: "100%",
  boxSizing: "border-box",
});