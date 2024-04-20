import React, { useEffect, useState } from "react";
import BaseLayout from "./BaseLayout";
import "../App.css";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useView } from "../context/ViewContext";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const { viewID, updateViewID } = useView();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("account-page-bg")
    const fetchLeaderboardData = async () => {
      try {
        //backend server address
        const response = await axios.get('http://localhost:5001/data/get-users');
        if (response.status === 200) {
          const sortedData = response.data.sort((a, b) => {
            const percentageA = calculatePercentage(a.score, a.losses);
            const percentageB = calculatePercentage(b.score, b.losses);
            return percentageB - percentageA;
          });
          setLeaderboardData(sortedData);
          setLoading(false);
        } else {
          console.error('Failed to fetch leaderboard data');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setLoading(false);
      }
    };

    fetchLeaderboardData();
    return () => {
      document.body.classList.remove("account-page-bg")
    }
  }, [viewID]);

  const handleUserClick = (id) => {
    console.log('User clicked:', id)
    updateViewID(id);
    console.log('View ID:', viewID)
    navigate('/account');
  };

  const calculatePercentage = (wins, losses) => {
    if (wins === 0 && losses === 0) {
      const value = 0;
      return value.toFixed(1);
    }
    return ((wins / (wins + losses)) * 100).toFixed(1);
  };

  return (
    <BaseLayout>
      <div className="leaderboard-container">
        {/*adjusted header with new class for styling*/}
        <h3 style={{ fontSize: "32px" }}>Leaderboard</h3>
        <div className="leaderboard-content">
          {loading ? (
            <p>Loading leaderboard...</p>
          ) : (
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
                    <td onClick={() => handleUserClick(user.id)} style={{ cursor: 'pointer' }}>
                      {`${user.firstName} ${user.lastName}`}
                    </td>
                    <td>{user.score} - {user.losses}</td>
                    <td>{calculatePercentage(user.score, user.losses)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default Leaderboard;
