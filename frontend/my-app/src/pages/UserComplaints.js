import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaBars, FaTimes } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Location Picker Component
function LocationPicker({ location, setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return location ? <Marker position={[location.lat, location.lng]} /> : null;
}

// Sidebar Component
function Sidebar({ activeSection, setActiveSection }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
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
    if (!token) return;
    axios
      .get("https://improve-my-city-backend-hj52.onrender.com/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data.user))
      .catch((err) => console.log("Error fetching user:", err));
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
    backgroundColor: "rgba(0,0,0,0.6)",
    display: menuOpen ? "block" : "none",
    zIndex: 998,
  };

  return (
    <>
      {/* Hamburger Icon */}
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

      {isMobile && menuOpen && (
        <div style={overlayStyle} onClick={() => setMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        style={{
          ...sidebarStyle,
          left: isMobile ? (menuOpen ? "0" : "-260px") : "0",
          transition: "left 0.3s ease-in-out",
          boxShadow: isMobile && menuOpen ? "2px 0 10px rgba(0,0,0,0.5)" : "none",
        }}
      >
        <div style={{ padding: "1rem 0.5rem", borderBottom: "1px solid #444", textAlign: "center" }}>
          {user ? (
            <>
              <img
                src={user.profilePic || "https://via.placeholder.com/80"}
                alt="Profile"
                style={{ borderRadius: "50%", marginBottom: "0.5rem", width: "80px", height: "80px", objectFit: "cover" }}
              />
              <h3 style={{ color: "white", margin: 0 }}>{user.name}</h3>
              <p style={{ color: "#ccc", fontSize: "0.9rem" }}>{user.email}</p>
            </>
          ) : (
            <h3 style={{ color: "white" }}>Welcome</h3>
          )}
        </div>

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

// Complaint Component
function ComplaintPage() {
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [description, setDescription] = useState("");
  const [problem, setProblem] = useState("");
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const cloudName = "dbftgtgs9";
  const uploadPreset = "Demo_product_upload_image";

  // Fetch categories
  useEffect(() => {
    if (!token) return;
    axios
      .get("https://improve-my-city-backend-hj52.onrender.com/api/admin/category", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res.data))
      .catch((err) => console.log(err));
  }, [token]);

  // Fetch subcategories
  useEffect(() => {
    if (!selectedCategory) {
      setSubCategories([]);
      setSelectedSubCategory("");
      return;
    }
    axios
      .get("https://improve-my-city-backend-hj52.onrender.com/api/employee/selectedsubcategories", {
        headers: { Authorization: `Bearer ${token}` },
        params: { categoryId: selectedCategory },
      })
      .then((res) => setSubCategories(res.data || []))
      .catch((err) => console.log(err));
  }, [selectedCategory, token]);

  useEffect(() => {
    const sub = subCategories.find((s) => s._id === selectedSubCategory);
    setDescription(sub ? sub.description : "");
  }, [selectedSubCategory, subCategories]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    try {
      const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);
      return res.data.secure_url;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files).filter((f) =>
      ["image/png", "image/jpg", "image/jpeg"].includes(f.type)
    );
    if (!files.length) return alert("Only PNG, JPG, JPEG allowed");
    setUploading(true);
    const uploaded = [];
    for (let file of files) {
      const url = await uploadToCloudinary(file);
      if (url) uploaded.push(url);
    }
    setPhotos((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !selectedSubCategory || !problem || photos.length === 0 || !location) {
      return alert("Fill all required fields");
    }
    try {
      setLoading(true);
      const res = await axios.post(
        "https://improve-my-city-backend-hj52.onrender.com/api/complaints/create",
        { category: selectedCategory, subCategory: selectedSubCategory, problem, description, location, images: photos },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Complaint submitted!");
      setSelectedCategory("");
      setSelectedSubCategory("");
      setProblem("");
      setDescription("");
      setLocation(null);
      setPhotos([]);
      setSubCategories([]);
    } catch (err) {
      console.log(err);
      alert("Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content */}
      <div style={mainContentStyle}>
        <h2 style={{ textAlign: "center", color: "#333" }}>Raise a Complaint</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Category */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Category:</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={inputStyle}>
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {/* Subcategory */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Subcategory:</label>
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              style={inputStyle}
              disabled={!selectedCategory || subCategories.length === 0}
            >
              <option value="">Select Subcategory</option>
              {subCategories.map((sub) => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
            </select>
          </div>

          {/* Problem */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Problem:</label>
            <input value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Enter problem" style={inputStyle} />
          </div>

          {/* Description */}
          {description && <div style={fieldStyle}><label style={labelStyle}>Description:</label><textarea value={description} readOnly style={textareaStyle} /></div>}

          {/* Location */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Select Location on Map:</label>
            <MapContainer center={[20, 78]} zoom={5} style={{ height: "250px", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker location={location} setLocation={setLocation} />
            </MapContainer>
            {location && <p>Coordinates: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>}
            <button type="button" onClick={() => {
              if (navigator.geolocation) navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => alert(err.message)
              );
            }} style={{ padding: "6px 10px", borderRadius: "5px", marginTop: "5px" }}>Use My Location</button>
          </div>

          {/* Photos */}
          <div style={fieldStyle}>
            <label style={labelStyle}>Upload Photos:</label>
            <input type="file" multiple accept="image/png,image/jpg,image/jpeg" onChange={handleFileChange} style={inputStyle} />
          </div>

          {photos.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {photos.map((url, idx) => <img key={idx} src={url} alt="uploaded" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "5px" }} />)}
            </div>
          )}

          {photos.length > 0 && (
            <button type="submit" disabled={loading || uploading} style={buttonStyle}>
              {uploading ? "Uploading..." : loading ? "Submitting..." : "Submit Complaint"}
            </button>
          )}
        </form>
        {success && <p style={{ color: "green", textAlign: "center" }}>{success}</p>}
      </div>
    </div>
  );
}

export default ComplaintPage;

// Styles
const mainContentStyle = {
  marginLeft: "250px",
  padding: "20px",
  width: "100%",
  minHeight: "100vh",
  boxSizing: "border-box",
};

const formStyle = { display: "flex", flexDirection: "column", gap: "15px", maxWidth: "600px", margin: "0 auto" };
const fieldStyle = { display: "flex", flexDirection: "column" };
const labelStyle = { marginBottom: "5px", fontWeight: "bold", color: "#555" };
const inputStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #ccc" };
const textareaStyle = { padding: "8px", borderRadius: "6px", border: "1px solid #ccc", resize: "none", minHeight: "80px" };
const buttonStyle = { padding: "10px", borderRadius: "8px", backgroundColor: "#007bff", color: "white", fontWeight: "bold", border: "none", cursor: "pointer" };
