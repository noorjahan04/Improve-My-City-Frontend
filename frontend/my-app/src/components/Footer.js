import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive Styles
  const isMobile = windowWidth <= 768;

  const footerContainerResponsive = {
    display: "flex",
    justifyContent: isMobile ? "center" : "space-between",
    flexWrap: "wrap",
    gap: "10px",
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "center" : "flex-start",
  };

  const footerColumnResponsive = {
    flex: "1",
    minWidth: "200px",
    height: "170px",
    marginBottom: "1rem",
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: isMobile ? "center" : "left",
  };

  const iframeResponsive = {
    border: 0,
    borderRadius: "10px",
    width: isMobile ? "100%" : "200px",
    height: "120px",
  };

  const socialContainerResponsive = {
    display: "flex",
    gap: "10px",
    marginTop: "0.5rem",
    justifyContent: isMobile ? "center" : "flex-start",
  };

  return (
    <footer style={footerStyle}>
      <div style={footerContainerResponsive}>
        {/* Contact Us */}
        <div style={footerColumnResponsive}>
          <h4 style={footerHeading}>Contact Us</h4>
          <p>Email: support@makemycity.com</p>
          <p>Phone: +91 9876543210</p>
        </div>

        {/* Help */}
        <div style={footerColumnResponsive}>
          <h4 style={footerHeading}>Help</h4>
          <Link to="/faq" style={footerLink}>FAQ</Link>
          <Link to="/support" style={footerLink}>Support</Link>
          <Link to="/terms" style={footerLink}>Terms & Conditions</Link>
        </div>

        {/* Map / Location */}
        <div style={footerColumnResponsive}>
          <h4 style={footerHeading}>Our Location</h4>
          <iframe
            title="Bangalore Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0659510137587!2d77.594562!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670a9e8a523%3A0xbaa60c6fbbbe06d!2sBangalore%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1729872000000!5m2!1sen!2sin"
            style={{
              border: 0,
              width: "100%",
              height: "100px",
              borderRadius: "15px",
              boxShadow: "0px 5px 20px rgba(0, 0, 0, 0.3)",
            }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

        </div>

        {/* Social Media */}
        <div style={footerColumnResponsive}>
          <h4 style={footerHeading}>Follow Us</h4>
          <div style={socialContainerResponsive}>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" style={socialIcon}><FaFacebookF /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={socialIcon}><FaTwitter /></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={socialIcon}><FaInstagram /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={socialIcon}><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      <p style={footerCopy}>
        &copy; {new Date().getFullYear()} Make my city. All Rights Reserved.
      </p>
    </footer>
  );
}

// Base Styles
const footerStyle = {
  backgroundColor: "#cacacaff",
  color: "#000",
  padding: "2rem 3rem",
  marginTop: "3rem",
};

const footerHeading = {
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "0.8rem",
};

const footerLink = {
  display: "block",
  color: "#000",
  textDecoration: "none",
  marginBottom: "0.5rem",
};

const socialIcon = {
  color: "#000",
  fontSize: "20px",
  transition: "color 0.3s",
  textDecoration: "none",
};

const footerCopy = {
  fontWeight: "bold",
  textAlign: "center",
  marginTop: "1rem",
};
