import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { Search, RotateCcw, Play, Pause, SkipForward, SkipBack, Shuffle, Menu, X, BarChart3, Music, Home } from 'lucide-react';

const TamilSongsMobile = () => {
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

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedComposers, setSelectedComposers] = useState([]);
  const [selectedSingers, setSelectedSingers] = useState([]);
  const [selectedLyricists, setSelectedLyricists] = useState([]);
  const [activeFilterTab, setActiveFilterTab] = useState('years');
  const [currentView, setCurrentView] = useState('home');
  const [showFilters, setShowFilters] = useState(false);
  const [chartFilters, setChartFilters] = useState({
    year: null,
    singer: null,
    composer: null,
    lyricist: null
  });

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [playMode, setPlayMode] = useState('spotify');
  const [isShuffled, setIsShuffled] = useState(false);

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
      .slice(0, 6);
  }, [filteredSongs]);

  const composerData = useMemo(() => {
    const composerCounts = {};
    filteredSongs.forEach(song => {
      composerCounts[song.composer] = (composerCounts[song.composer] || 0) + 1;
    });
    return Object.entries(composerCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredSongs]);

  const lyricistData = useMemo(() => {
    const lyricistCounts = {};
    filteredSongs.forEach(song => {
      lyricistCounts[song.lyricist] = (lyricistCounts[song.lyricist] || 0) + 1;
    });
    return Object.entries(lyricistCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredSongs]);

  // Current playlist
  const currentPlaylist = useMemo(() => {
    return isShuffled 
      ? [...filteredSongs].sort(() => Math.random() - 0.5)
      : filteredSongs;
  }, [filteredSongs, isShuffled]);

  const currentSong = currentPlaylist[currentSongIndex] || null;

  // Audio control functions
  const openSong = (song, mode) => {
    let url;
    if (mode === 'spotify') {
      const query = `${song.song} ${song.singer}`;
      url = `https://open.spotify.com/search/${encodeURIComponent(query)}`;
    } else {
      const query = `${song.song} ${song.movie} ${song.singer}`;
      url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    }
    window.open(url, '_blank');
  };

  const togglePlay = () => {
    if (!currentSong) return;
    
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      openSong(currentSong, playMode);
    }
  };

  const playNext = () => {
    if (currentPlaylist.length === 0) return;
    const nextIndex = (currentSongIndex + 1) % currentPlaylist.length;
    setCurrentSongIndex(nextIndex);
    
    if (isPlaying) {
      const nextSong = currentPlaylist[nextIndex];
      if (nextSong) {
        openSong(nextSong, playMode);
      }
    }
  };

  const playPrevious = () => {
    if (currentPlaylist.length === 0) return;
    const prevIndex = currentSongIndex === 0 ? currentPlaylist.length - 1 : currentSongIndex - 1;
    setCurrentSongIndex(prevIndex);
    
    if (isPlaying) {
      const prevSong = currentPlaylist[prevIndex];
      if (prevSong) {
        openSong(prevSong, playMode);
      }
    }
  };

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

  // Colors - matching desktop version
  const SINGER_COLORS = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];
  const COMPOSER_COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
  const LYRICIST_COLORS = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'];

  const FilterButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm rounded-lg border transition-all ${
        active 
          ? 'bg-blue-600 text-white border-blue-600' 
          : 'bg-white text-blue-600 border-blue-300 hover:border-blue-500'
      }`}
    >
      {children}
    </button>
  );

  // Mobile Views
  const HomeView = () => (
    <div className="space-y-4">
      {/* 4 Cards - Blue, Purple, Green, Red */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
          <div className="text-2xl font-bold">{filteredSongs.length}</div>
          <div className="text-blue-100 text-sm">Songs</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
          <div className="text-2xl font-bold">{uniqueSingers.length}</div>
          <div className="text-purple-100 text-sm">Singers</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
          <div className="text-2xl font-bold">{uniqueComposers.length}</div>
          <div className="text-green-100 text-sm">Composers</div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl">
          <div className="text-2xl font-bold">{uniqueLyricists.length}</div>
          <div className="text-red-100 text-sm">Lyricists</div>
        </div>
      </div>

{/* Current Playing - Change from pink to light blue */}
{currentSong && (
  <div className="bg-gradient-to-r from-sky-400 to-sky-500 text-white p-6 rounded-xl">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
        <Music className="w-8 h-8" />
      </div>
      <div className="flex-1">
        <div className="font-bold text-lg">{currentSong.song}</div>
        <div className="text-sky-100">{currentSong.movie}</div>
        <div className="text-sky-200 text-sm">{currentSong.singer}</div>
      </div>
    </div>

    {/* Play Mode Selection */}
    <div className="mt-4 flex gap-2">
      <button
        onClick={() => setPlayMode('spotify')}
        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
          playMode === 'spotify'
            ? 'bg-green-600 text-white'
            : 'bg-white/20 text-white hover:bg-white/30'
        }`}
      >
        🎵 Spotify
      </button>
      <button
        onClick={() => setPlayMode('youtube')}
        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
          playMode === 'youtube'
            ? 'bg-red-600 text-white'
            : 'bg-white/20 text-white hover:bg-white/30'
        }`}
      >
        🎬 YouTube
      </button>
    </div>

    {/* Player Controls - Change to WHITE buttons */}
    <div className="flex items-center justify-center gap-4 mt-4">
      <button
        onClick={() => setIsShuffled(!isShuffled)}
        className={`p-3 rounded-full transition-all ${
          isShuffled ? 'bg-blue-600 text-white' : 'bg-white/90 text-sky-600 hover:bg-white'
        }`}
      >
        <Shuffle className="w-5 h-5" />
      </button>

      <button
        onClick={playPrevious}
        className="p-3 bg-white/90 text-sky-600 rounded-full hover:bg-white transition-all"
      >
        <SkipBack className="w-5 h-5" />
      </button>

      <button
        onClick={togglePlay}
        className="p-4 bg-white text-sky-600 rounded-full hover:scale-105 transition-all shadow-lg"
      >
        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
      </button>

      <button
        onClick={playNext}
        className="p-3 bg-white/90 text-sky-600 rounded-full hover:bg-white transition-all"
      >
        <SkipForward className="w-5 h-5" />
      </button>
    </div>
  </div>
)}

  const ChartsView = () => (
    <div className="space-y-6">
      {/* Line Chart - Songs by Year */}
      <div className="bg-white p-4 rounded-xl border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Songs by Year</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={yearData} onClick={handleYearClick}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: "#2563eb", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Charts */}
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-xl border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Singers</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={singerData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                onClick={handleSingerClick}
              >
                {singerData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={SINGER_COLORS[index % SINGER_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ 
                  fontSize: '12px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: '8px',
                  padding: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Composers</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={composerData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {composerData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COMPOSER_COLORS[index % COMPOSER_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ 
                  fontSize: '12px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: '8px',
                  padding: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Lyricists</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={lyricistData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
              >
                {lyricistData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={LYRICIST_COLORS[index % LYRICIST_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Legend 
                verticalAlign="bottom" 
                height={36}
                wrapperStyle={{ 
                  fontSize: '12px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: '8px',
                  padding: '8px',
                  border: '1px solid #e5e7eb'
                }}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const PlaylistView = () => {
    // Sort playlist by song name
    const sortedPlaylist = useMemo(() => {
      return [...currentPlaylist].sort((a, b) => a.song.localeCompare(b.song));
    }, [currentPlaylist]);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Your Playlist ({sortedPlaylist.length})
          </h3>
          <button
            onClick={() => setShowFilters(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Filters
          </button>
        </div>
        
        <div className="space-y-3">
          {sortedPlaylist.map((song, index) => (
            <div 
              key={song.id}
              className={`p-4 rounded-lg border transition-all ${
                currentSong?.id === song.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white'
              }`}
              onClick={() => {
                const wasPlaying = isPlaying;
                const originalIndex = currentPlaylist.findIndex(s => s.id === song.id);
                setCurrentSongIndex(originalIndex);
                if (wasPlaying) {
                  setTimeout(() => {
                    openSong(song, playMode);
                  }, 100);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentSong?.id === song.id && isPlaying 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentSong?.id === song.id && isPlaying ? (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  ) : (
                    <Music className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{song.song}</div>
                  <div className="text-sm text-gray-600">{song.movie} ({song.year})</div>
                  <div className="text-xs text-gray-500">
                    {song.composer} • {song.singer} • {song.lyricist}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-pink-300 to-white bg-clip-text text-transparent animate-pulse">
            தேடலும் பாடலும்
          </h1>
          <button
            onClick={() => setShowFilters(true)}
            className="p-2 bg-white/20 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white/50"
            placeholder="Search songs, artists..."
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        {currentView === 'home' && <HomeView />}
        {currentView === 'charts' && <ChartsView />}
        {currentView === 'playlist' && <PlaylistView />}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 sticky bottom-0">
        <div className="flex justify-around">
          <button
            onClick={() => setCurrentView('home')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
              currentView === 'home' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs">Home</span>
          </button>
          
          <button
            onClick={() => setCurrentView('charts')}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
              currentView === 'charts'
               ? 'text-blue-600 bg-blue-50' 
               : 'text-gray-600'
           }`}
         >
           <BarChart3 className="w-5 h-5 mb-1" />
           <span className="text-xs">Charts</span>
         </button>
         
         <button
           onClick={() => setCurrentView('playlist')}
           className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
             currentView === 'playlist' 
               ? 'text-blue-600 bg-blue-50' 
               : 'text-gray-600'
           }`}
         >
           <Music className="w-5 h-5 mb-1" />
           <span className="text-xs">Playlist</span>
         </button>
       </div>
     </div>

     {/* Filter Sidebar */}
     {showFilters && (
       <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowFilters(false)}>
         <div 
           className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform"
           onClick={(e) => e.stopPropagation()}
         >
           {/* Filter Header */}
           <div className="p-4 border-b border-gray-200 bg-blue-600 text-white">
             <div className="flex items-center justify-between">
               <h3 className="text-lg font-semibold">Filters</h3>
               <button
                 onClick={() => setShowFilters(false)}
                 className="p-1 hover:bg-white/20 rounded"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>
           </div>

           {/* Filter Content */}
           <div className="flex flex-col h-full">
             <div className="p-4 border-b border-gray-200">
               {/* Reset Button */}
               <button
                 onClick={resetFilters}
                 className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm mb-4"
               >
                 <RotateCcw className="w-4 h-4" />
                 Reset All Filters
               </button>

               {/* Filter Tabs */}
               <div className="grid grid-cols-2 gap-2">
                 <button
                   onClick={() => setActiveFilterTab('years')}
                   className={`px-3 py-2 text-sm rounded-lg transition-all ${
                     activeFilterTab === 'years' 
                       ? 'bg-blue-600 text-white' 
                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                   }`}
                 >
                   Years {selectedYears.length > 0 && `(${selectedYears.length})`}
                 </button>
                 <button
                   onClick={() => setActiveFilterTab('singers')}
                   className={`px-3 py-2 text-sm rounded-lg transition-all ${
                     activeFilterTab === 'singers' 
                       ? 'bg-blue-600 text-white' 
                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                   }`}
                 >
                   Singers {selectedSingers.length > 0 && `(${selectedSingers.length})`}
                 </button>
                 <button
                   onClick={() => setActiveFilterTab('composers')}
                   className={`px-3 py-2 text-sm rounded-lg transition-all ${
                     activeFilterTab === 'composers' 
                       ? 'bg-blue-600 text-white' 
                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                   }`}
                 >
                   Composers {selectedComposers.length > 0 && `(${selectedComposers.length})`}
                 </button>
                 <button
                   onClick={() => setActiveFilterTab('lyricists')}
                   className={`px-3 py-2 text-sm rounded-lg transition-all ${
                     activeFilterTab === 'lyricists' 
                       ? 'bg-blue-600 text-white' 
                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                   }`}
                 >
                   Lyricists {selectedLyricists.length > 0 && `(${selectedLyricists.length})`}
                 </button>
               </div>
             </div>

             {/* Filter Options */}
             <div className="flex-1 p-4 overflow-y-auto">
               {/* Years Tab */}
               {activeFilterTab === 'years' && (
                 <div>
                   <h4 className="text-sm font-medium text-gray-800 mb-3">Select Years</h4>
                   <div className="grid grid-cols-3 gap-2">
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
                   <h4 className="text-sm font-medium text-gray-800 mb-3">Select Singers</h4>
                   <div className="space-y-2">
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
                   <h4 className="text-sm font-medium text-gray-800 mb-3">Select Composers</h4>
                   <div className="space-y-2">
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
                   <h4 className="text-sm font-medium text-gray-800 mb-3">Select Lyricists</h4>
                   <div className="space-y-2">
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

               {/* Active Chart Filters */}
               {(chartFilters.year || chartFilters.singer || chartFilters.composer || chartFilters.lyricist) && (
                 <div className="mt-6 pt-4 border-t border-gray-200">
                   <h4 className="text-sm font-medium text-gray-800 mb-2">Chart Filters</h4>
                   <div className="space-y-2">
                     {chartFilters.year && (
                       <div className="flex items-center justify-between bg-blue-100 px-3 py-2 rounded-lg">
                         <span className="text-sm">Year: {chartFilters.year}</span>
                         <button 
                           onClick={() => setChartFilters(prev => ({ ...prev, year: null }))} 
                           className="text-blue-600 hover:text-blue-800 font-medium"
                         >
                           ×
                         </button>
                       </div>
                     )}
                     {chartFilters.singer && (
                       <div className="flex items-center justify-between bg-blue-100 px-3 py-2 rounded-lg">
                         <span className="text-sm">Singer: {chartFilters.singer}</span>
                         <button 
                           onClick={() => setChartFilters(prev => ({ ...prev, singer: null }))} 
                           className="text-blue-600 hover:text-blue-800 font-medium"
                         >
                           ×
                         </button>
                       </div>
                     )}
                     {chartFilters.composer && (
                       <div className="flex items-center justify-between bg-blue-100 px-3 py-2 rounded-lg">
                         <span className="text-sm">Composer: {chartFilters.composer}</span>
                         <button 
                           onClick={() => setChartFilters(prev => ({ ...prev, composer: null }))} 
                           className="text-blue-600 hover:text-blue-800 font-medium"
                         >
                           ×
                         </button>
                       </div>
                     )}
                     {chartFilters.lyricist && (
                       <div className="flex items-center justify-between bg-blue-100 px-3 py-2 rounded-lg">
                         <span className="text-sm">Lyricist: {chartFilters.lyricist}</span>
                         <button 
                           onClick={() => setChartFilters(prev => ({ ...prev, lyricist: null }))} 
                           className="text-blue-600 hover:text-blue-800 font-medium"
                         >
                           ×
                         </button>
                       </div>
                     )}
                   </div>
                 </div>
               )}
             </div>

             {/* Apply Button */}
             <div className="p-4 border-t border-gray-200">
               <button
                 onClick={() => setShowFilters(false)}
                 className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
               >
                 Apply Filters ({filteredSongs.length} songs)
               </button>
             </div>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};

export default TamilSongsMobile;			  
