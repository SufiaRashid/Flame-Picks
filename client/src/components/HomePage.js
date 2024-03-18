import React from "react";
import BaseLayout from "./BaseLayout";

const HomePage = ({ isAuthenticated, user }) => {
  return (
    <BaseLayout isAuthenticated={isAuthenticated} user={user}>
      <h5 align="center" style={{ color: "rgb(43, 57, 55)" }}>
        flame picks home page
      </h5>
    </BaseLayout>
  );
};

export default HomePage;
