import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProfileSettings from "./ProfileSettings";
import SupportTicket from "./Support";
import SubCategoryDashboard from "./SubCategory";
import AssignComplaint from "./AssignComplaint";

const BASE_URL = "https://improve-my-city-backend-hj52.onrender.com/api";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [subEmployees, setSubEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user and related data
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const resUser = await axios.get(`${BASE_URL}/employee/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(resUser.data.user);

        if (!resUser.data.user?.selectedCategory) {
          const resCat = await axios.get(`${BASE_URL}/admin/category`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCategories(resCat.data);
        }

        if (resUser.data.user?.isApproved) {
          const resSub = await axios.get(`${BASE_URL}/employee/sub-employees`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSubEmployees(resSub.data);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Error fetching data");
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const chooseCategory = async () => {
    if (!selectedCategoryId) return alert("Select a category first!");
    try {
      await axios.put(
        `${BASE_URL}/employee/choose-category`,
        { categoryId: selectedCategoryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const resUser = await axios.get(`${BASE_URL}/employee/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(resUser.data.user);
      alert("Category selected! Waiting for admin approval.");
    } catch (err) {
      console.error(err);
      alert("Failed to select category");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Error loading user data</p>;

  // --- Render sub-employees table with actions ---
  const renderSubEmployeesTable = () => {
    if (!subEmployees.length) return <p>No sub-employees found.</p>;

    const handleAction = async (empId, action) => {
      try {
        let url = "";
        let method = "put";

        switch (action) {
          case "approve":
            url = `${BASE_URL}/employee/sub-employees/approve/${empId}`;
            break;
          case "disapprove":
            url = `${BASE_URL}/employee/sub-employees/disapprove/${empId}`;
            break;
          case "reject":
          case "delete":
            url = `${BASE_URL}/employee/sub-employees/reject/${empId}`;
            method = "delete";
            break;
          default:
            return;
        }

        await axios({
          method,
          url,
          headers: { Authorization: `Bearer ${token}` },
        });

        // Refresh sub-employees after action
        const resSub = await axios.get(`${BASE_URL}/employee/sub-employees`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubEmployees(resSub.data);
        alert(`Action "${action}" completed successfully`);
      } catch (err) {
        console.error(err);
        alert(`Failed to ${action} sub-employee`);
      }
    };

    return (
      <div style={{ overflowX: "auto", marginTop: "20px" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Phone</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subEmployees.map((emp, idx) => (
              <tr key={emp._id} style={trStyle(idx)}>
                <td style={tdStyle}>{emp.name}</td>
                <td style={tdStyle}>{emp.email}</td>
                <td style={tdStyle}>{emp.phone || "-"}</td>
                <td style={tdStyle}>{emp.selectedCategory?.name || "-"}</td>
                <td style={tdStyle}>{emp.isApproved ? "Approved" : "Pending"}</td>
                <td style={tdStyle}>
                  {!emp.isApproved ? (
                    <>
                      <button
                        style={actionBtnStyle("green")}
                        onClick={() => handleAction(emp._id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        style={actionBtnStyle("red")}
                        onClick={() => handleAction(emp._id, "reject")}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        style={actionBtnStyle("orange")}
                        onClick={() => handleAction(emp._id, "disapprove")}
                      >
                        Disapprove
                      </button>
                      <button
                        style={actionBtnStyle("gray")}
                        onClick={() => handleAction(emp._id, "delete")}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // --- Render dashboard cards ---
  const renderDashboard = () => (
    <div>
      {!user.selectedCategory && (
        <div style={{ marginTop: "1rem" }}>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            style={selectStyle}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <button onClick={chooseCategory} style={chooseBtnStyle}>
            Choose Category
          </button>
        </div>
      )}

      {user.selectedCategory && (
        <>
          {user.isApproved && (
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "20px" }}>
              <div style={cardStyle}>Sub-Employees: {subEmployees.length}</div>
              <div style={cardStyle}>Category: {user.selectedCategory.name}</div>
            </div>
          )}

          {!user.isApproved && (
            <p style={{ color: "orange", marginTop: "20px" }}>Waiting for admin approval...</p>
          )}

          {user.isApproved && (
            <>
              <h3 style={{ marginTop: "30px" }}>Sub-Employees List</h3>
              {renderSubEmployeesTable()}
            </>
          )}
        </>
      )}
    </div>
  );

  // --- Main render ---
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f1f1" }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div>
          <div style={profileStyle}>
            <img
              src={user.avatar || "https://via.placeholder.com/80"}
              alt="avatar"
              style={profilePicStyle}
            />
            <h3 style={{ color: "#fff" }}>{user.name}</h3>
            <p style={{ color: "#aaa", fontSize: "0.9rem" }}>{user.email}</p>
          </div>
          {["Dashboard", "Category", "Assign Complaint", "Support", "Profile"].map((menu) => (
            <div
              key={menu}
              style={menuItemStyle(activeSection === menu)}
              onClick={() => setActiveSection(menu)}
            >
              {menu}
            </div>
          ))}
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <div style={bottomLinkStyle} onClick={handleLogout}>
            Logout
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: "250px", flex: 1, padding: "2rem" }}>
        {activeSection === "Dashboard" && renderDashboard()}
        {activeSection === "Profile" && <ProfileSettings user={user} setUser={setUser} />}
        {activeSection === "Support" && <SupportTicket />}
        {activeSection === "Category" && <SubCategoryDashboard />}
        {activeSection === "Assign Complaint" && <AssignComplaint/>}
      </div>
    </div>
  );
}

// ---------------- STYLES ----------------
const sidebarStyle = {
  width: "250px",
  minHeight: "100vh",
  backgroundColor: "#111",
  padding: "0.5rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  position: "fixed",
  left: 0,
  top: 0,
};

const profileStyle = {
  padding: "0.5rem",
  borderBottom: "1px solid #444",
  textAlign: "center",
};

const profilePicStyle = { borderRadius: "50%", marginBottom: "0.2rem", width: "80px", height: "80px", objectFit: "cover" };

const menuItemStyle = (isActive) => ({
  textDecoration: "none",
  color: isActive ? "#4CAF50" : "#fff",
  padding: "0.8rem 1rem",
  display: "block",
  borderRadius: "8px",
  margin: "0.4rem 0",
  cursor: "pointer",
  fontWeight: "bold",
  backgroundColor: isActive ? "#222" : "transparent",
});

const bottomLinkStyle = {
  textDecoration: "none",
  color: "#fff",
  padding: "0.8rem 1rem",
  display: "block",
  borderRadius: "8px",
  margin: "0.4rem 0",
  cursor: "pointer",
  fontWeight: "bold",
  backgroundColor: "#ff4d4d",
  textAlign: "center",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  marginTop: "10px",
  backgroundColor: "#fff",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  borderRadius: "10px",
  overflow: "hidden",
  fontSize: "0.95rem",
  color: "#333",
};

const thStyle = { backgroundColor: "#020202ff", color: "#fff", textAlign: "left", padding: "12px 15px", fontWeight: "bold" };
const tdStyle = { padding: "12px 15px", borderBottom: "1px solid #eee" };
const trStyle = (idx) => ({ backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff", transition: "background-color 0.2s" });

const cardStyle = {
  backgroundColor: "#fff",
  flex: "1 1 200px",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  textAlign: "center",
  fontWeight: "bold",
  fontSize: "16px",
};

const actionBtnStyle = (color) => ({
  padding: "6px 10px",
  margin: "2px",
  borderRadius: "6px",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  backgroundColor:
    color === "green"
      ? "#4CAF50"
      : color === "orange"
      ? "#FF9800"
      : color === "red"
      ? "#f44336"
      : "#777",
  fontSize: "0.85rem",
});

const selectStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #ccc" };
const chooseBtnStyle = { marginLeft: "10px", padding: "8px 15px", borderRadius: "6px", backgroundColor: "#4CAF50", color: "#fff", border: "none", cursor: "pointer" };
