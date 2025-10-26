import { useState, useEffect } from "react";
import axios from "axios";
import ProfileSettings from "../pages/ProfileSettings";
import SupportTicket from "./Support";
import Complaint from "./UserComplaints";
import ComplaintStatus from "./complaintStatus";
import Chatbot from "./chatbot";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("Dashboard"); // Internal sidebar

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await axios.get("https://improve-my-city-backend-hj52.onrender.com/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Render main content based on selected sidebar section
  const renderSection = () => {
    switch (activeSection) {
      case "Dashboard":
        return (
          <div style={cards}>
            <div style={cardStyle}>
              <h2>Welcome, {user.name}</h2>
              <p>This is your dashboard overview.</p>
            </div>
            {/* You can add more cards or dashboard widgets here */}
          </div>
        );
      case "Profile":
        return <ProfileSettings user={user} />;
      case "Support":
        return <SupportTicket user={user} />;
      case "Complaints":
        return <Complaint user={user} />;
      case "Status":
        return <ComplaintStatus user={user} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <div style={extraSidebarStyle}>
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
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, marginTop: "2rem" }}>
          {["Dashboard", "Complaints", "Status", "Support", "Profile"].map((item) => (
            <div
              key={item}
              style={extraSidebarItemStyle(activeSection === item)}
              onClick={() => setActiveSection(item)}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Logout */}
        <div style={{ padding: "1rem" }}>
          <button style={logoutButtonStyle} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {renderSection()}
        {/* Floating Chatbot */}
        <Chatbot userId={user._id} />
      </div>
    </div>
  );
}

// ---------------- STYLES ----------------
const mainContentStyle = {
  flex: 1,
  marginLeft: "250px",
  padding: "2rem",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f4f4f4, #e0e7ff)",
};

const extraSidebarStyle = {
  width: "250px",
  minHeight: "100vh",
  background: "#111",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  paddingTop: "1rem",
  position: "fixed",
  fontWeight: "bold",
  left: 0,
  top: 0,
};

const userInfoStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "1rem",
  borderBottom: "1px solid #333",
};

const profilePicStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  marginBottom: "0.5rem",
};

const extraSidebarItemStyle = (isActive) => ({
  padding: "15px 20px",
  cursor: "pointer",
  backgroundColor: isActive ? "#222" : "transparent",
  color: isActive ? "#4CAF50" : "#fff",
  marginBottom: "5px",
  borderRadius: "6px",
});

const logoutButtonStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#e74c3c",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "16px",
  marginBottom: "10px",
};

const cards = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "20px",
};

const cardStyle = {
  background: "linear-gradient(135deg, #ffffff, #f0f4ff)",
  borderRadius: "15px",
  padding: "2rem",
  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  cursor: "pointer",
  animation: "fadeInUp 0.5s forwards",
};

// Keyframes for animation
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(20px);}
  100% { opacity: 1; transform: translateY(0);}
}
`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

// Hover effect
cardStyle["&:hover"] = {
  transform: "translateY(-8px)",
  boxShadow: "0 12px 25px rgba(0,0,0,0.35)",
};
