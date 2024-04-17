import React, { useEffect, useState } from 'react';
import BaseLayout from './BaseLayout';
import "../App.css";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AccountPage = () => {
    const { authData, updateUserAttribute} = useAuth();
    const [userInfo, setUserInfo] = useState({
        username: authData.user?.firstName + " " + authData.user?.lastName,
        profilePicture: authData.user?.profile_picture,
        points: authData.user?.score, // Default points value
        favoriteNFLTeam: authData.user?.favorite_nfl_team, // Default favorite NFL team
        favoriteNBATeam: authData.user?.favorite_nba_team // Default favorite NBA team
    });

    const handleProfilePictureChange = async (e) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('profilePicture', e.target.files[0]);

        const response = await axios.post(`http://localhost:5001/user/update-profile-picture`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        })
            .catch(error => {
                console.error('Error:', error.response.data);
                return
            });
        if (response.status === 200) {
            console.log("Response was good. The profile picture is: ", response.data.profile_picture);
            updateUserAttribute('profile_picture', response.data.profile_picture);
            setUserInfo({...userInfo, profilePicture: response.data.profile_picture});
        }
        else {
            console.log("Status: ", response.status)
        }
    };

    const handleSelectFavoriteNFLTeam = async (e) => {
        const token = localStorage.getItem('token');
        const selectedTeam = e.target.value;
        const updatedUserInfo = { ...userInfo, favoriteNFLTeam: selectedTeam };
        setUserInfo(updatedUserInfo);

        const response = await axios.post(`http://localhost:5001/user/update-favorite-nfl-team`, {
            selectedTeam: selectedTeam
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .catch(error => {
                console.error('Error:', error.response.data);
            });
        if (response.status === 200) {
            console.log("Response was good. The favorite nfl team is: ", response.data.favorite_nfl_team);
            updateUserAttribute('favorite_nfl_team', response.data.favorite_nfl_team)
        }
        else {
            console.log("Status: ", response.status)
        }
    };

    const handleSelectFavoriteNBATeam = async (e) => {
        const token = localStorage.getItem('token');
        const selectedTeam = e.target.value;
        const updatedUserInfo = { ...userInfo, favoriteNBATeam: selectedTeam };
        setUserInfo(updatedUserInfo);

        const response = await axios.post(`http://localhost:5001/user/update-favorite-nba-team`, {
            selectedTeam: selectedTeam
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .catch(error => {
                console.error('Error:', error.response.data);
            });
        if (response.status === 200) {
            console.log("Response was good. The favorite nfl team is: ", response.data.favorite_nba_team);
            updateUserAttribute('favorite_nba_team', response.data.favorite_nba_team)
        }
        else {
            console.log("Status: ", response.status)
        }
    };

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

    const nbaTeams = [
        "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets",
        "Chicago Bulls", "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets",
        "Detroit Pistons", "Golden State Warriors", "Houston Rockets", "Indiana Pacers",
        "LA Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Miami Heat",
        "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks",
        "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns",
        "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors",
        "Utah Jazz", "Washington Wizards"
    ];

    const UserProfilePicture = ({ base64String, style }) => {
        const defaultStyle = {
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            margin: 'auto',
            display: 'block',
            objectFit: 'cover',
        };
    
        const imageSrc = base64String ? `data:image/jpeg;base64,${base64String}` : 'default.jpg';
        return (
            <img src={imageSrc} alt="User Profile" style={{ ...defaultStyle, ...style }} />
        );
    };

    return (
        <BaseLayout>
            <div className="account-page">
                <div className="user-info-box">
                    <div className="profile-section">
                            <UserProfilePicture
                                base64String={userInfo.profilePicture}
                                style={{
                                    width: '300px',
                                    height: '300px'
                                }}
                            />

                        <div className="profile-details">
                            <p className="info-label"><strong>Name:</strong> {userInfo.username}</p>
                            <p className="info-label"><strong>Points:</strong> {userInfo.points}</p>
                            <h3 className="info-title">Favorite Teams:</h3>
                            <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                                {userInfo.favoriteNFLTeam && (
                                    <li>{userInfo.favoriteNFLTeam} (NFL)</li>
                                )}
                                {userInfo.favoriteNBATeam && (
                                    <li>{userInfo.favoriteNBATeam} (NBA)</li>
                                )}
                                {!userInfo.favoriteNFLTeam && !userInfo.favoriteNBATeam && (
                                    <li>(You have not chosen any favorite teams)</li>
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
                                        onChange={(e) => handleProfilePictureChange(e)}
                                        style={{ display: 'none' }} // Hide the file input
                                    />

                                    <label htmlFor="profile-picture-input" className="file-button">Change Profile Picture</label>
                                </div>
                                <select className="file-button" onChange={handleSelectFavoriteNFLTeam}
                                        style={{ marginBottom: '20px', width: '300px' }} value={userInfo.favoriteNFLTeam}>
                                    <option value="" disabled>Select Favorite NFL Team</option>
                                    {nflTeams.map(team => (
                                        <option key={team} value={team}>{team}</option>
                                    ))}
                                </select>
                                <select className="file-button" onChange={handleSelectFavoriteNBATeam}
                                        style={{ marginBottom: '20px', width: '300px' }} value={userInfo.favoriteNBATeam}>
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