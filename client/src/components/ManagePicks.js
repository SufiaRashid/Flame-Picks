import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';
import { useSort } from '@table-library/react-table-library/sort';
import BaseLayout from './BaseLayout';

const adjustDateForEasternTime = (gameDate, gameTime) => {
  const [day, month] = gameDate.split('/');
  let [hour, minute] = gameTime.match(/(\d+):(\d+)(am|pm)/).slice(1, 3);
  hour = parseInt(hour);
  minute = parseInt(minute);
  const isPM = gameTime.includes('pm');
  if (isPM && hour < 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;
  const londonDate = new Date(Date.UTC(new Date().getFullYear(), month - 1, day, hour, minute));
  const easternDate = new Date(londonDate.getTime() - 5 * 60 * 60 * 1000);
  const adjustedDate = easternDate.getUTCHours() < 5 ?
    new Date(easternDate.getTime() - 24 * 60 * 60 * 1000) : easternDate;
  return `${String(adjustedDate.getUTCMonth() + 1).padStart(2, '0')}/${String(adjustedDate.getUTCDate()).padStart(2, '0')}`;
};

const ManagePicks = () => {
  const [nodes, setNodes] = useState([]);
  const [games, setGames] = useState([]);
  const theme = useTheme(getTheme());
  const [isLoading, setIsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState(new Set());

  useEffect(() => {
    fetchGamesAndPicks();
  }, []);
  const fetchGamesAndPicks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const gamesResponse = await axios.get('http://localhost:5001/data/get-games');
      const fetchedGames = gamesResponse.data;
  
      const picksResponse = await axios.get('http://localhost:5001/user/get-picks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const enrichedPicks = picksResponse.data.map((pick) => {
        const game = fetchedGames.find((g) => g.game_id === pick.game_id);
        const gameDateAdjusted = game ? adjustDateForEasternTime(game.date, game.time) : 'Unknown Date';
        return {
          id: pick.id,
          ...pick,
          pick_time: new Date(pick.pick_time),
          game: game ? `${game.home_team.toUpperCase()} vs ${game.away_team.toUpperCase()}` : 'Unknown Game',
          gameDate: gameDateAdjusted,
        };
      });
  
      setNodes(enrichedPicks);
      setGames(fetchedGames);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sort = useSort(
    { nodes },
    {
      onChange: onSortChange,
    },
    {
      sortFns: {
        GAME: (array) => array.sort((a, b) => a.game.localeCompare(b.game)),
        PICKED_TEAM: (array) => array.sort((a, b) => a.picked_team.localeCompare(b.picked_team)),
        PICK_TIME: (array) => array.sort((a, b) => new Date(a.pick_time) - new Date(b.pick_time)),
        RESULT: (array) => array.sort((a, b) => (a.result !== null ? a.result - b.result : -1)),
      },
    }
  );

  function onSortChange(action, state) {
    console.log(action, state);
  }


  const deletePick = async (id) => {
    setDeletingIds(prev => new Set(prev.add(id)));
    try {
      await axios.delete(`http://localhost:5001/data/delete-gamepick/${id}`);
      setNodes(prev => prev.filter(pick => pick.id !== id));
    } catch (error) {
      console.error('Error deleting pick:', error);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const COLUMNS = [
    { label: 'Sport', renderCell: (item) => item.sport },
    { label: 'Game', renderCell: (item) => item.game },
    {
        label: 'Game Date',
        renderCell: (item) => item.gameDate,
    },
    { label: 'Picked Team', renderCell: (item) => item.picked_team.toUpperCase() },
    {
      label: 'Pick Time',
      renderCell: (item) =>
        item.pick_time.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
    },
    {
      label: 'Result',
      renderCell: (item) =>
        item.result !== null ? (item.result === 1 ? 'Win' : 'Loss') : 'Pending',
    },
    {
      label: 'Action',
  renderCell: (item) => item.result === null ? (
    <button onClick={() => deletePick(item.id)} disabled={deletingIds.has(item.id)}>
      {deletingIds.has(item.id) ? 'Deleting...' : 'Delete'}
    </button>
  ) : null,
    },
  ];

  const data = { nodes };



  return (
    <BaseLayout>
      <div>
        <h2>Your Picks</h2>
        <CompactTable columns={COLUMNS} data={data} theme={theme} sort={sort} />
        {isLoading ? (
          <p>Loading picks...</p>
        ) : nodes.length === 0 ? (
          <p>You have not made any picks.</p>
        ) : null}
      </div>
    </BaseLayout>
  );
};

export default ManagePicks;
