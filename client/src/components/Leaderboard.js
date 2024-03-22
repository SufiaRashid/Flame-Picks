import React, { useEffect, useState } from "react";
import BaseLayout from "./BaseLayout";
import "../App.css";

const Leaderboard = () => {
  useEffect(() => {
    //use useState to constantly update leaderboard from client side once accessible from database
    document.body.classList.add("leaderboard-page-bg");

    return () => {
      document.body.classList.remove("leaderboard-page-bg");
    };
  }, []);

  //fetch data from database
  const leaderboardData = [
    //match the structure you're planning for your SQLite database
    { username: "sportsguy_99", record: "145-80", winPercentage: "64.4" },
    //manual input to test
  ];

  return (
    <BaseLayout>
      <div className="leaderboard-container">
        {/*adjusted header with new class for styling*/}
        <h3 className="leaderboard-header">Leaderboards</h3>
        
        <div className="leaderboard-content">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Overall Record</th>
                <th>Winning Percentage</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((user, index) => (
                <tr key={user.username}>
                  <td>#{index + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.record}</td>
                  <td>{user.winPercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BaseLayout>
  );
};

export default Leaderboard;
