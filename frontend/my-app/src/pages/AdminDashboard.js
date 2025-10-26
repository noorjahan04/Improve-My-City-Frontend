import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileSettings from "./ProfileSettings";
import { FiMenu, FiX } from "react-icons/fi";

const BASE_URL = "https://improve-my-city-backend-hj52.onrender.com";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ users: 0, employees: 0, tickets: 0, categories: 0 });
  const [users, setUsers] = useState([]);
  const [ticketReplies, setTicketReplies] = useState({});
  const [employees, setEmployees] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile toggle

  // --- Fetching data ---
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
        setUser(res.data.user);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    const fetchAllData = async () => {
      try {
        const [usersRes, employeesRes, categoriesRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/admin/employees`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${BASE_URL}/api/admin/category`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const allTickets = usersRes.data.flatMap(u => u.supportTickets || []);

        setStats({
          users: usersRes.data.length,
          employees: employeesRes.data.length,
          tickets: allTickets.length,
          categories: categoriesRes.data.length,
        });

        setUsers(usersRes.data);
        setEmployees(employeesRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };

    fetchProfile();
    fetchAllData();
  }, [token]);

  // --- Handlers ---
  const handleMenuClick = (menu) => {
    setActiveSection(menu);
    setIsSidebarOpen(false); // close sidebar on mobile when menu clicked
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name) return alert("Category name is required");
    try {
      const res = await axios.post(`${BASE_URL}/api/admin/category`, categoryForm, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(prev => [...prev, res.data.category]);
      setCategoryForm({ name: "", description: "" });
      setStats(prev => ({ ...prev, categories: prev.categories + 1 }));
      alert("Category created!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleTicketReply = async (userId, ticketId) => {
    if (!ticketReplies[ticketId]) return alert("Enter a reply first!");
    try {
      await axios.put(`${BASE_URL}/api/tickets/reply/${userId}/${ticketId}`, { reply: ticketReplies[ticketId] }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Replied successfully!");
      setUsers(prev => prev.map(u => ({
        ...u,
        supportTickets: u.supportTickets?.map(t => t._id === ticketId ? { ...t, status: "closed", reply: ticketReplies[ticketId] } : t)
      })));
      setTicketReplies(prev => ({ ...prev, [ticketId]: "" }));
    } catch (err) {
      console.error(err);
      alert("Failed to reply");
    }
  };

  // --- Styles ---
  const sidebarStyle = {
    width: "250px",
    minHeight: "100vh",
    backgroundColor: "#111",
    padding: "0.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "fixed",
    left: isSidebarOpen ? 0 : "-260px",
    top: 0,
    transition: "all 0.3s",
    zIndex: 1000,
  };
  const profileStyle = { padding: "0.5rem", borderBottom: "1px solid #444", textAlign: "center" };
  const profilePicStyle = { borderRadius: "50%", marginBottom: "0.2rem", width: "80px", height: "80px", objectFit: "cover" };
  const menuItemStyle = isActive => ({ textDecoration: "none", color: isActive ? "#4CAF50" : "#fff", padding: "0.8rem 1rem", display: "block", borderRadius: "8px", margin: "0.4rem 0", cursor: "pointer", fontWeight: "bold", backgroundColor: isActive ? "#222" : "transparent", transition: "all 0.2s" });
  const bottomLinkStyle = (isActive, isLogout = false) => ({ textDecoration: "none", color: "#fff", padding: "0.8rem 1rem", display: "block", borderRadius: "8px", margin: "0.4rem 0", cursor: "pointer", fontWeight: "bold", backgroundColor: isLogout ? "#ff4d4d" : isActive ? "#222" : "transparent", textAlign: "center", transition: "all 0.2s" });

  // --- Responsive Hamburger ---
  const hamburgerStyle = {
    position: "fixed",
    top: "15px",
    left: "15px",
    fontSize: "1.8rem",
    color: "#111",
    cursor: "pointer",
    zIndex: 1100,
    display: "none",
  };

  return (
    <div>
      {/* Hamburger for mobile */}
      <div className="hamburger" style={{ ...hamburgerStyle, display: "block" }} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? <FiX /> : <FiMenu />}
      </div>

      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div>
          <div style={profileStyle}>
            {user?.profilePic && <img src={user.profilePic} alt="Profile" style={profilePicStyle} />}
            <p style={{ color: "#fff", fontWeight: "bold" }}>{user?.name || "Admin"}</p>
          </div>
          {["Dashboard", "Users", "Employees", "Tickets", "Categories", "Profile"].map(section => (
            <div key={section} style={menuItemStyle(activeSection === section)} onClick={() => handleMenuClick(section)}>
              {section}
            </div>
          ))}
        </div>
        <div style={{ padding: "0.5rem" }}>
          <div style={bottomLinkStyle(false, true)} onClick={handleLogout}>Logout</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: window.innerWidth > 768 ? "260px" : "0", padding: "20px", transition: "margin-left 0.3s" }}>
        {activeSection === "Dashboard" && (
          <div>
            {/* Stats cards */}
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "30px" }}>
              <div style={{ flex: "1 1 150px", backgroundColor: "#fff", padding: "15px", borderRadius: "10px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>Users: {stats.users}</div>
              <div style={{ flex: "1 1 150px", backgroundColor: "#fff", padding: "15px", borderRadius: "10px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>Employees: {stats.employees}</div>
              <div style={{ flex: "1 1 150px", backgroundColor: "#fff", padding: "15px", borderRadius: "10px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>Tickets: {stats.tickets}</div>
              <div style={{ flex: "1 1 150px", backgroundColor: "#fff", padding: "15px", borderRadius: "10px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>Categories: {stats.categories}</div>
            </div>
          </div>
        )}
        {activeSection === "Users" && renderUsersTable()}
        {activeSection === "Employees" && renderEmployeesTable()}
        {activeSection === "Tickets" && renderTicketsTable()}
        {activeSection === "Categories" && renderCategories()}
        {activeSection === "Profile" && <ProfileSettings />}
      </div>
    </div>
  );
}
