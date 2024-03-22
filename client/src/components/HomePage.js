import React, { useState, useEffect } from 'react';
import BaseLayout from './BaseLayout';
import axios from 'axios';

const rowStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '20px',
};

const buttonStyle = {
  margin: '0 10px',
  padding: '40px 5px',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#f0f0f0',
  outline: 'none',
  transition: 'background-color 0.3s',
  minWidth: '100px',
  maxWidth: '200px',
  flex: '1 1 auto',
};

const drawButtonStyle = {
  ...buttonStyle,
  flex: '0 1 auto',
  maxWidth: '130px',
};

const selectedButtonStyle = {
  ...buttonStyle,
  borderColor: '#007bff',
  backgroundColor: '#007bff',
  color: '#ffffff',
};

const selectedDrawButtonStyle = {
  ...drawButtonStyle,
  borderColor: '#007bff',
  backgroundColor: '#007bff',
  color: '#ffffff',
};

const MatchPick = ({ homeTeam, awayTeam }) => {
  const [pick, setPick] = useState(null);

  const versusStyle = {
    margin: '0 20px',
    fontWeight: 'bold',
    fontSize: '1rem',
    alignSelf: 'center',
  };
  const getTeamLogoPath = (teamName) => {
    return `/NBALogos/${teamName}.png`;
  };

  const logoStyle = {
    height: '100px',
    width: 'auto',
    marginRight: '10px',
    marginLeft: '10px', 
  };

  return (
    <div style={rowStyle}>
      <img src={getTeamLogoPath(homeTeam)} alt={homeTeam} style={{ ...logoStyle, marginRight: '10px' }} />
      <button
        onClick={() => setPick(homeTeam)}
        style={pick === homeTeam ? selectedButtonStyle : buttonStyle}
      >
        {homeTeam}
      </button>
      <div style={versusStyle}>VS.</div>
      <button
        onClick={() => setPick(awayTeam)}
        style={pick === awayTeam ? selectedButtonStyle : buttonStyle}
      >
        {awayTeam}
      </button>
      <img src={getTeamLogoPath(awayTeam)} alt={awayTeam} style={{ ...logoStyle, marginLeft: '10px' }} />
    </div>
  );
};

const makePicksButtonStyle = {
  padding: '20px 40px',
  fontSize: '1.2rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  border: 'none',
  borderRadius: '5px',
  backgroundColor: '#28a745',
  color: '#ffffff',
  margin: '30px auto',
  display: 'block',
  outline: 'none',
  transition: 'background-color 0.3s',
};

const HomePage = ({ isAuthenticated, user }) => {
  const [eventsByDate, setEventsByDate] = useState({});

  useEffect(() => {
    const fetchAndGroupEventsByDate = async () => {
      try {
        const response = await axios.get('http://localhost:5001/get-events');
        if (Array.isArray(response.data)) {
          const groupedEvents = response.data.reduce((acc, event) => {
            acc[event.date] = acc[event.date] || [];
            acc[event.date].push(event);
            return acc;
          }, {});

          setEventsByDate(groupedEvents);
        } else {
          console.error('Event data is not in the expected array format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchAndGroupEventsByDate();
  }, []);

  const handleMakePicks = () => {
    // Implement this soon
  };

  return (
    <BaseLayout isAuthenticated={isAuthenticated} user={user}>
      <h5 align="center" style={{ color: 'rgb(43, 57, 55)', marginBottom: '40px' }}>
        Gameweek - Make Your Picks!
      </h5>
      {Object.keys(eventsByDate).length > 0 ? (
        Object.entries(eventsByDate).map(([date, events], index) => (
          <div key={index}>
            <h3 style={{ textAlign: 'center', marginTop: '20px' }}>{date}</h3>
            {events.map((event, eventIndex) => (
              <MatchPick
                key={eventIndex}
                homeTeam={event.home_team.toUpperCase()}
                awayTeam={event.away_team.toUpperCase()}
              />
            ))}
          </div>
        ))
      ) : (
        <p>Loading event details...</p>
      )}
      <button style={makePicksButtonStyle} onClick={handleMakePicks}>
        Make Picks
      </button>
    </BaseLayout>
  );
};


export default HomePage;
