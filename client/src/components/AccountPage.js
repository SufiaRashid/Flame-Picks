import React, { useEffect, useState } from 'react';
import BaseLayout from './BaseLayout';
import "../App.css";

const AccountPage = () => {
    // State to hold user information
    const [userInfo, setUserInfo] = useState({
        username: 'John Doe',
        profilePicture: 'https://example.com/profile.jpg', // Default profile picture URL
        points: 100, // Default points value
        favoriteNFLTeam: '', // Default favorite NFL team
        favoriteNBATeam: '' // Default favorite NBA team
    });

    // Separate state variables for selected NFL and NBA teams
    const [selectedNFLTeam, setSelectedNFLTeam] = useState('');
    const [selectedNBATeam, setSelectedNBATeam] = useState('');

    // Function to handle profile picture change
    const handleProfilePictureChange = (e) => {
        // Logic to handle image upload and update profile picture
        // For simplicity, let's just update the state with a new URL
        setUserInfo({
            ...userInfo,
            profilePicture: URL.createObjectURL(e.target.files[0])
        });
    };

    // Function to handle selecting favorite NFL team
    const handleSelectFavoriteNFLTeam = (e) => {
        const selectedTeam = e.target.value;
        setSelectedNFLTeam(''); // Clear selected NFL team
        setUserInfo({
            ...userInfo,
            favoriteNFLTeam: selectedTeam // Update user info with selected NFL team
        });
    };

    // Function to handle selecting favorite NBA team
    const handleSelectFavoriteNBATeam = (teamName) => {
        setSelectedNBATeam(''); // Clear selected NBA team
        setUserInfo({
            ...userInfo,
            favoriteNBATeam: teamName // Update user info with selected NBA team
        });
    };

    // List of all 32 NFL teams
    const nflTeams = [
        "Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills",
        "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns",
        "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers",
        "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs",
        "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins",
        "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants",
        "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers",
        "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Football Team"
    ];

    // List of all 30 NBA teams
    const nbaTeams = [
        "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets",
        "Chicago Bulls", "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets",
        "Detroit Pistons", "Golden State Warriors", "Houston Rockets", "Indiana Pacers",
        "LA Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Miami Heat",
        "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks",
        "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns",
        "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors",
        "Utah Jazz", "Washington Wizards"
        /*Testing this!*/
    ];

    return (
        <BaseLayout>
            <div className="account-page">
                <div className="user-info-box">
                    <div className="profile-section">
                        <img
                            src={userInfo.profilePicture}
                            alt="Profile"
                            className="profile-picture"
                            style={{
                                width: '300px',
                                height: '300px',
                                borderRadius: '50%', // Make it round
                                margin: 'auto', // Center align profile picture
                                display: 'block',
                                marginTop: '10px',
                                marginBottom: '30px'
                            }}
                        />
                        <div className="profile-details">
                            <p className="info-label"><strong>Username:</strong> {userInfo.username}</p>
                            <p className="info-label"><strong>Points:</strong> {userInfo.points}</p>
                            <h3 className="info-title">Favorite Teams:</h3>
                            <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                                {userInfo.favoriteNFLTeam && (
                                    <li>{userInfo.favoriteNFLTeam} (NFL)</li>
                                )}
                                {userInfo.favoriteNBATeam && (
                                    <li>{userInfo.favoriteNBATeam} (NBA)</li>
                                )}
                            </ul>
                            {/* Add other account-specific information here */}
                        </div>
                    </div>

                    <div className="actions-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div className="actions">
                        <div style={{ display: 'flex', flexDirection: 'column'}}>
                            <div className="profile-picture-upload" style={{ marginBottom: '20px', width: '300px' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="profile-picture-input"
                                    onChange={handleProfilePictureChange}
                                    style={{ display: 'none' }} // Hide the file input
                                />
                                <label htmlFor="profile-picture-input" className="file-button">Change Profile Picture</label>
                            </div>
                            <select className="file-button" onChange={handleSelectFavoriteNFLTeam}
                                    style={{ marginBottom: '20px', width: '300px' }} value={selectedNFLTeam}>
                                <option value="" disabled>Select Favorite NFL Team</option>
                                {nflTeams.map(team => (
                                    <option key={team} value={team}>{team}</option>
                                ))}
                            </select>
                            <select className="file-button" onChange={(e) => handleSelectFavoriteNBATeam(e.target.value)}
                                    style={{ marginBottom: '20px', width: '300px' }} value={selectedNBATeam}>
                                <option value="" disabled>Select Favorite NBA Team</option>
                                {nbaTeams.map(team => (
                                    <option key={team} value={team}>{team}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </BaseLayout>
    );
};

export default AccountPage;
