import React from "react";

const Footer = () => {
  return (
    <footer className="pt-4 pb-3 mt-5" style={{ backgroundColor: "#0f3d1e" }}>
      <div className="container text-center text-light">
        {/* App Name */}
        <h5 className="fw-bold mb-2 text-success">🌾 FarmConnect</h5>

        {/* Short Tagline */}
        <p className="small opacity-75 mb-3">
          Empowering farmers • Connecting traders • Fair pricing
        </p>

        {/* Copyright */}
        <p className="small opacity-75 mb-0">
          © {new Date().getFullYear()} FarmConnect
        </p>

        <p className="small opacity-75">
          Built by <span className="fw-semibold">OGTech Pvt. Ltd.</span>
        </p>
      </div>

      {/* Inline Styles */}
      <style>
        {`
          .footer-icon {
            width: 36px;
            height: 36px;
            background-color: #28a745;
            border-radius: 50%;
            color: #fff;
            font-size: 1.1rem;
            transition: transform 0.2s, background-color 0.2s;
          }

          .footer-icon:hover {
            background-color: #38d39f;
            transform: translateY(-3px);
          }
        `}
      </style>
    </footer>
  );
};

export default Footer;
