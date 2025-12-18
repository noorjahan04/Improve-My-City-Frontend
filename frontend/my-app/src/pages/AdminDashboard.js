import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileSettings from "./ProfileSettings";

const BASE_URL = "https://city-backend-n1au.onrender.com";

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
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

 
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

 
  const handleMenuClick = (menu) => {
    setActiveSection(menu);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  
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

        const allTickets = usersRes.data.flatMap(u => u?.supportTickets || []);

        setStats({
          users: usersRes.data.length,
          employees: employeesRes.data.length,
          tickets: allTickets.length,
          categories: categoriesRes.data.length,
        });

        setUsers(usersRes.data || []);
        setEmployees(employeesRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      }
    };

    fetchProfile();
    fetchAllData();
  }, [token]);

  
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
        supportTickets: u?.supportTickets?.map(t => t._id === ticketId ? { ...t, status: "closed", reply: ticketReplies[ticketId] } : t)
      })));
      setTicketReplies(prev => ({ ...prev, [ticketId]: "" }));
    } catch (err) {
      console.error(err);
      alert("Failed to reply");
    }
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
  const searchInputStyle = {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    flex: isMobile ? "1 1 100%" : "1",
    minWidth: isMobile ? "100%" : "auto",
  };

  const selectStyle = {
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    flex: isMobile ? "1 1 100%" : "auto",
    minWidth: isMobile ? "100%" : "auto",
  };

  // --- Render Tables ---
  const renderUsersTable = () => {
    const filteredUsers = users.filter(u => {
      // Safely access properties with fallbacks
      const userName = u?.name || '';
      const userEmail = u?.email || '';
      
      const matchesSearch = 
        userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        userEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const userRole = u?.role || 'user';
      const matchesRole = filterRole ? userRole.toLowerCase() === filterRole.toLowerCase() : true;
      
      return matchesSearch && matchesRole;
    });

    return (
      <div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            style={selectStyle}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="subemployee">SubEmployee</option>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Phone Verified</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, idx) => {
                // Safely access user properties with fallbacks
                const userName = u?.name || 'N/A';
                const userEmail = u?.email || 'N/A';
                const userRole = u?.role || 'User';
                const userPhone = u?.phone || '-';
                const isPhoneVerified = u?.isPhoneVerified || false;
                const userId = u?._id;
                
                return (
                  <tr key={userId || idx} style={trStyle(idx)}>
                    <td style={tdStyle}>{userName}</td>
                    <td style={tdStyle}>{userEmail}</td>
                    <td style={tdStyle}>{userRole}</td>
                    <td style={tdStyle}>{userPhone}</td>
                    <td style={tdStyle}>
                      <span style={{
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        backgroundColor: isPhoneVerified ? "green" : "red",
                        fontWeight: "bold",
                        fontSize: "0.9rem"
                      }}>{isPhoneVerified ? "Yes" : "No"}</span>
                    </td>
                    <td style={tdStyle}>
                      {userId && (
                        <button
                          onClick={async () => {
                            if (!window.confirm("Delete this user?")) return;
                            try {
                              await axios.delete(`${BASE_URL}/api/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
                              setUsers(prev => prev.filter(user => user?._id !== userId));
                              setStats(prev => ({ ...prev, users: prev.users - 1 }));
                              alert("User deleted!");
                            } catch (err) {
                              console.error(err);
                              alert("Delete failed!");
                            }
                          }}
                          style={{ padding: "4px 8px", backgroundColor: "#ff4d4d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderEmployeesTable = () => {
    const filteredEmployees = employees.filter(emp => {
      // Safely access properties with fallbacks
      const empName = emp?.name || '';
      const empEmail = emp?.email || '';
      const categoryName = emp?.selectedCategory?.name || '';
      
      const matchesSearch = 
        empName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        empEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory ? 
        categoryName.trim().toLowerCase() === filterCategory.trim().toLowerCase() : true;
      
      return matchesSearch && matchesCategory;
    });

    const groupedEmployees = filteredEmployees.reduce((acc, emp) => {
      const categoryName = emp?.selectedCategory?.name || "No category";
      if (!acc[categoryName]) acc[categoryName] = [];
      acc[categoryName].push(emp);
      return acc;
    }, {});

    const uniqueCategories = [...new Set(employees.map(e => e?.selectedCategory?.name || "No category"))];

    return (
      <div>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={searchInputStyle}
          />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={selectStyle}
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(cat => (<option key={cat} value={cat.trim()}>{cat}</option>))}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Role / Status</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedEmployees).map(([category, emps]) => (
                <React.Fragment key={category}>
                  <tr style={{ backgroundColor: "#e0e0e0" }}>
                    <td colSpan="6" style={{ textAlign: "center", fontWeight: "bold" }}>{category}</td>
                  </tr>
                  {emps.map((e, idx) => {
                    // Safely access employee properties with fallbacks
                    const empName = e?.name || 'N/A';
                    const empEmail = e?.email || 'N/A';
                    const empPhone = e?.phone || '-';
                    const empRole = e?.role || 'employee';
                    const isApproved = e?.isApproved || false;
                    const empCategory = e?.selectedCategory?.name || "No category";
                    const empId = e?._id;
                    
                    return (
                      <tr key={empId || idx} style={trStyle(idx)}>
                        <td style={tdStyle}>{empName}</td>
                        <td style={tdStyle}>{empEmail}</td>
                        <td style={tdStyle}>{empPhone}</td>
                        <td style={tdStyle}>{empRole === "employee" && !isApproved ? "Pending Approval" : isApproved ? "Approved" : empRole || "Employee"}</td>
                        <td style={tdStyle}>{empCategory}</td>
                        <td style={tdStyle}>
                          {empRole === "employee" ? (
                            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                              {empId && (
                                <>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const url = isApproved
                                          ? `${BASE_URL}/api/admin/employees/toggle/${empId}`
                                          : `${BASE_URL}/api/admin/employees/approve/${empId}`;
                                        await axios.put(url, {}, { headers: { Authorization: `Bearer ${token}` } });
                                        setEmployees(prev => prev.map(emp => emp?._id === empId ? { ...emp, isApproved: !isApproved } : emp));
                                        alert(isApproved ? "Employee disapproved!" : "Employee approved!");
                                      } catch (err) {
                                        console.error(err);
                                        alert("Action failed!");
                                      }
                                    }}
                                    style={{ padding: "4px 8px", backgroundColor: isApproved ? "#FFC107" : "#4CAF50", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                                  >{isApproved ? "Disapprove" : "Approve"}</button>

                                  {!isApproved && (
                                    <button
                                      onClick={async () => {
                                        if (!window.confirm("Reject this employee?")) return;
                                        try {
                                          await axios.delete(`${BASE_URL}/api/admin/employees/reject/${empId}`, { headers: { Authorization: `Bearer ${token}` } });
                                          setEmployees(prev => prev.filter(emp => emp?._id !== empId));
                                          setStats(prev => ({ ...prev, employees: prev.employees - 1 }));
                                          alert("Employee rejected!");
                                        } catch (err) {
                                          console.error(err);
                                          alert("Rejection failed!");
                                        }
                                      }}
                                      style={{ padding: "4px 8px", backgroundColor: "#ff4d4d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                                    >Reject</button>
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            empId && (
                              <button
                                onClick={async () => {
                                  if (!window.confirm("Delete this user?")) return;
                                  try {
                                    await axios.delete(`${BASE_URL}/api/admin/users/${empId}`, { headers: { Authorization: `Bearer ${token}` } });
                                    setEmployees(prev => prev.filter(emp => emp?._id !== empId));
                                    setStats(prev => ({ ...prev, employees: prev.employees - 1 }));
                                    alert("User deleted!");
                                  } catch (err) {
                                    console.error(err);
                                    alert("Delete failed!");
                                  }
                                }}
                                style={{ padding: "4px 8px", backgroundColor: "#ff4d4d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                              >Delete</button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>No employees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTicketsTable = () => {
    const allTickets = users.flatMap(u => {
      const userTickets = u?.supportTickets || [];
      const userName = u?.name || 'Unknown';
      const userEmail = u?.email || 'Unknown';
      const userId = u?._id;
      
      return userTickets.map(ticket => ({
        ...ticket,
        userId: userId,
        userName: userName,
        userEmail: userEmail
      }));
    });

    const filteredTickets = allTickets.filter(ticket => {
      const ticketSubject = ticket?.subject || '';
      const ticketUserName = ticket?.userName || '';
      const ticketUserEmail = ticket?.userEmail || '';
      const ticketStatus = ticket?.status || '';
      
      const matchesSearch =
        ticketSubject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        ticketUserName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
        ticketUserEmail.toLowerCase().includes(ticketSearch.toLowerCase());
      
      const matchesStatus = ticketStatusFilter
        ? ticketStatus.toLowerCase() === ticketStatusFilter.toLowerCase()
        : true;
      
      return matchesSearch && matchesStatus;
    });

    return (
      <div>
        {/* Search & Filter */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search by user or subject..."
            value={ticketSearch}
            onChange={e => setTicketSearch(e.target.value)}
            style={searchInputStyle}
          />
          <select
            value={ticketStatusFilter}
            onChange={e => setTicketStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Tickets Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Subject</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Reply</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket, idx) => {
                const ticketId = ticket?._id || idx;
                const ticketSubject = ticket?.subject || 'No subject';
                const ticketUserName = ticket?.userName || 'Unknown';
                const ticketUserEmail = ticket?.userEmail || '';
                const ticketStatus = ticket?.status || 'open';
                const ticketCreatedAt = ticket?.createdAt ? new Date(ticket.createdAt) : new Date();
                const ticketReply = ticket?.reply || '';
                const userId = ticket?.userId;
                
                return (
                  <tr key={ticketId} style={trStyle(idx)}>
                    <td style={tdStyle}>{typeof ticketId === 'string' ? ticketId.substring(0, 8) + '...' : 'N/A'}</td>
                    <td style={tdStyle}>
                      <div>
                        <div style={{ fontWeight: "bold" }}>{ticketUserName}</div>
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>{ticketUserEmail}</div>
                      </div>
                    </td>
                    <td style={tdStyle}>{ticketSubject}</td>
                    <td style={tdStyle}>
                      <b style={{ color: ticketStatus === "open" ? "green" : "red" }}>{ticketStatus}</b>
                    </td>
                    <td style={tdStyle}>{ticketCreatedAt.toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      {ticketStatus === "open" ? (
                        <div style={{ display: "flex", gap: "5px", flexDirection: isMobile ? "column" : "row" }}>
                          <input
                            type="text"
                            placeholder="Type reply..."
                            value={ticketReplies[ticketId] || ""}
                            onChange={e => setTicketReplies(prev => ({ ...prev, [ticketId]: e.target.value }))}
                            style={{ flex: 1, padding: "4px", borderRadius: "6px", border: "1px solid #ccc", minWidth: isMobile ? "100%" : "auto" }}
                          />
                          {userId && (
                            <button
                              onClick={() => handleTicketReply(userId, ticketId)}
                              style={{ padding: "4px 8px", backgroundColor: "#4CAF50", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", whiteSpace: "nowrap" }}
                            >
                              Reply
                            </button>
                          )}
                        </div>
                      ) : ticketReply || "-"}
                    </td>
                  </tr>
                );
              })}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "10px" }}>
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCategories = () => {
    const uniqueCategoryNames = [...new Set(categories.map(c => c?.name || '').filter(name => name))];
    const filteredCategories = categories.filter(c => {
      const catName = c?.name || '';
      const catDescription = c?.description || '';
      
      const matchesSearch =
        catName.toLowerCase().includes(categorySearch.toLowerCase()) ||
        catDescription.toLowerCase().includes(categorySearch.toLowerCase());
      
      const matchesFilter = categoryFilter ? catName === categoryFilter : true;
      
      return matchesSearch && matchesFilter;
    });

    return (
      <div>
        <h2 style={sectionTitle}>Categories</h2>

        {/* Add New Category */}
        <div style={{ marginBottom: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={categoryForm.name}
            onChange={handleCategoryChange}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", flex: isMobile ? "1 1 100%" : "1" }}
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={categoryForm.description}
            onChange={handleCategoryChange}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", flex: isMobile ? "1 1 100%" : "2" }}
          />
          <button
            onClick={handleCreateCategory}
            style={{ padding: "6px 12px", backgroundColor: "#4CAF50", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", flex: isMobile ? "1 1 100%" : "auto" }}
          >
            Add Category
          </button>
        </div>

        {/* Search & Filter */}
        <div style={{ marginBottom: "10px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search categories..."
            value={categorySearch}
            onChange={e => setCategorySearch(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", flex: isMobile ? "1 1 100%" : "2" }}
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #ccc", flex: isMobile ? "1 1 100%" : "1" }}
          >
            <option value="">All Categories</option>
            {uniqueCategoryNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Categories Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((c, idx) => {
                const categoryId = c?._id;
                const categoryName = c?.name || 'Unnamed';
                const categoryDescription = c?.description || '-';
                
                return (
                  <tr key={categoryId || idx} style={trStyle(idx)}>
                    <td style={tdStyle}>{categoryName}</td>
                    <td style={tdStyle}>{categoryDescription}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        {categoryId && (
                          <>
                            <button
                              onClick={async () => {
                                const name = prompt("Enter new category name", categoryName);
                                if (!name) return alert("Category name cannot be empty");
                                const description = prompt("Enter new description", categoryDescription || "");
                                try {
                                  const res = await axios.put(
                                    `${BASE_URL}/api/admin/category/${categoryId}`,
                                    { name, description },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                  );
                                  setCategories(prev => prev.map(cat => (cat?._id === categoryId ? res.data.category : cat)));
                                  alert("Category updated!");
                                } catch (err) {
                                  console.error(err);
                                  alert("Update failed!");
                                }
                              }}
                              style={{ padding: "4px 8px", backgroundColor: "#2196F3", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", flex: "1" }}
                            >
                              Edit
                            </button>

                            <button
                              onClick={async () => {
                                if (!window.confirm("Delete this category?")) return;
                                try {
                                  await axios.delete(`${BASE_URL}/api/admin/category/${categoryId}`, { headers: { Authorization: `Bearer ${token}` } });
                                  setCategories(prev => prev.filter(cat => cat?._id !== categoryId));
                                  alert("Category deleted!");
                                } catch (err) {
                                  console.error(err);
                                  alert("Delete failed!");
                                }
                              }}
                              style={{ padding: "4px 8px", backgroundColor: "#ff4d4d", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", flex: "1" }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "10px" }}>
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- Main render ---
  return (
    <div style={{ minHeight: "100vh", background: "#f1f1f1", position: "relative" }}>
      {/* Mobile Header with Hamburger */}
      {isMobile && (
        <div style={mobileHeaderStyle}>
          {renderHamburger()}
          <div style={mobileHeaderTitleStyle}>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{activeSection}</h3>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#aaa" }}>{user?.name || "Admin"}</p>
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
        <div>
          <div style={profileStyle}>
            {user?.profilePic && <img src={user.profilePic} alt="Profile" style={profilePicStyle} />}
            <p style={{ color: "#fff", fontWeight: "bold" }}>{user?.name || "Admin"}</p>
          </div>
          {["Dashboard", "Users", "Employees", "Tickets", "Categories", "Profile"].map(section => (
            <div 
              key={section} 
              style={menuItemStyle(activeSection === section)} 
              onClick={() => handleMenuClick(section)}
            >
              {section}
            </div>
          ))}
        </div>
        {/* Desktop Logout Button (only show on desktop) */}
        {!isMobile && (
          <div style={{ padding: "0.5rem" }}>
            <div style={bottomLinkStyle(false, true)} onClick={handleLogout}>Logout</div>
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
        
        {activeSection === "Dashboard" && (
          <div>
            {/* Stats cards */}
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "30px" }}>
              <div style={cardStyle}>Users: {stats.users}</div>
              <div style={cardStyle}>Employees: {stats.employees}</div>
              <div style={cardStyle}>Tickets: {stats.tickets}</div>
              <div style={cardStyle}>Categories: {stats.categories}</div>
            </div>

            {/* Tickets table */}
            <div>
              <h2 style={{ marginBottom: "10px" }}>Recent Tickets</h2>
              {renderTicketsTable()}
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

// ---------------- STYLES ----------------
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

const sidebarStyle = (isMobile, isOpen) => ({
  width: isMobile ? "250px" : "250px",
  minHeight: "100vh",
  backgroundColor: "#111",
  padding: "0.5rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  position: isMobile ? "fixed" : "fixed",
  left: isMobile ? (isOpen ? "0" : "-250px") : "0",
  top: isMobile ? "60px" : "0",
  zIndex: 1000,
  transition: "left 0.3s ease",
  height: isMobile ? "calc(100vh - 60px)" : "100vh",
  overflowY: "auto",
});

const mainContentStyle = (isMobile, sidebarOpen) => ({
  marginLeft: isMobile ? "0" : "250px",
  flex: 1,
  padding: isMobile ? "1rem" : "2rem",
  paddingTop: isMobile ? "80px" : "2rem",
  transition: "margin-left 0.3s ease",
  minHeight: "100vh",
});

const pageHeaderStyle = {
  marginBottom: "2rem",
  paddingBottom: "1rem",
  borderBottom: "2px solid #eee",
};

const profileStyle = {
  padding: "0.5rem",
  borderBottom: "1px solid #444",
  textAlign: "center",
};

const profilePicStyle = {
  borderRadius: "50%",
  marginBottom: "0.2rem",
  width: "80px",
  height: "80px",
  objectFit: "cover",
};

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
  transition: "background-color 0.3s ease",
});

const bottomLinkStyle = (isActive, isLogout = false) => ({
  textDecoration: "none",
  color: "#fff",
  padding: "0.8rem 1rem",
  display: "block",
  borderRadius: "8px",
  margin: "0.4rem 0",
  cursor: "pointer",
  fontWeight: "bold",
  backgroundColor: isLogout ? "#ff4d4d" : isActive ? "#222" : "transparent",
  textAlign: "center",
  transition: "all 0.2s"
});

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

const thStyle = {
  backgroundColor: "#020202ff",
  color: "#fff",
  textAlign: "left",
  padding: "12px 15px",
  fontWeight: "bold",
  fontSize: "0.9rem",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "12px 15px",
  borderBottom: "1px solid #eee",
  fontSize: "0.9rem",
  wordBreak: "break-word",
};

const trStyle = (idx) => ({
  backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff",
  transition: "background-color 0.2s",
});

const cardStyle = {
  backgroundColor: "#fff",
  flex: "1 1 200px",
  minWidth: "150px",
  padding: "15px",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  textAlign: "center",
  fontWeight: "bold",
  fontSize: "14px",
};

const sectionTitle = { color: "#333", marginBottom: "15px" };