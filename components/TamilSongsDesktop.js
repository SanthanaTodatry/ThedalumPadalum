import { useState, useMemo, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { Search, RotateCcw, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Monitor } from 'lucide-react';
import YouTubePlayer from './YouTubePlayer';

const TamilSongsVisualization = () => {
  // Mock data for Tamil movie songs
  const songsData = [
    { id: 1, movie: 'Enthiran', year: 2010, song: 'Kadhal Anukkal', composer: 'A.R. Rahman', singer: 'Naresh Iyer', lyricist: 'Vairamuthu' },
    { id: 2, movie: 'Rockstar', year: 2011, song: 'Sadda Haq', composer: 'A.R. Rahman', singer: 'Mohit Chauhan', lyricist: 'Irshad Kamil' },
    { id: 3, movie: 'Slumdog Millionaire', year: 2008, song: 'Jai Ho', composer: 'A.R. Rahman', singer: 'A.R. Rahman', lyricist: 'Gulzar' },
    { id: 4, movie: '127 Hours', year: 2010, song: 'If I Rise', composer: 'A.R. Rahman', singer: 'Dido', lyricist: 'Rollo Armstrong' },
    { id: 5, movie: 'Rangasthalam', year: 2018, song: 'Yentha Sakkagunnave', composer: 'Devi Sri Prasad', singer: 'Sid Sriram', lyricist: 'Chandrabose' },
    { id: 6, movie: 'Baahubali', year: 2015, song: 'Dheevara', composer: 'M.M. Keeravani', singer: 'Kailash Kher', lyricist: 'Chaitanya Prasad' },
    { id: 7, movie: 'Pushpa', year: 2021, song: 'Srivalli', composer: 'Devi Sri Prasad', singer: 'Javed Ali', lyricist: 'Chandrabose' },
    { id: 8, movie: 'KGF Chapter 1', year: 2018, song: 'Gali Gali', composer: 'Ravi Basrur', singer: 'Mohan Krishna', lyricist: 'Bharathi Pradhan' },
    { id: 9, movie: 'Arjun Reddy', year: 2017, song: 'Emitemitemo', composer: 'Radhan', singer: 'Sid Sriram', lyricist: 'Shree Mani' },
    { id: 10, movie: 'Master', year: 2021, song: 'Kutti Story', composer: 'Anirudh Ravichander', singer: 'Anirudh Ravichander', lyricist: 'Arunraja Kamaraj' },
    { id: 11, movie: 'Bigil', year: 2019, song: 'Marana Mass', composer: 'A.R. Rahman', singer: 'Anirudh Ravichander', lyricist: 'Vivek' },
    { id: 12, movie: 'RRR', year: 2022, song: 'Naatu Naatu', composer: 'M.M. Keeravani', singer: 'Rahul Sipligunj', lyricist: 'Chandrabose' },
    { id: 13, movie: 'Kabir Singh', year: 2019, song: 'Bekhayali', composer: 'Sachet-Parampara', singer: 'Sachet Tandon', lyricist: 'Irshad Kamil' },
    { id: 14, movie: 'Geetha Govindam', year: 2018, song: 'Inkem Inkem Kavale', composer: 'Gopi Sundar', singer: 'Sid Sriram', lyricist: 'Ananta Sriram' },
    { id: 15, movie: 'Jersey', year: 2019, song: 'Adhento Gaani Vunnapaatuga', composer: 'Anirudh Ravichander', singer: 'Sid Sriram', lyricist: 'Krishna Kanth' },
    { id: 16, movie: 'Mahanati', year: 2018, song: 'Mooga Manasulu', composer: 'Mickey J Meyer', singer: 'Sid Sriram', lyricist: 'Sirivennela Seetharama Sastry' },
    { id: 17, movie: 'Soorarai Pottru', year: 2020, song: 'Veyyon Silli', composer: 'G.V. Prakash Kumar', singer: 'Sid Sriram', lyricist: 'Snehan' },
    { id: 18, movie: 'Beast', year: 2022, song: 'Arabic Kuthu', composer: 'Anirudh Ravichander', singer: 'Anirudh Ravichander', lyricist: 'Sivakarthikeyan' },
    { id: 19, movie: 'Varisu', year: 2023, song: 'Ranjithame', composer: 'Thaman S', singer: 'Vijay', lyricist: 'Viveka' },
    { id: 20, movie: 'Leo', year: 2023, song: 'Naa Ready', composer: 'Anirudh Ravichander', singer: 'Thalapathy Vijay', lyricist: 'Super Subu' }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedComposers, setSelectedComposers] = useState([]);
  const [selectedSingers, setSelectedSingers] = useState([]);
  const [selectedLyricists, setSelectedLyricists] = useState([]);
  const [activeFilterTab, setActiveFilterTab] = useState('years');
  const [chartFilters, setChartFilters] = useState({
    year: null,
    singer: null,
    composer: null,
    lyricist: null
  });

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [showEmbedPlayer, setShowEmbedPlayer] = useState(false);

  // Filter functions
  const toggleFilter = (item, selectedItems, setSelectedItems) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedYears([]);
    setSelectedComposers([]);
    setSelectedSingers([]);
    setSelectedLyricists([]);
    setActiveFilterTab('years');
    setChartFilters({
      year: null,
      singer: null,
      composer: null,
      lyricist: null
    });
  };

  // Get unique values
  const uniqueYears = [...new Set(songsData.map(song => song.year))].sort();
  const uniqueComposers = [...new Set(songsData.map(song => song.composer))].sort();
  const uniqueSingers = [...new Set(songsData.map(song => song.singer))].sort();
  const uniqueLyricists = [...new Set(songsData.map(song => song.lyricist))].sort();

  // Filtered data
  const filteredSongs = useMemo(() => {
    return songsData.filter(song => {
      let matchesSearch = true;
      if (searchTerm.trim()) {
        const searchTerms = searchTerm.split(/[,\s]+/).filter(term => term.length > 0);
        matchesSearch = searchTerms.every(term => 
          song.movie.toLowerCase().includes(term.toLowerCase()) ||
          song.song.toLowerCase().includes(term.toLowerCase()) ||
          song.composer.toLowerCase().includes(term.toLowerCase()) ||
          song.singer.toLowerCase().includes(term.toLowerCase()) ||
          song.lyricist.toLowerCase().includes(term.toLowerCase())
        );
      }
      
      const matchesYear = selectedYears.length === 0 || selectedYears.includes(song.year);
      const matchesComposer = selectedComposers.length === 0 || selectedComposers.includes(song.composer);
      const matchesSinger = selectedSingers.length === 0 || selectedSingers.includes(song.singer);
      const matchesLyricist = selectedLyricists.length === 0 || selectedLyricists.includes(song.lyricist);

      const matchesChartYear = !chartFilters.year || song.year === chartFilters.year;
      const matchesChartSinger = !chartFilters.singer || song.singer === chartFilters.singer;
      const matchesChartComposer = !chartFilters.composer || song.composer === chartFilters.composer;
      const matchesChartLyricist = !chartFilters.lyricist || song.lyricist === chartFilters.lyricist;

      return matchesSearch && matchesYear && matchesComposer && matchesSinger && matchesLyricist &&
             matchesChartYear && matchesChartSinger && matchesChartComposer && matchesChartLyricist;
    });
  }, [searchTerm, selectedYears, selectedComposers, selectedSingers, selectedLyricists, chartFilters]);

  // Chart data preparation
  const yearData = useMemo(() => {
    const yearCounts = {};
    filteredSongs.forEach(song => {
      yearCounts[song.year] = (yearCounts[song.year] || 0) + 1;
    });
    return Object.entries(yearCounts)
      .map(([year, count]) => ({ year: parseInt(year), count }))
      .sort((a, b) => a.year - b.year);
  }, [filteredSongs]);

  const singerData = useMemo(() => {
    const singerCounts = {};
    filteredSongs.forEach(song => {
      singerCounts[song.singer] = (singerCounts[song.singer] || 0) + 1;
    });
    return Object.entries(singerCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredSongs]);

  const composerData = useMemo(() => {
    const composerCounts = {};
    filteredSongs.forEach(song => {
      composerCounts[song.composer] = (composerCounts[song.composer] || 0) + 1;
    });
    return Object.entries(composerCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredSongs]);

  const lyricistData = useMemo(() => {
    const lyricistCounts = {};
    filteredSongs.forEach(song => {
      lyricistCounts[song.lyricist] = (lyricistCounts[song.lyricist] || 0) + 1;
    });
    return Object.entries(lyricistCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredSongs]);

  // Chart click handlers
  const handleYearClick = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const year = data.activePayload[0].payload.year;
      setChartFilters(prev => ({ 
        ...prev, 
        year: prev.year === year ? null : year 
      }));
    }
  };

  const handleSingerClick = (data) => {
    const singer = data?.name;
    setChartFilters(prev => ({ 
      ...prev, 
      singer: prev.singer === singer ? null : singer 
    }));
  };

  const handleComposerClick = (data) => {
    const composer = data?.name;
    setChartFilters(prev => ({ 
      ...prev, 
      composer: prev.composer === composer ? null : composer 
    }));
  };

  const handleLyricistClick = (data) => {
    const lyricist = data?.name;
    setChartFilters(prev => ({ 
      ...prev, 
      lyricist: prev.lyricist === lyricist ? null : lyricist 
    }));
  };

  const handleSingerLegendClick = (data) => {
    const singer = data?.value;
    setChartFilters(prev => ({ 
      ...prev, 
      singer: prev.singer === singer ? null : singer 
    }));
  };

  const handleComposerLegendClick = (data) => {
    const composer = data?.value;
    setChartFilters(prev => ({ 
      ...prev, 
      composer: prev.composer === composer ? null : composer 
    }));
  };

  const handleLyricistLegendClick = (data) => {
    const lyricist = data?.value;
    setChartFilters(prev => ({ 
      ...prev, 
      lyricist: prev.lyricist === lyricist ? null : lyricist 
    }));
  };

  // Sorted songs for display
  const sortedFilteredSongs = useMemo(() => {
    return [...filteredSongs].sort((a, b) => a.song.localeCompare(b.song));
  }, [filteredSongs]);

  // Current playlist based on filters
  const currentPlaylist = useMemo(() => {
    return isShuffled 
      ? [...sortedFilteredSongs].sort(() => Math.random() - 0.5)
      : sortedFilteredSongs;
  }, [sortedFilteredSongs, isShuffled]);

  const currentSong = currentPlaylist[currentSongIndex] || null;

  // Audio control functions
  const openSong = (song) => {
    const query = `${song.song} ${song.movie} ${song.singer}`;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const togglePlay = () => {
    if (!currentSong) return;
    
    if (!showEmbedPlayer) {
      // If embed player is not shown, open in new tab
      openSong(currentSong);
      setIsPlaying(true);
    } else {
      // If embed player is shown, it will handle play/pause
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    if (currentPlaylist.length === 0) return;
    const nextIndex = (currentSongIndex + 1) % currentPlaylist.length;
    setCurrentSongIndex(nextIndex);
  };

  const playPrevious = () => {
    if (currentPlaylist.length === 0) return;
    const prevIndex = currentSongIndex === 0 ? currentPlaylist.length - 1 : currentSongIndex - 1;
    setCurrentSongIndex(prevIndex);
  };

  // Reset current song index when playlist changes
  useEffect(() => {
    if (currentSongIndex >= currentPlaylist.length && currentPlaylist.length > 0) {
      setCurrentSongIndex(0);
    }
  }, [currentPlaylist.length, currentSongIndex]);

  const SINGER_COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#6d28d9', '#7c2d12'];
  const COMPOSER_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#047857', '#065f46'];
  const LYRICIST_COLORS = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2', '#b91c1c', '#991b1b'];

  const FilterButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs rounded border transition-all ${
        active 
          ? 'bg-blue-600 text-white border-blue-600' 
          : 'bg-white text-blue-600 border-blue-300 hover:border-blue-500'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-light text-slate-700">
      {/* Title Header with Search */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-300 via-pink-300 to-white bg-clip-text text-transparent drop-shadow-lg animate-pulse">
          தேடலும் பாடலும்
        </h1>
        
        {/* Search in the middle */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:bg-white/30 transition-all"
              placeholder="Search songs, movies, artists... (comma/space separated)"
            />
          </div>
        </div>
        
        <div className="w-48"></div> {/* Spacer for balance */}
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Panel 1: Filters */}
        <div className="w-64 bg-white border-r border-blue-200 flex flex-col">
          <div className="p-4 border-b border-blue-200">
            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm mb-4"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Filters
            </button>

            {/* Filter Tabs - Match Graph Layout */}
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setActiveFilterTab('years')}
                className={`px-2 py-1.5 text-xs rounded transition-colors ${
                  activeFilterTab === 'years' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Years {selectedYears.length > 0 && `(${selectedYears.length})`}
              </button>
              <button
                onClick={() => setActiveFilterTab('singers')}
                className={`px-2 py-1.5 text-xs rounded transition-colors ${
                  activeFilterTab === 'singers' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Singers {selectedSingers.length > 0 && `(${selectedSingers.length})`}
              </button>
              <button
                onClick={() => setActiveFilterTab('composers')}
                className={`px-2 py-1.5 text-xs rounded transition-colors ${
                  activeFilterTab === 'composers' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Composers {selectedComposers.length > 0 && `(${selectedComposers.length})`}
              </button>
              <button
                onClick={() => setActiveFilterTab('lyricists')}
                className={`px-2 py-1.5 text-xs rounded transition-colors ${
                  activeFilterTab === 'lyricists' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                Lyricists {selectedLyricists.length > 0 && `(${selectedLyricists.length})`}
              </button>
            </div>
          </div>

          {/* Filter Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Years Tab */}
            {activeFilterTab === 'years' && (
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-3">Select Years</h3>
                <div className="flex flex-wrap gap-1">
                  {uniqueYears.map(year => (
                    <FilterButton
                      key={year}
                      active={selectedYears.includes(year)}
                      onClick={() => toggleFilter(year, selectedYears, setSelectedYears)}
                    >
                      {year}
                    </FilterButton>
                  ))}
                </div>
              </div>
            )}

            {/* Singers Tab */}
            {activeFilterTab === 'singers' && (
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-3">Select Singers</h3>
                <div className="flex flex-wrap gap-1">
                  {uniqueSingers.map(singer => (
                    <FilterButton
                      key={singer}
                      active={selectedSingers.includes(singer)}
                      onClick={() => toggleFilter(singer, selectedSingers, setSelectedSingers)}
                    >
                      {singer}
                    </FilterButton>
                  ))}
                </div>
              </div>
            )}

            {/* Composers Tab */}
            {activeFilterTab === 'composers' && (
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-3">Select Composers</h3>
                <div className="flex flex-wrap gap-1">
                  {uniqueComposers.map(composer => (
                    <FilterButton
                      key={composer}
                      active={selectedComposers.includes(composer)}
                      onClick={() => toggleFilter(composer, selectedComposers, setSelectedComposers)}
                    >
                      {composer}
                    </FilterButton>
                  ))}
                </div>
              </div>
            )}

            {/* Lyricists Tab */}
            {activeFilterTab === 'lyricists' && (
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-3">Select Lyricists</h3>
                <div className="flex flex-wrap gap-1">
                  {uniqueLyricists.map(lyricist => (
                    <FilterButton
                      key={lyricist}
                      active={selectedLyricists.includes(lyricist)}
                      onClick={() => toggleFilter(lyricist, selectedLyricists, setSelectedLyricists)}
                    >
                      {lyricist}
                    </FilterButton>
                  ))}
                </div>
              </div>
            )}

            {/* Active Chart Filters Display */}
            {(chartFilters.year || chartFilters.singer || chartFilters.composer || chartFilters.lyricist) && (
              <div className="mt-6 pt-4 border-t border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Chart Filters</h3>
                <div className="space-y-1 text-xs">
                  {chartFilters.year && (
                    <div className="flex items-center justify-between bg-blue-100 px-2 py-1 rounded">
                      <span>Year: {chartFilters.year}</span>
                      <button onClick={() => setChartFilters(prev => ({ ...prev, year: null }))} className="text-blue-600 hover:text-blue-800">×</button>
                    </div>
                  )}
                  {chartFilters.singer && (
                    <div className="flex items-center justify-between bg-blue-100 px-2 py-1 rounded">
                      <span>Singer: {chartFilters.singer}</span>
                      <button onClick={() => setChartFilters(prev => ({ ...prev, singer: null }))} className="text-blue-600 hover:text-blue-800">×</button>
                    </div>
                  )}
                  {chartFilters.composer && (
                    <div className="flex items-center justify-between bg-blue-100 px-2 py-1 rounded">
                      <span>Composer: {chartFilters.composer}</span>
                      <button onClick={() => setChartFilters(prev => ({ ...prev, composer: null }))} className="text-blue-600 hover:text-blue-800">×</button>
                    </div>
                  )}
                  {chartFilters.lyricist && (
                    <div className="flex items-center justify-between bg-blue-100 px-2 py-1 rounded">
                      <span>Lyricist: {chartFilters.lyricist}</span>
                      <button onClick={() => setChartFilters(prev => ({ ...prev, lyricist: null }))} className="text-blue-600 hover:text-blue-800">×</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Graphs */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Line Chart - Songs by Year */}
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-800 mb-4">Songs by Year (Click to filter)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={yearData} onClick={handleYearClick}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeWidth={0.5} />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={12} style={{ cursor: 'pointer' }} />
                  <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke={chartFilters.year ? "#dc2626" : "#2563eb"}
                    strokeWidth={chartFilters.year ? 2 : 1.5}
                    dot={{ fill: chartFilters.year ? "#dc2626" : "#2563eb", strokeWidth: 1, r: 3, cursor: 'pointer' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - Singers */}
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-800 mb-4">Top Singers (Click to filter)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={singerData}
                    cx="45%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={0.5}
                    onClick={handleSingerClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {singerData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={chartFilters.singer === entry.name ? "#dc2626" : SINGER_COLORS[index % SINGER_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="middle" 
                    align="right" 
                    layout="vertical"
                    wrapperStyle={{ 
                      fontSize: '12px', 
                      paddingLeft: '10px', 
                      cursor: 'pointer',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      borderRadius: '8px',
                      padding: '8px',
                      border: '1px solid #e5e7eb'
                    }}
                    onClick={handleSingerLegendClick}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - Composers */}
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-800 mb-4">Top Composers (Click to filter)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={composerData}
                    cx="45%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    strokeWidth={0.5}
                    onClick={handleComposerClick}
                    style={{ cursor: 'pointer' }}
                  >
                    {composerData.map((entry, index) => (
                     <Cell 
                       key={`cell-${index}`} 
                       fill={chartFilters.composer === entry.name ? "#dc2626" : COMPOSER_COLORS[index % COMPOSER_COLORS.length]} 
                     />
                   ))}
                 </Pie>
                 <Legend 
                   verticalAlign="middle" 
                   align="right" 
                   layout="vertical"
                   wrapperStyle={{ 
                     fontSize: '12px', 
                     paddingLeft: '10px', 
                     cursor: 'pointer',
                     backgroundColor: 'rgba(255,255,255,0.9)',
                     borderRadius: '8px',
                     padding: '8px',
                     border: '1px solid #e5e7eb'
                   }}
                   onClick={handleComposerLegendClick}
                 />
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>

           {/* Pie Chart - Lyricists */}
           <div className="bg-white p-4 rounded-lg border border-blue-200">
             <h3 className="text-lg font-medium text-blue-800 mb-4">Top Lyricists (Click to filter)</h3>
             <ResponsiveContainer width="100%" height={250}>
               <PieChart>
                 <Pie
                   data={lyricistData}
                   cx="45%"
                   cy="50%"
                   outerRadius={80}
                   fill="#8884d8"
                   dataKey="value"
                   strokeWidth={0.5}
                   onClick={handleLyricistClick}
                   style={{ cursor: 'pointer' }}
                 >
                   {lyricistData.map((entry, index) => (
                     <Cell 
                       key={`cell-${index}`} 
                       fill={chartFilters.lyricist === entry.name ? "#dc2626" : LYRICIST_COLORS[index % LYRICIST_COLORS.length]} 
                     />
                   ))}
                 </Pie>
                 <Legend 
                   verticalAlign="middle" 
                   align="right" 
                   layout="vertical"
                   wrapperStyle={{ 
                     fontSize: '12px', 
                     paddingLeft: '10px', 
                     cursor: 'pointer',
                     backgroundColor: 'rgba(255,255,255,0.9)',
                     borderRadius: '8px',
                     padding: '8px',
                     border: '1px solid #e5e7eb'
                   }}
                   onClick={handleLyricistLegendClick}
                 />
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
         </div>
       </div>

       {/* Panel 3: Song List with Audio Player */}
       <div className="w-80 bg-white border-l border-blue-200 flex flex-col">
         {/* Audio Player Header */}
         <div className="p-4 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
           {/* Player Mode Toggle */}
           <div className="mb-4">
             <label className="block text-xs text-blue-600 font-medium mb-2">PLAYER MODE</label>
             <div className="flex gap-2">
               <button
                 onClick={() => setShowEmbedPlayer(false)}
                 className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                   !showEmbedPlayer 
                     ? 'bg-blue-600 text-white' 
                     : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                 }`}
               >
                 🔗 Quick Link
               </button>
               <button
                 onClick={() => setShowEmbedPlayer(true)}
                 className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${
                   showEmbedPlayer 
                     ? 'bg-red-600 text-white' 
                     : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
                 }`}
               >
                 📺 Embed Player
               </button>
             </div>
           </div>

           {/* Now Playing */}
           {currentSong && (
             <div className="mb-3">
               <div className="text-xs text-blue-600 font-medium">NOW PLAYING</div>
               <div className="text-sm font-medium text-blue-800 truncate">{currentSong.song}</div>
               <div className="text-xs text-slate-600 truncate">{currentSong.movie} • {currentSong.singer}</div>
             </div>
           )}

           {/* Main Controls - Only show if not using embed player */}
           {!showEmbedPlayer && (
             <>
               <div className="flex items-center justify-center gap-3 mb-3">
                 <button 
                   onClick={() => setIsShuffled(!isShuffled)}
                   className={`p-2 rounded transition-colors ${isShuffled ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
                   title="Shuffle"
                 >
                   <Shuffle className="w-4 h-4" />
                 </button>
                 
                 <button 
                   onClick={playPrevious}
                   className="p-2 bg-white text-blue-600 rounded hover:bg-blue-50 transition-colors"
                   disabled={currentPlaylist.length === 0}
                 >
                   <SkipBack className="w-4 h-4" />
                 </button>
                 
                 <button 
                   onClick={togglePlay}
                   className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                   disabled={currentPlaylist.length === 0}
                 >
                   {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                 </button>
                 
                 <button 
                   onClick={playNext}
                   className="p-2 bg-white text-blue-600 rounded hover:bg-blue-50 transition-colors"
                   disabled={currentPlaylist.length === 0}
                 >
                   <SkipForward className="w-4 h-4" />
                 </button>
               </div>

               {/* Status */}
               <div className="text-center">
                 <div className="text-xs text-slate-500">
                   {isPlaying ? '🎬 Opens in YouTube' : '⏹️ Ready to play'}
                 </div>
               </div>
             </>
           )}
         </div>

         {/* Embedded YouTube Player */}
         {showEmbedPlayer && currentSong && (
           <div className="border-b border-blue-200">
             <YouTubePlayer
               song={currentSong}
               isPlaying={isPlaying}
               onPlay={() => setIsPlaying(true)}
               onPause={() => setIsPlaying(false)}
               onNext={playNext}
               onPrevious={playPrevious}
               className="rounded-none border-0"
             />
           </div>
         )}

         {/* Songs List */}
         <div className="flex-1 p-4 overflow-y-auto">
           <h3 className="text-lg font-medium text-blue-800 mb-4">
             Playlist ({currentPlaylist.length})
           </h3>
           <div className="space-y-2">
             {currentPlaylist.map((song, index) => (
               <div 
                 key={song.id} 
                 className={`p-3 border rounded cursor-pointer transition-all ${
                   currentSong?.id === song.id 
                     ? 'border-blue-500 bg-blue-50' 
                     : 'border-blue-100 bg-blue-50/30 hover:bg-blue-50/50'
                 }`}
                 onClick={() => {
                   const wasPlaying = isPlaying;
                   setCurrentSongIndex(index);
                   if (wasPlaying && !showEmbedPlayer) {
                     setTimeout(() => {
                       const newSong = currentPlaylist[index];
                       if (newSong) {
                         openSong(newSong);
                       }
                     }, 100);
                   }
                 }}
               >
                 <div className="flex items-center gap-2">
                   {currentSong?.id === song.id && isPlaying ? (
                     <div className="w-3 h-3 bg-blue-600 rounded animate-pulse" />
                   ) : (
                     <div className="w-3 h-3 bg-slate-300 rounded" />
                   )}
                   <div className="flex-1 min-w-0">
                     <h4 className="font-medium text-blue-800 text-sm truncate">{song.song}</h4>
                     <p className="text-xs text-slate-600 truncate">{song.movie} ({song.year})</p>
                     <div className="text-xs text-slate-500 space-y-0.5">
                       <p><span className="font-medium">Composer:</span> {song.composer}</p>
                       <p><span className="font-medium">Singer:</span> {song.singer}</p>
                       <p><span className="font-medium">Lyricist:</span> {song.lyricist}</p>
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
     </div>
   </div>
 );
};

export default TamilSongsVisualization;
