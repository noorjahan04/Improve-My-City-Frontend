// ✅ SubEmployeeDashboard.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileSettings from "./ProfileSettings";
import SupportTicket from "./Support";
import "leaflet/dist/leaflet.css";

const BASE_URL = "https://improve-my-city-backend-hj52.onrender.com/api";

const SubEmployeeDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [complaints, setComplaints] = useState([]);
  const [mapModal, setMapModal] = useState(null);

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Mobile responsive state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  // Close sidebar when clicking on a menu item in mobile view
  const handleMenuClick = (menu) => {
    setActiveSection(menu);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resUser = await axios.get(`${BASE_URL}/employee/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(resUser.data.user);

        if (!resUser.data.user.selectedCategory) {
          const resCat = await axios.get(`${BASE_URL}/admin/category`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCategories(resCat.data);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
        alert("Error fetching data");
      }
    };
    fetchData();
  }, [token]);

  // Fetch complaints assigned to logged-in sub-employee
  useEffect(() => {
    const fetchComplaints = async () => {
      if (!userData || userData.role !== "subemployee") return;

      try {
        const res = await axios.get(
          `${BASE_URL}/complaints/employee-category-complaints`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const assignedComplaints = res.data.filter(
          (c) => c.assignedEmployee?._id === userData._id
        );

        setComplaints(assignedComplaints);
      } catch (err) {
        console.error(err);
      }
    };

    fetchComplaints();
  }, [userData, token]);

  const chooseCategory = async () => {
    if (!selected) return alert("Select a category first");
    try {
      await axios.put(
        `${BASE_URL}/employee/choose-category`,
        { categoryId: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const resUser = await axios.get(`${BASE_URL}/employee/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(resUser.data.user);
      alert("Category selected! Waiting for admin approval.");
    } catch (err) {
      console.error(err);
      alert("Failed to select category");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const markAsSolved = async (id) => {
    try {
      await axios.patch(
        `${BASE_URL}/complaints/${id}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: "Resolved" } : c))
      );

      alert("Complaint marked as solved!");
    } catch (err) {
      console.error(err);
      alert("Failed to mark complaint as solved");
    }
  };

  const downloadCSV = () => {
    const headers = ["Date", "Problem", "Status", "User", "Email", "Location"];
    const rows = filteredComplaints.map((c) => [
      new Date(c.createdAt).toLocaleString(),
      c.problem,
      c.status,
      c.user.name,
      c.user.email,
      c.location ? `${c.location.lat},${c.location.lng}` : "N/A",
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "complaints.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Mobile Hamburger Menu ---
  const renderHamburger = () => (
    <div style={hamburgerStyle} onClick={() => setSidebarOpen(!sidebarOpen)}>
      <div style={hamburgerLineStyle(sidebarOpen, 1)}></div>
      <div style={hamburgerLineStyle(sidebarOpen, 2)}></div>
      <div style={hamburgerLineStyle(sidebarOpen, 3)}></div>
    </div>
  );

  // --- Styles that depend on isMobile ---
  const sidebarItemStyle = (isActive) => ({
    padding: isMobile ? "15px 20px" : "25px 35px",
    cursor: "pointer",
    backgroundColor: isActive ? "#222" : "transparent",
    color: isActive ? "#4CAF50" : "#fff",
    marginBottom: "5px",
    borderRadius: "6px",
    transition: "background-color 0.3s ease",
  });

  if (loading) return <p>Loading...</p>;
  if (!userData) return <p>Error loading user data</p>;

  if (userData.selectedCategory && !userData.isApproved) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Welcome, {userData.name}</h2>
        <p>Selected Category: {userData.selectedCategory?.name}</p>
        <p style={{ color: "orange" }}>Waiting for admin approval...</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  if (!userData.selectedCategory) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Welcome, {userData.name}</h2>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <button onClick={chooseCategory} style={{ marginLeft: "10px" }}>
          Choose Category
        </button>
        <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
          Logout
        </button>
      </div>
    );
  }

  // Filtered complaints
  const filteredComplaints = complaints.filter((c) => {
    const userName = c?.user?.name || '';
    const userEmail = c?.user?.email || '';
    const problem = c?.problem || '';
    
    const matchesSearch =
      problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const renderSection = () => {
    switch (activeSection) {
      case "Dashboard":
        // Compute numbers
        const totalAssigned = complaints.length;
        const totalResolved = complaints.filter(c => c.status === "Resolved").length;
        const totalPending = complaints.filter(c => c.status !== "Resolved").length;

        return (
          <div>
            <div style={cardsGrid(isMobile)}>
              <div style={cardStyle}>
                <h3>Total Complaints Assigned</h3>
                <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Category: {userData.selectedCategory?.name}</p>
              </div>
              <div style={cardStyle}>
                <h3>Total Complaints Assigned</h3>
                <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{totalAssigned}</p>
              </div>
              <div style={cardStyle}>
                <h3>Complaints Resolved</h3>
                <p style={{ fontSize: "2rem", fontWeight: "bold", color: "green" }}>{totalResolved}</p>
              </div>
              <div style={cardStyle}>
                <h3>Complaints Pending</h3>
                <p style={{ fontSize: "2rem", fontWeight: "bold", color: "orange" }}>{totalPending}</p>
              </div>
            </div>
          </div>
        );

      case "Profile":
        return <ProfileSettings user={userData} />;
      case "Support":
        return <SupportTicket />;
      case "Complaints":
        return (
          <div>
            <h2>Assigned Complaints</h2>

            {/* Search & Filter */}
            <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
    alignItems: "center",
  }}
>
  <input
    type="text"
    placeholder="Search by problem or user"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    style={{
      flex: 1,
      minWidth: "220px",
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
      fontSize: "14px",
      transition: "border 0.2s, box-shadow 0.2s",
    }}
    onFocus={(e) => {
      e.target.style.borderColor = "#007bff";
      e.target.style.boxShadow = "0 0 5px rgba(0,123,255,0.3)";
    }}
    onBlur={(e) => {
      e.target.style.borderColor = "#ccc";
      e.target.style.boxShadow = "none";
    }}
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    style={{
      padding: "10px 14px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      backgroundColor: "#fff",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
      fontSize: "14px",
      minWidth: "160px",
      cursor: "pointer",
      transition: "border 0.2s, box-shadow 0.2s",
    }}
    onFocus={(e) => {
      e.target.style.borderColor = "#007bff";
      e.target.style.boxShadow = "0 0 5px rgba(0,123,255,0.3)";
    }}
    onBlur={(e) => {
      e.target.style.borderColor = "#ccc";
      e.target.style.boxShadow = "none";
    }}
  >
    <option value="">All Status</option>
    <option value="Pending">Pending</option>
    <option value="In Progress">In Progress</option>
    <option value="Resolved">Resolved</option>
  </select>

  <button
    onClick={downloadCSV}
    style={{
      padding: "10px 16px",
      backgroundColor: "#007bff",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "bold",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      transition: "background 0.2s, transform 0.2s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = "#0056b3";
      e.currentTarget.style.transform = "scale(1.03)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = "#007bff";
      e.currentTarget.style.transform = "scale(1)";
    }}
  >
    Download CSV
  </button>
</div>


            {filteredComplaints.length === 0 ? (
              <p>No complaints match your search/filter.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: "0 8px",
                    fontFamily: "Arial, sans-serif",
                    minWidth: isMobile ? "600px" : "100%",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#020202ff",
                        color: "white",
                        textAlign: "left",
                        borderRadius: "8px",
                      }}
                    >
                      <th style={{ ...thStyle, padding: "12px" }}>Date</th>
                      <th style={{ ...thStyle, padding: "12px" }}>Problem</th>
                      <th style={{ ...thStyle, padding: "12px" }}>Status</th>
                      <th style={{ ...thStyle, padding: "12px" }}>User</th>
                      <th style={{ ...thStyle, padding: "12px" }}>Location</th>
                      <th style={{ ...thStyle, padding: "12px" }}>Images</th>
                      <th style={{ ...thStyle, padding: "12px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map((c, idx) => (
                        <tr
                          key={c._id}
                          style={{
                            backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#ffffff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            borderRadius: "8px",
                            transition: "transform 0.2s",
                            cursor: "default",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
                          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                        >
                          <td style={{ ...tdStyle, padding: "12px" }}>
                            {new Date(c.createdAt).toLocaleString()}
                          </td>
                          <td style={{ ...tdStyle, padding: "12px" }}>{c.problem}</td>
                          <td style={{ ...tdStyle, padding: "12px" }}>
                            <span
                              style={{
                                color:
                                  c.status === "Resolved" ? "#636e72" : c.status === "In Progress" ? "#fd7e14" : "#00b894",
                                fontWeight: "bold",
                              }}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, padding: "12px" }}>
                            {c.user?.name || "N/A"} ({c.user?.email || "N/A"})
                          </td>
                          <td style={{ ...tdStyle, padding: "12px" }}>
                            {c.location ? (
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${c.location.lat},${c.location.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#007bff", textDecoration: "underline" }}
                              >
                                View Directions
                              </a>
                            ) : (
                              "No Location"
                            )}
                          </td>
                          <td style={{ ...tdStyle, padding: "12px" }}>
                            {c.images && c.images.length > 0 ? (
                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {c.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`complaint-${idx}`}
                                    style={{
                                      width: "60px",
                                      height: "60px",
                                      objectFit: "cover",
                                      cursor: "pointer",
                                      borderRadius: "8px",
                                      boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                                      transition: "transform 0.2s",
                                    }}
                                    onClick={() => setMapModal({ type: "image", src: img })}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                                  />
                                ))}
                              </div>
                            ) : (
                              "No Image"
                            )}
                          </td>
                          <td style={{ ...tdStyle, padding: "12px" }}>
                            <button
                              onClick={() => markAsSolved(c._id)}
                              disabled={c.status === "Resolved"}
                              style={{
                                padding: "6px 14px",
                                borderRadius: "6px",
                                backgroundColor: c.status === "Resolved" ? "#00f52dff" : "#f40707ff",
                                color: "black",
                                fontWeight:"bold",
                                border: "none",
                                cursor: c.status === "Resolved" ? "not-allowed" : "pointer",
                                transition: "background 0.2s",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {c.status === "Resolved" ? "Completed" : "Mark Solved"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f4f4f4, #e0e7ff)", position: "relative" }}>
      {/* Mobile Header with Hamburger */}
      {isMobile && (
        <div style={mobileHeaderStyle}>
          {renderHamburger()}
          <div style={mobileHeaderTitleStyle}>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{activeSection}</h3>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#aaa" }}>{userData?.name || "Sub-Employee"}</p>
          </div>
          {/* Mobile Logout Button in Header */}
          <button 
            onClick={handleLogout}
            style={mobileLogoutBtnStyle}
          >
            Logout
          </button>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && sidebarOpen && (
        <div style={overlayStyle} onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div style={sidebarStyle(isMobile, sidebarOpen)}>
        <div style={userInfoStyle}>
          <img
            src={userData?.profilePic || "https://via.placeholder.com/60"}
            alt="Profile"
            style={profilePicStyle}
          />
          <div>
            <p style={{ margin: 0, fontWeight: "bold" }}>{userData?.name || "Sub-Employee"}</p>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#ccc" }}>
              {userData?.email || ""}
            </p>
          </div>
        </div>

        <div style={{ flex: 1, marginTop: "3rem" }}>
          {["Dashboard", "Complaints", "Support", "Profile"].map((item) => (
            <div
              key={item}
              style={sidebarItemStyle(activeSection === item)}
              onClick={() => handleMenuClick(item)}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Desktop Logout Button (only show on desktop) */}
        {!isMobile && (
          <div style={{ padding: "1rem" }}>
            <button style={logoutButtonStyle} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={mainContentStyle(isMobile, sidebarOpen)}>
        {/* Desktop Page Title */}
        {!isMobile && (
          <div style={pageHeaderStyle}>
            <h1 style={{ margin: 0 }}>{activeSection}</h1>
          </div>
        )}
        
        {renderSection()}
      </div>

      {mapModal && (
        <div
          onClick={() => setMapModal(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          {mapModal.type === "image" ? (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                backgroundColor: "white",
                padding: "10px",
                borderRadius: "10px",
              }}
            >
              <img
                src={mapModal.src}
                alt="Large Preview"
                style={{
                  maxWidth: "80vw",
                  maxHeight: "80vh",
                  borderRadius: "10px",
                }}
              />
              <button
                onClick={() => setMapModal(null)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "#e74c3c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SubEmployeeDashboard;

// ==================== STYLES ====================
const mobileHeaderStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: "#111",
  color: "#fff",
  padding: "0.8rem 1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
  zIndex: 1000,
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
};

const mobileHeaderTitleStyle = {
  flex: 1,
};

const mobileLogoutBtnStyle = {
  backgroundColor: "#ff4d4d",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "4px",
  fontSize: "0.8rem",
  cursor: "pointer",
  fontWeight: "bold",
  whiteSpace: "nowrap",
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: 999,
};

const hamburgerStyle = {
  width: "30px",
  height: "24px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  cursor: "pointer",
  zIndex: 1001,
};

const hamburgerLineStyle = (isOpen, lineNumber) => ({
  height: "3px",
  width: "100%",
  backgroundColor: "#fff",
  borderRadius: "3px",
  transition: "all 0.3s ease",
  transform: isOpen
    ? lineNumber === 1
      ? "rotate(45deg) translate(6px, 6px)"
      : lineNumber === 2
      ? "scale(0)"
      : "rotate(-45deg) translate(6px, -6px)"
    : "none",
});

const mainContentStyle = (isMobile, sidebarOpen) => ({
  marginLeft: isMobile ? "0" : "250px",
  flex: 1,
  padding: isMobile ? "1rem" : "2rem",
  paddingTop: isMobile ? "80px" : "2rem",
  transition: "margin-left 0.3s ease",
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f4f4f4, #e0e7ff)",
});

const pageHeaderStyle = {
  marginBottom: "2rem",
  paddingBottom: "1rem",
  borderBottom: "2px solid #eee",
};

const cardsGrid = (isMobile) => ({
  display: "grid",
  gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
  marginTop: "20px",
});

const cardStyle = {
  background: "linear-gradient(135deg, #ffffff, #f0f4ff)",
  borderRadius: "15px",
  padding: "1.5rem",
  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
  textAlign: "center",
};

const thStyle = { 
  padding: "12px", 
  textAlign: "left", 
  borderBottom: "1px solid #ccc",
  whiteSpace: "nowrap",
  fontSize: "0.9rem",
};

const tdStyle = { 
  padding: "12px", 
  verticalAlign: "top", 
  borderBottom: "1px solid #ccc",
  fontSize: "0.9rem",
  wordBreak: "break-word",
};

const sidebarStyle = (isMobile, isOpen) => ({
  width: isMobile ? "250px" : "250px",
  minHeight: "100vh",
  background: "#111",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  paddingTop: "1rem",
  position: isMobile ? "fixed" : "fixed",
  left: isMobile ? (isOpen ? "0" : "-250px") : "0",
  top: isMobile ? "60px" : "0",
  zIndex: 1000,
  transition: "left 0.3s ease",
  height: isMobile ? "calc(100vh - 60px)" : "100vh",
  overflowY: "auto",
  fontWeight: "bold",
});

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
  objectFit: "cover",
};

const logoutButtonStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#e74c3c",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold",
  transition: "background-color 0.3s ease",
};