import React, { useEffect } from 'react';
import BaseLayout from './BaseLayout';
import "../App.css"

const AccountPage = () => {
    useEffect(() => {
        document.body.classList.add("account-page-bg");

        return () => {
            document.body.classList.remove("account-page-bg");
        };
    }, []);

    return (
        <BaseLayout>
            <div>
                <h5 align="center" style={{ color: 'rgb(43, 57, 55)' }}>
                    Flame Picks Account Info Page
                </h5>
                {/* Account-specific content goes here */}
            </div>
        </BaseLayout>
    );
};

export default AccountPage;
