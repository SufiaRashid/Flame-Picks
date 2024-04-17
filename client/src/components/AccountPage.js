import React, { useEffect, useState } from 'react';
import BaseLayout from './BaseLayout';
import "../App.css";
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AccountPage = () => {
    const { authData} = useAuth();
    const [userInfo, setUserInfo] = useState({
        username: authData.user?.firstName + " " + authData.user?.lastName,
        profilePicture: '',
        points: authData.user?.score, // Default points value
        favoriteNFLTeam: '', // Default favorite NFL team
        favoriteNBATeam: '' // Default favorite NBA team
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        console.log("In use effect with loading as ", loading)
        const fetchUserInfo = async () => {
            console.log("in fetchUserInfo")
            const token = localStorage.getItem('token');
            try {
                const info = await axios.get('http://localhost:5001/user/get-profile-info', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                console.log(info.data);
                setUserInfo(prevUserInfo => ({...prevUserInfo, profilePicture: info.data.profile_picture, points: info.data.score, favoriteNFLTeam: info.data.favorite_nfl_team, favoriteNBATeam: info.data.favorite_nba_team}));
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchUserInfo();
    }, []);

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

    const UserProfilePicture = ({ base64String }) => {
        if (!base64String) {
          return (
            <img src="default.jpg" alt="User Profile" />
          );
        }
        const imageSrc = base64String ? `data:image/jpeg;base64,${base64String}` : 'path_to_placeholder_image.jpg';
      
        return (
          <img src={imageSrc} alt="User Profile" />
        );
      };

    return (
        <BaseLayout>
            <div className="account-page">
                <div className="user-info-box">
                    <div className="profile-section">
                        {loading ? (
                            <p>Loading profile pic...</p>
                        ) : (
                            <UserProfilePicture base64String={userInfo.profilePicture}
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
                        )}

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