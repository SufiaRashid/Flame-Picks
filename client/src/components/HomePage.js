import React, { useState, useEffect } from 'react';
import BaseLayout from './BaseLayout';
import axios from 'axios';
import { useAuth } from "../context/AuthContext";

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
    setPick(pick === team ? null : team);
    onPickSelected(pick === team ? null : team, gameid);
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
  const { authData} = useAuth();
  const [eventsByDate, setEventsByDate] = useState({});
  const [gameVisibility, setGameVisibility] = useState({});
  const [picks, setPicks] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingStatus, setSubmittingStatus] = useState({});


  useEffect(() => {
    const fetchAndGroupEventsByDate = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error('No authentication token found');
          return;
        }
  
        const eventsPromise = axios.get('http://localhost:5001/data/get-games');
        const picksPromise = axios.get('http://localhost:5001/user/get-picks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("waiting...")
  
        const [eventsResponse, picksResponse] = await Promise.all([eventsPromise, picksPromise]);
        console.log('done')
  
        const events = eventsResponse.data;
        const userPicks = new Set(picksResponse.data.map(pick => pick.game_id));
  
        const currentDate = new Date();
        currentDate.setMinutes(currentDate.getMinutes());
        console.log(currentDate)
  
        // TOGGLE WHEN TESTING
        const filteredAndGroupedEvents = events
          .filter(event => !userPicks.has(event.game_id))
          .filter(event => {
            const [day, month] = event.date.split('/').map(Number);
            const hours = event.time.includes('pm') ? parseInt(event.time) + 12 : parseInt(event.time);
            const gameDate = new Date(Date.UTC(currentDate.getFullYear(), month - 1, day, hours));
            return gameDate >= currentDate;
          })
          .reduce((acc, event) => {
            const dateParts = event.date.split('/').map(Number);
            const timeParts = event.time.match(/(\d+):(\d+)(am|pm)/);
            let hour = Number(timeParts[1]);
            if (timeParts[3] === 'pm' && hour !== 12) hour += 12;
            if (timeParts[3] === 'am' && hour === 12) hour = 0;
            const gameDate = new Date(Date.UTC(currentDate.getFullYear(), dateParts[1] - 1, dateParts[0], hour));
            gameDate.setHours(gameDate.getHours() - 4);
            const adjustedDate = `${gameDate.getDate().toString().padStart(2, '0')}/${(gameDate.getMonth() + 1).toString().padStart(2, '0')}`;
  
            acc[adjustedDate] = acc[adjustedDate] || [];
            acc[adjustedDate].push({
              ...event,
              adjustedDate
            });
            return acc;
          }, {});


          /*  TOGGLE WHEN TESTING
          const filteredAndGroupedEvents = events
          .filter(event => {
            const [day, month] = event.date.split('/').map(Number);
            const hours = event.time.includes('pm') ? parseInt(event.time) + 12 : parseInt(event.time);
            const gameDate = new Date(Date.UTC(currentDate.getFullYear(), month - 1, day, hours));
            return gameDate >= currentDate;
          })
          .reduce((acc, event) => {
            const dateParts = event.date.split('/').map(Number);
            const timeParts = event.time.match(/(\d+):(\d+)(am|pm)/);
            let hour = Number(timeParts[1]);
            if (timeParts[3] === 'pm' && hour !== 12) hour += 12;
            if (timeParts[3] === 'am' && hour === 12) hour = 0;
            const gameDate = new Date(Date.UTC(currentDate.getFullYear(), dateParts[1] - 1, dateParts[0], hour));
            gameDate.setHours(gameDate.getHours() - 4);
            const adjustedDate = `${gameDate.getDate().toString().padStart(2, '0')}/${(gameDate.getMonth() + 1).toString().padStart(2, '0')}`;
  
            acc[adjustedDate] = acc[adjustedDate] || [];
            acc[adjustedDate].push({
              ...event,
              adjustedDate
            });
            return acc;
          }, {});*/
  
        setEventsByDate(filteredAndGroupedEvents);

        const initialGameVisibility = Object.keys(filteredAndGroupedEvents).reduce((acc, date) => {
          acc[date] = filteredAndGroupedEvents[date].reduce((acc, game) => {
            acc[game.game_id] = true;
            return acc;
          }, {});
          return acc;
        }, {});
    
        setGameVisibility(initialGameVisibility);
        
      } catch (error) {
        console.error('Error fetching events or user picks:', error);
      }
      setLoading(false);
    };
  
    fetchAndGroupEventsByDate();

  }, []);

  const handleMakePicksForDate = async (date) => {
    setSubmittingStatus(prev => ({ ...prev, [date]: true }));
    const token = localStorage.getItem("token");
    if (!token) {
      console.error('No authentication token found');
      setSubmittingStatus(prev => ({ ...prev, [date]: false }));
      return;
    }
  
    const datePicks = picks[date];
    if (!datePicks || datePicks.length === 0) {
      console.error('No picks to submit for this date:', date);
      setSubmittingStatus(prev => ({ ...prev, [date]: false }));
      return;
    }
  
    console.log('Submitting picks for game IDs:', datePicks.map(pick => pick.gameid));
  
    const postData = datePicks.map(pick => ({
      game_id: pick.gameid,
      sport: 'NBA',
      picked_team: pick.team,
    }));
  
    try {
      const response = await axios.post('http://localhost:5001/user/make-pick', postData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    
      console.log('Response from make pick:', response.data);
      setPicks(prev => {
        const newPicks = { ...prev };
        delete newPicks[date];
        return newPicks;
      });
      setGameVisibility(prev => {
        const newVisibility = { ...prev };
        datePicks.forEach(pick => {
          if (newVisibility[date]) {
            newVisibility[date][pick.gameid] = false;
          }
        });
        return newVisibility;
      });
    } catch (error) {
      console.error('Error submitting picks:', error);
    }
    finally {
      setSubmittingStatus(prev => ({ ...prev, [date]: false }));
    }
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
      {loading ? (
        <p>Loading event details...</p>
      ) : Object.keys(eventsByDate).length > 0 ? (
        sortDates(Object.keys(eventsByDate)).map((date, index) => {
          const gamesForDate = eventsByDate[date].filter(game => gameVisibility[date]?.[game.game_id]);
          return gamesForDate.length > 0 ? (
            <div key={index} style={{ transition: 'opacity 0.3s, height 0.3s', opacity: 1, overflow: 'hidden' }}>
              <h3 style={{ textAlign: 'center', marginTop: '20px' }}>{formatDate(date)}</h3>
              {gamesForDate.map((event, eventIndex) => (
                <MatchPick
                  key={eventIndex}
                  homeTeam={event.home_team.toUpperCase()}
                  awayTeam={event.away_team.toUpperCase()}
                  gameid={event.game_id}
                  onPickSelected={(team, gameid) => {
                    setPicks(currentPicks => {
                      const updatedPicks = currentPicks[date] ? currentPicks[date].filter(p => p.gameid !== gameid) : [];
                      if (team) {
                        updatedPicks.push({ gameid, team });
                      }
                      return {
                        ...currentPicks,
                        [date]: updatedPicks,
                      };
                    });
                  }}
                />
              ))}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                <button
                  style={makePicksButtonStyle}
                  onClick={() => handleMakePicksForDate(date)}
                  disabled={submittingStatus[date]}
                  >
                  {submittingStatus[date] ? 'Submitting...' : 'Make Picks'}
                </button>
              </div>
            </div>
          ) : null;
        })
      ) : (
        <div align="center">
          <img src={`/HomePage/ballincat.jpg`} alt="All Picks Made" style={{ width: '200px', height: 'auto' }} />
          <p style={{ fontSize: '1.5rem' }}>Sorry, {authData.user?.firstName}. You have already made all NBA picks for this week.</p>
        </div>
      )}
    </BaseLayout>
  );
};


export default HomePage;
