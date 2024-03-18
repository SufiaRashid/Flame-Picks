import React, { useEffect } from "react";
import BaseLayout from "./BaseLayout";
import "../App.css";

const SupportPage = () => {
  useEffect(() => {
    document.body.classList.add("support-page-bg");

    return () => {
      document.body.classList.remove("support-page-bg");
    };
  }, []);

  return (
    <BaseLayout>
      <div>
        <h5 align="center" style={{ color: "rgb(43, 57, 55)" }}>
          Flame Picks Support Page
        </h5>
        {/* Support page content goes here */}
      </div>
    </BaseLayout>
  );
};

export default SupportPage;
