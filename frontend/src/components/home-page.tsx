"use client";

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has visited before
    const lastUserType = localStorage.getItem("lastUserType");
    
    if (lastUserType === "admin") {
      navigate("/admin-home");
    } else if (lastUserType === "user") {
      navigate("/user-home");
    } else {
      // First time: redirect to user by default
      navigate("/user-home");
    }
  }, [navigate]);

  // This component only handles redirects - no UI is displayed
  return null;
}
