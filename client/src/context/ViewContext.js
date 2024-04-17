import React, { createContext, useContext, useState, useEffect } from 'react';

const ViewContext = createContext();

export const useView = () => useContext(ViewContext);

export const ViewProvider = ({ children }) => {
    const [viewID, setViewID] = useState(localStorage.getItem('viewID') || '');

    useEffect(() => {
        localStorage.setItem('viewID', viewID);
    }, [viewID]);

    const updateViewID = (id) => {
        setViewID(id);
    };

    return (
        <ViewContext.Provider value={{ viewID, updateViewID }}>
            {children}
        </ViewContext.Provider>
    );
};