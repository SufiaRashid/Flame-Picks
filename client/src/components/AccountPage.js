import React, { useEffect, useState } from 'react';
import BaseLayout from './BaseLayout';
import "../App.css"

const AccountPage = () => {
    // State to hold user information
    const [userInfo, setUserInfo] = useState({
        username: 'JohnDoe',
        profilePicture: 'https://example.com/profile.jpg', // Default profile picture URL
        points: 100 // Default points value
    });

    // useEffect to update the document body background
    useEffect(() => {
        document.body.classList.add("account-page-bg");

        return () => {
            document.body.classList.remove("account-page-bg");
        };
    }, []);

    // Function to handle profile picture change
    const handleProfilePictureChange = (e) => {
        // Logic to handle image upload and update profile picture
        // For simplicity, let's just update the state with a new URL
        setUserInfo({
            ...userInfo,
            profilePicture: URL.createObjectURL(e.target.files[0])
        });
    };

    return (
        <BaseLayout>
            <div>
                <h5 align="center" style={{ color: 'rgb(43, 57, 55)' }}>
                    Flame Picks Account Info Page
                </h5>
                <div className="user-info-container">
                    <img src={userInfo.profilePicture} alt="Profile" className="profile-picture" />
                    <div className="user-details">
                        <p>Username: {userInfo.username}</p>
                        <p>Points: {userInfo.points}</p>
                        {/* Add other account-specific information here */}
                    </div>
                </div>
                <div className="profile-picture-upload">
                    <input type="file" accept="image/*" onChange={handleProfilePictureChange} />
                    {/* Add a button or message to confirm profile picture upload */}
                </div>
            </div>
        </BaseLayout>
    );
};

export default AccountPage;
