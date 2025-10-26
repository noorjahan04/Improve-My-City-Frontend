import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [reviews, setReviews] = useState([]);

  // Default citizen feedbacks
  const defaultReviews = [
    {
      name: "Aarav",
      title: "Clean Streets Initiative",
      comment: "I reported garbage near my area and it was cleared in 2 days. Great platform!",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=1",
    },
    {
      name: "Meera",
      title: "Quick Response",
      comment: "The municipality acted fast after I raised a streetlight complaint!",
      rating: 4,
      image: "https://i.pravatar.cc/150?img=2",
    },
    {
      name: "Ravi",
      title: "Transparent System",
      comment: "Loved being able to track complaint status and see updates in real time.",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=3",
    },
    {
      name: "Liya",
      title: "Very Helpful App",
      comment: "Easy to report civic issues without visiting the office.",
      rating: 5,
      image: "https://i.pravatar.cc/150?img=4",
    },
  ];

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get("https://improve-my-city-backend-hj52.onrender.com/api/review");
        if (res.data.reviews && res.data.reviews.length > 0) {
          const mapped = res.data.reviews.map((r) => ({
            name: r.name || "User",
            title: r.title || "Citizen Feedback",
            comment: r.comment,
            rating: r.rating,
            image: r.image || "https://i.pravatar.cc/150?img=7",
          }));
          setReviews([...defaultReviews, ...mapped]);
        } else {
          setReviews(defaultReviews);
        }
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
        setReviews(defaultReviews);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div style={{ width: "100vw", overflowX: "hidden", fontFamily: "Arial, sans-serif" }}>
      <Navbar />

      {/* Video Background */}
      <div style={{ position: "relative", height: "75vh", overflow: "hidden" }}>
        <video
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
          }}
        >
          <source src="/assets/home.mp4" type="video/mp4" />
          Your browser does not support HTML5 video.
        </video>

        {/* Hero Section */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "white",
            width: "60%",
            maxWidth: "700px",
            padding: "2rem",
            borderRadius: "20px",
            backgroundColor: "rgba(0,0,0,0.6)",
            boxShadow: "0 8px 25px rgba(255, 255, 255, 0.5)",
          }}
        >
          <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>Welcome to Improve My City</h1>
          <p style={{ fontSize: "1.3rem", maxWidth: "600px", margin: "0 auto" }}>
            Empower citizens to report civic issues like potholes, garbage, or streetlight failures — and track them until resolved.
          </p>
        </div>
      </div>

      {/* Services */}
      <h1
        style={{
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "-10px",
          marginTop: "40px",
          padding: "20px",
        }}
      >
        What You Can Do
      </h1>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "2rem",
          backgroundColor: "#d3d3d3",
        }}
      >
        {[
          "Report Civic Issues",
          "Track Complaint Progress",
          "View Resolved Problems",
          "Connect with Local Authorities",
        ].map((title, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "white",
              borderRadius: "15px",
              padding: "2rem",
              margin: "1rem",
              minWidth: "250px",
              flex: "1 1 250px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-10px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <h3 style={{ marginBottom: "1rem", color: "#333" }}>{title}</h3>
            <p style={{ color: "#555" }}>
              Helping citizens and authorities connect to make cities cleaner, safer, and more efficient.
            </p>
          </div>
        ))}
      </div>

      {/* Image Gallery + Benefits */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          padding: "2rem",
          gap: "2rem",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Gallery Section */}
<div
  style={{
    flex: "2",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gridAutoRows: "250px",
    gap: "15px",
    width: "100%",
  }}
>
  {[
    "/assets/1.png",
    "/assets/2.png",
    "/assets/3.png",
    "/assets/5.png",
    "/assets/4.png",
  ].map((src, i) => (
    <div
      key={i}
      style={{
        overflow: "hidden",
        borderRadius: "10px",
        gridColumn:
          i === 3 ? "1 / span 2" : i === 4 ? "3 / span 1" : "auto", // alternating pattern
        height: i < 3 ? "250px" : "250px",
      }}
    >
      <img
        src={src}
        alt={`Gallery ${i + 1}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.5s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      />
    </div>
  ))}
</div>


        {/* Right: Benefits */}
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "1rem",
            gap: "1rem",
            background: "#e5e4e4",
          }}
        >
          <h2 style={{ fontWeight: "bold" }}>Why Use Improve My City?</h2>
          <p>📍 Report problems directly with photos and location.</p>
          <p>🔔 Receive updates when authorities take action.</p>
          <p>👀 See resolved issues near your neighborhood.</p>
          <p>🤝 Build a cleaner, better, more transparent community.</p>
          <p>🌟 Trusted by thousands of responsible citizens!</p>
        </div>
      </div>

      {/* Testimonials */}
      <h1 style={{ textAlign: "center", fontWeight: "bold", marginTop: "60px", marginBottom: "20px" }}>
        Citizens’ Voices
      </h1>
      <div style={{ overflow: "hidden", padding: "2rem 0", backgroundColor: "#b6b6b6" }}>
        <div style={{ display: "flex", animation: "scrollCards 30s linear infinite" }}>
          {reviews.map((t, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "white",
                borderRadius: "15px",
                padding: "1rem",
                margin: "0 1rem",
                minWidth: "250px",
                maxWidth: "250px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                textAlign: "center",
              }}
            >
              <img
                src={t.image}
                alt={t.name}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: "0.5rem",
                }}
              />
              <h3 style={{ margin: "0.5rem 0" }}>{t.name}</h3>
              <h4 style={{ margin: "0.3rem 0", fontStyle: "italic", color: "#555" }}>{t.title}</h4>
              <div style={{ color: "#FFD700", marginBottom: "0.5rem" }}>
                {[...Array(t.rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <p style={{ fontSize: "0.9rem", color: "#555" }}>{t.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Animation Style */}
      <style>
        {`
          @keyframes scrollCards {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>

      <Footer />
    </div>
  );
}
