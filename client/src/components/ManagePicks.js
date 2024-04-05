import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CompactTable } from '@table-library/react-table-library/compact';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';
import { useSort } from '@table-library/react-table-library/sort';
import BaseLayout from './BaseLayout';

const ManagePicks = () => {
  const [nodes, setNodes] = useState([]);
  const [games, setGames] = useState([]);
  const theme = useTheme(getTheme());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGamesAndPicks = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('token');
          const gamesResponse = await axios.get('http://localhost:5001/data/get-games');
          setGames(gamesResponse.data);
  
          const picksResponse = await axios.get('http://localhost:5001/user/get-picks', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const enrichedPicks = picksResponse.data.map((pick) => {
            const game = gamesResponse.data.find((game) => game.game_id === pick.game_id);
            const gameDateConverted = game ? game.date.split('/').reverse().join('/') : 'Unknown Date';
            return {
              ...pick,
              pick_time: new Date(pick.pick_time),
              game: game ? `${game.home_team.toUpperCase()} vs. ${game.away_team.toUpperCase()}` : 'Unknown Game',
              gameDate: gameDateConverted,
            };
          });
  
          setNodes(enrichedPicks);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching data:', error);
          setIsLoading(false);
        }
      };
  
      fetchGamesAndPicks();
    }, []);

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

  const COLUMNS = [
    { label: 'Sport', renderCell: () => 'NBA' },
    { label: 'Game', renderCell: (item) => item.game },
    {
        label: 'Game Date',
        renderCell: (item) => item.gameDate,
    },
    { label: 'Picked Team', renderCell: (item) => item.picked_team },
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
  ];

  const data = { nodes };



  return (
    <BaseLayout>
        <div>
            <h2>Your Picks</h2>
            <CompactTable columns={COLUMNS} data={data} theme={theme} sort={sort} />
            {isLoading && <p>Loading picks...</p>}
        </div>
    </BaseLayout>
  );
};

export default ManagePicks;
