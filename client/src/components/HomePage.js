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

const MatchPick = ({ homeTeam, awayTeam, gameid, onPickSelected }) => {
  const [pick, setPick] = useState(null);

  const handlePick = (team) => {
    setPick(team);
    onPickSelected(team, gameid);
  };

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
        onClick={() => handlePick(homeTeam)}
        style={pick === homeTeam ? selectedButtonStyle : buttonStyle}
      >
        {homeTeam}
      </button>
      <div style={versusStyle}>VS.</div>
      <button
        onClick={() => handlePick(awayTeam)}
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

//will implement later
const skipButtonStyle = {
  padding: '10px 20px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  border: '1px solid #ccc',
  borderRadius: '5px',
  backgroundColor: '#ffffff',
  color: '#000000',
  marginLeft: '10px',
  outline: 'none',
  transition: 'opacity 0.3s',
};

const HomePage = ({ isAuthenticated, user }) => {
  const [eventsByDate, setEventsByDate] = useState({});
  const [visibleDates, setVisibleDates] = useState({});
  const [dismissedDates, setDismissedDates] = useState({});
  const [picks, setPicks] = useState({});

  useEffect(() => {
    const fetchAndGroupEventsByDate = async () => {
      try {
        const response = await axios.get('http://localhost:5001/get-events');
        if (Array.isArray(response.data)) {
          const adjustDateForEasternTime = (date, time) => {
            if (!time) return date;
          
            const dateParts = date.split('/').map(Number);
            const timeParts = time.match(/(\d+):(\d+)(am|pm)/);
          
            if (!timeParts) return date;
          
            let hour = Number(timeParts[1]);
          
            if (timeParts[3] === 'pm' && hour !== 12) hour += 12;
            if (timeParts[3] === 'am' && hour === 12) hour = 0;
          
            const gameDate = new Date(Date.UTC(2022, dateParts[1] - 1, dateParts[0], hour));
            gameDate.setHours(gameDate.getHours() - 4);
          
            const adjustedMonth = (gameDate.getMonth() + 1).toString().padStart(2, '0');
            const adjustedDay = gameDate.getDate().toString().padStart(2, '0');

            return `${adjustedDay}/${adjustedMonth}`;
          };
          

          const currentDate = new Date();
          currentDate.setMinutes(currentDate.getMinutes() + currentDate.getTimezoneOffset());
          
          const isAfterCurrentDate = (date, time) => {
            const [day, month] = date.split('/').map(Number);
            const [hours, minutes] = time.endsWith('pm') ?
              [12 + parseInt(time), 0] :
              time.split(':').map((t, i) => i === 0 ? parseInt(t) % 12 : parseInt(t));
            
            const gameDate = new Date(Date.UTC(currentDate.getFullYear(), month - 1, day, hours, minutes));
            return gameDate > currentDate;
          };

          const filteredAndGroupedEvents = response.data
            .filter(event => isAfterCurrentDate(event.date, event.time))
            .reduce((acc, event) => {
              const adjustedDate = adjustDateForEasternTime(event.date, event.time);
              acc[adjustedDate] = acc[adjustedDate] || [];
              acc[adjustedDate].push(event);
              return acc;
            }, {});

          setEventsByDate(filteredAndGroupedEvents);
          setVisibleDates(filteredAndGroupedEvents);
        } else {
          console.error('Event data is not in the expected array format:', response.data);
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchAndGroupEventsByDate();
  }, []);

  const handleMakePicksForDate = async (date) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    const datePicks = picks[date];
    if (!datePicks) {
      console.error('No picks to submit for this date:', date);
      return;
    }

    console.log('Submitting picks for game IDs:', datePicks.map(pick => pick.gameid));

    const postData = datePicks.map(pick => ({
      game_id: pick.gameid,
      picked_team: pick.team,
    }));

    try {
      const response = await axios.post('http://localhost:5001/make-pick', postData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    
      console.log('Response from make pick:', response.data);
    } catch (error) {
      console.error('Error submitting picks:', error);
    }
    handleDismissDate(date);
  };

  const handleDismissDate = (date) => {
    setDismissedDates(prev => ({ ...prev, [date]: 'fading' }));
  
    setTimeout(() => {
      setDismissedDates(prev => ({ ...prev, [date]: 'collapsed' }));
  
      setTimeout(() => {
        setVisibleDates(prevDates => {
          const newDates = { ...prevDates };
          delete newDates[date];
          return newDates;
        });
      }, 300);
    }, 300);
  };


  const formatDate = (dateString) => {
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    const [day, month] = dateString.split('/').map(Number);
    return `${months[month - 1]} ${day}`;
  };

  const sortDates = (dates) => {
    return dates.sort((a, b) => {
      const [dayA, monthA] = a.split('/');
      const [dayB, monthB] = b.split('/');
      const dateA = new Date(`2022-${monthA}-${dayA}`);
      const dateB = new Date(`2022-${monthB}-${dayB}`);
      return dateA - dateB;
    });
  };

  return (
    <BaseLayout isAuthenticated={isAuthenticated} user={user}>
      <h5 align="center" style={{ color: 'rgb(43, 57, 55)', marginBottom: '40px', fontSize: '2.5rem' }}>
        This Week's NBA Picks
      </h5>
      {Object.keys(eventsByDate).length > 0 ? (
        sortDates(Object.keys(eventsByDate)).map((date, index) => (
          <div key={index}
          style={{
            transition: 'opacity 0.3s, height 0.3s',
            opacity: dismissedDates[date] === 'fading' ? 0 : 1,
            height: dismissedDates[date] === 'collapsed' ? 0 : 'auto',
            overflow: 'hidden',
          }}
          >
            <h3 style={{ textAlign: 'center', marginTop: '20px' }}>{formatDate(date)}</h3>
            {eventsByDate[date].map((event, eventIndex) => (
              <MatchPick
                key={eventIndex}
                homeTeam={event.home_team.toUpperCase()}
                awayTeam={event.away_team.toUpperCase()}
                gameid={event.game_id}
                onPickSelected={(team, gameid) => {
                  setPicks(currentPicks => ({
                    ...currentPicks,
                    [date]: [...(currentPicks[date] || []), { gameid, team }] 
                  }));
                }}
              />
            ))}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
            <button
                style={makePicksButtonStyle}
                onClick={() => handleMakePicksForDate(date)}
            >
            Make Picks
            </button>
            </div>
            </div>
        ))
      ) : (
        <p>Loading event details...</p>
      )}
    </BaseLayout>
  );
};


export default HomePage;
