import { useState, useEffect } from "react";
import { getProfile, sendOtp, verifyOtp, updateProfilePic } from "../services/profileApi";
import axios from "axios";

const pic = '/assets/p1.png'
export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewPic, setPreviewPic] = useState(pic); // ✅ default image
  const [isUploading, setIsUploading] = useState(false);

  // Review popup states
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data.user);
        if (data.user.phone) setPhone(data.user.phone);
        if (data.user.isPhoneVerified) setStep(3);
        if (data.user.profilePic) setPreviewPic(data.user.profilePic); // ✅ set uploaded pic

        // show review popup if phone is verified but no review yet
        if (data.user.isPhoneVerified && !data.user.hasReviewed) {
          setShowReviewPopup(true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  // ---------------- OTP ----------------
  const handleSendOtp = async () => {
    try {
      await sendOtp(phone);
      alert("OTP sent!");
      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await verifyOtp(phone, otp);
      alert("Phone verified successfully!");
      setStep(3);
      setUser(prev => ({ ...prev, phone, isPhoneVerified: true }));
      setShowReviewPopup(true);
    } catch (err) {
      console.error(err);
      alert("Invalid OTP");
    }
  };

  // ---------------- Cloudinary Upload ----------------
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewPic(URL.createObjectURL(file)); // temporary preview before upload
  };

  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file first");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", "Demo_product_upload_image");

      const cloudRes = await fetch(
        "https://api.cloudinary.com/v1_1/dbftgtgs9/image/upload",
        { method: "POST", body: formData }
      );
      const cloudData = await cloudRes.json();
      const imageUrl = cloudData.secure_url;

      if (!imageUrl) throw new Error("Failed to get image URL from Cloudinary");

      const updatedUser = await updateProfilePic(imageUrl);
      setUser(updatedUser);
      setSelectedFile(null);
      setPreviewPic(updatedUser.profilePic); // ✅ set uploaded image
      alert("Profile picture updated!");
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  // ---------------- Review Submit ----------------
  const handleSubmitReview = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/review",
        { title, comment, rating },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Thanks for your feedback!");
      setShowReviewPopup(false);
      setUser(prev => ({ ...prev, hasReviewed: true }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit review");
    }
  };

  if (!user) return <p>Loading...</p>;

  const isPhoneVerified = user.isPhoneVerified;
  const hasProfilePic = !!user.profilePic;

  return (
    <div style={{
      maxWidth: "450px", margin: "40px 0 0 50px", padding: "20px", borderRadius: "10px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.2)", background: "white",
      transition: "all 0.5s ease"
    }}>
      <h2 style={{ textAlign: "center", color: "#333", fontFamily: "Arial, sans-serif" }}>Profile Settings</h2>

      {/* Profile Card */}
      <div style={{
        textAlign: "center",
        marginBottom: "1.5rem",
        padding: "30px",
        borderRadius: "12px",
        background: "#ebebebff",
        height: "250px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        transition: "transform 0.3s"
      }}>
        <img
          src={previewPic} // ✅ show default or uploaded image
          alt="Profile"
          style={{ width: "200px", height: "200px", borderRadius: "50%", border: "3px solid #05002eff", transition: "all 0.3s" }}
        />
        <h3 style={{ color: "#6c5ce7", fontWeight: "bold", margin: "10px 0 5px 0" }}>{user.username}</h3>
        <p style={{ color: "#0984e3", fontWeight: "bold", margin: "0" }}>{user.email}</p>

        {/* Profile Picture Upload */}
        {!hasProfilePic && (
          <div style={{ marginTop: "10px" }}>
            <input type="file" accept="image/*" onChange={handleFileSelect} />
          </div>
        )}
        {selectedFile && !hasProfilePic && (
          <div style={{ marginTop: "8px" }}>
            <button onClick={handleUpload} disabled={isUploading} style={{
              padding: "6px 20px",
              borderRadius: "8px",
              border: "none",
              background: "#6c5ce7",
              color: "#fff",
              cursor: "pointer",
              transition: "background 0.3s"
            }}>
              {isUploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}
      </div>

      {/* Phone & OTP */}
      <div style={{
        padding: "15px",
        borderRadius: "12px",
        background: "#e4e4e4ff",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        transition: "transform 0.3s",
      }}>
        {isPhoneVerified ? (
          <p style={{ color: "#00b853ff", fontWeight: "bold", fontSize: "20px" }}>
            <span style={{ color: "#000000ff" }}>Phone Number Verified:</span> {user.phone}
          </p>
        ) : (
          <>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter phone number"
              style={{
                width: "100%",
                padding: "10px",
                margin: "10px 0",
                borderRadius: "6px",
                border: "1px solid #abababff"
              }}
              disabled={step === 2}
            />
            {step === 1 && <button onClick={handleSendOtp} style={{
              padding: "8px 20px",
              borderRadius: "6px",
              border: "none",
              background: "#0984e3",
              color: "#fff",
              cursor: "pointer"
            }}>Send OTP</button>}
            {step === 2 && (
              <>
                <input
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  style={{
                    width: "100%",
                    padding: "10px",
                    margin: "10px 0",
                    borderRadius: "6px",
                    border: "1px solid #dfe6e9"
                  }}
                />
                <button onClick={handleVerifyOtp} style={{
                  padding: "8px 20px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#00b894",
                  color: "#fff",
                  cursor: "pointer"
                }}>Verify OTP</button>
              </>
            )}
          </>
        )}
      </div>

      {/* Review Popup */}
      {showReviewPopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", display: "flex",
          justifyContent: "center", alignItems: "center"
        }}>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", width: "400px" }}>
            <h3>Rate Our App</h3>
            <input
              type="text"
              placeholder="Review Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />
            <textarea
              placeholder="Your feedback"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ marginBottom: "10px" }}>
              {[1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num}</option>)}
            </select>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setShowReviewPopup(false)} style={{ padding: "6px 12px" }}>Cancel</button>
              <button onClick={handleSubmitReview} style={{
                padding: "6px 12px", background: "#6c5ce7", color: "white", border: "none", borderRadius: "6px"
              }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
