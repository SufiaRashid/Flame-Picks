import React, { useEffect } from 'react';
import BaseLayout from './BaseLayout';
import "../App.css"

const Leaderboard = () => {
    useEffect(() => {
        document.body.classList.add("leaderboard-page-bg");

        return () => {
            document.body.classList.remove("leaderboard-page-bg");
        };
    }, []);

    return (
        <BaseLayout>
            <div>
                <h5 align="center" style={{ color: 'rgb(43, 57, 55)' }}>
                    Flame Picks Leaderboard Page
                </h5>
                {/* Leaderboard content goes here */}
            </div>
        </BaseLayout>
    );
};

export default Leaderboard;
