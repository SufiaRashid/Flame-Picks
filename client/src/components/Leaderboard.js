import React, { useEffect, useState } from "react";
import BaseLayout from "./BaseLayout";
import "../App.css";
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        //backend server address
        const response = await axios.get('http://localhost:5000/get-users');
        if (response.status === 200) {
          setLeaderboardData(response.data);
        } else {
          console.error('Failed to fetch leaderboard data');
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData();
  }, []);

  // const leaderboardData = [
  //   //match the structure you're planning for your SQLite database
  //   // { username: "sportsguy_99", record: "145-80", winPercentage: "64.4" },
  //   //manual input to test
  // ];

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
                <tr key={user.id}>
                  <td>#{index + 1}</td>
                  <td>{`${user.firstName} ${user.lastName}`}</td>
                  <td>{user.score}</td>
                  <td>{user.losses}</td>
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
