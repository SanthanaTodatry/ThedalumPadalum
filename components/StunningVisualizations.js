import React, { useState, useMemo } from 'react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Treemap,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const StunningVisualizations = ({ 
  filteredSongs, 
  onYearClick,
  onSingerClick,
  onComposerClick,
  onLyricistClick,
  chartFilters
}) => {

  // Add this to StunningVisualizations.js
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  useEffect(() => {
    setIsMobileDevice(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);
  
  // Then limit data on mobile:
  const processedData = useMemo(() => {
    if (isMobileDevice && filteredSongs.length > 50) {
      return filteredSongs.slice(0, 50); // Limit to 50 songs on mobile
    }
    return filteredSongs;
  }, [filteredSongs, isMobileDevice]);
  
  const [activeView, setActiveView] = useState('radar');

  // Beautiful color palettes
  const DECADE_COLORS = {
    2000: ['#FF6B6B', '#FF8E8E', '#FFB1B1'],
    2010: ['#4ECDC4', '#7ED3D1', '#A8DEDA'],
    2020: ['#45B7D1', '#6AC4DD', '#8FD1E9']
  };

  const RADAR_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  // Prepare radar chart data (Artist activity across years)
  const radarData = useMemo(() => {
    const years = [...new Set(filteredSongs.map(s => s.year))].sort();
    const topSingers = Object.entries(
      filteredSongs.reduce((acc, song) => {
        acc[song.singer] = (acc[song.singer] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 6);

    return years.map(year => {
      const yearData = { year };
      topSingers.forEach(([singer]) => {
        yearData[singer] = filteredSongs.filter(s => s.year === year && s.singer === singer).length;
      });
      return yearData;
    });
  }, [filteredSongs]);

  const radarKeys = useMemo(() => {
    return Object.entries(
      filteredSongs.reduce((acc, song) => {
        acc[song.singer] = (acc[song.singer] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([singer]) => singer);
  }, [filteredSongs]);

  // Prepare treemap data (Hierarchical view)
  const treemapData = useMemo(() => {
    const composers = filteredSongs.reduce((acc, song) => {
      if (!acc[song.composer]) {
        acc[song.composer] = {
          name: song.composer,
          children: {}
        };
      }
      if (!acc[song.composer].children[song.singer]) {
        acc[song.composer].children[song.singer] = {
          name: song.singer,
          size: 0,
          composer: song.composer
        };
      }
      acc[song.composer].children[song.singer].size += 1;
      return acc;
    }, {});

    return Object.values(composers).map(composer => ({
      ...composer,
      children: Object.values(composer.children)
    })).slice(0, 8);
  }, [filteredSongs]);

  // Prepare bubble chart data (Songs as bubbles)
  const bubbleData = useMemo(() => {
    return filteredSongs.map((song, index) => ({
      x: song.year,
      y: song.singer.length, // Use singer name length as Y
      z: 50 + (index % 3) * 25, // Bubble size variation
      song: song.song,
      movie: song.movie,
      singer: song.singer,
      composer: song.composer,
      decade: Math.floor(song.year / 10) * 10
    }));
  }, [filteredSongs]);

  // Prepare area chart data (Songs over time by decade)
  const areaData = useMemo(() => {
    const yearCounts = filteredSongs.reduce((acc, song) => {
      const decade = Math.floor(song.year / 10) * 10;
      if (!acc[song.year]) {
        acc[song.year] = { year: song.year };
      }
      const decadeKey = `decade_${decade}`;
      acc[song.year][decadeKey] = (acc[song.year][decadeKey] || 0) + 1;
      return acc;
    }, {});

    return Object.values(yearCounts).sort((a, b) => a.year - b.year);
  }, [filteredSongs]);

  const getDecadeColor = (decade) => DECADE_COLORS[decade]?.[0] || '#96CEB4';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const BubbleTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black bg-opacity-80 text-white p-3 rounded-lg text-sm">
          <p className="font-bold">{data.song}</p>
          <p>{data.movie} ({data.x})</p>
          <p>Singer: {data.singer}</p>
          <p>Composer: {data.composer}</p>
        </div>
      );
    }
    return null;
  };

  const TreemapTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-purple-900 text-white p-3 rounded-lg text-sm">
          <p className="font-bold">{data.name}</p>
          <p>Songs: {data.size}</p>
          {data.composer && <p>Composer: {data.composer}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Navigation Tabs */}
      <div className="flex bg-white rounded-lg p-1 mb-4 shadow-sm border">
        {[
          { key: 'radar', label: '🎯 Artist Radar', color: 'blue' },
          { key: 'bubble', label: '🫧 Song Universe', color: 'purple' },
          { key: 'treemap', label: '🗂️ Music Hierarchy', color: 'green' },
          { key: 'area', label: '🌊 Time Waves', color: 'orange' }
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeView === key
                ? `bg-${color}-600 text-white shadow-md`
                : `text-${color}-600 hover:bg-${color}-50`
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Visualization Container */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
        {/* Radar Chart - Artist Activity */}
        {activeView === 'radar' && (
          <div className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">🎯 Artist Activity Radar</h3>
              <div className="text-xs text-gray-500">Top 6 singers across years</div>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="year" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 'dataMax']}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                {radarKeys.map((singer, index) => (
                  <Radar
                    key={singer}
                    name={singer}
                    dataKey={singer}
                    stroke={RADAR_COLORS[index % RADAR_COLORS.length]}
                    fill={RADAR_COLORS[index % RADAR_COLORS.length]}
                    fillOpacity={0.2}
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2 }}
                  />
                ))}
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  onClick={(e) => onSingerClick({ name: e.value })}
                  iconType="circle"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bubble Chart - Songs Universe */}
        {activeView === 'bubble' && (
          <div className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">🫧 Song Universe</h3>
              <div className="text-xs text-gray-500">Hover bubbles • X: Year • Y: Singer name length</div>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <ScatterChart data={bubbleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Year"
                  domain={['dataMin', 'dataMax']}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Singer"
                  tick={{ fontSize: 12 }}
                />
                <ZAxis type="number" dataKey="z" range={[20, 100]} />
                <Tooltip content={<BubbleTooltip />} />
                {Object.keys(DECADE_COLORS).map(decade => (
                  <Scatter
                    key={decade}
                    name={`${decade}s`}
                    data={bubbleData.filter(d => d.decade === parseInt(decade))}
                    fill={getDecadeColor(parseInt(decade))}
                    fillOpacity={0.7}
                    onClick={(data) => onYearClick({ activePayload: [{ payload: { year: data.x } }] })}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
                <Legend />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Treemap - Music Hierarchy */}
        {activeView === 'treemap' && (
          <div className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">🗂️ Music Hierarchy</h3>
              <div className="text-xs text-gray-500">Composers → Singers • Click to filter</div>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <Treemap
                data={treemapData}
                dataKey="size"
                stroke="#fff"
                strokeWidth={2}
                content={({ x, y, width, height, payload, index }) => {
                  if (!payload) return null;
                  
                  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8E8E', '#7ED3D1'];
                  const color = colors[index % colors.length];
                  
                  return (
                    <g>
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={color}
                        fillOpacity={0.8}
                        stroke="#fff"
                        strokeWidth={2}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          if (payload.composer) {
                            onComposerClick({ name: payload.composer });
                          } else {
                            onSingerClick({ name: payload.name });
                          }
                        }}
                      />
                      {width > 50 && height > 30 && (
                        <text
                          x={x + width / 2}
                          y={y + height / 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={Math.min(width / 8, height / 4, 14)}
                          fill="#fff"
                          fontWeight="bold"
                        >
                          {payload.name}
                        </text>
                      )}
                      {width > 80 && height > 50 && (
                        <text
                          x={x + width / 2}
                          y={y + height / 2 + 15}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={Math.min(width / 12, height / 6, 10)}
                          fill="#fff"
                        >
                          {payload.size} songs
                        </text>
                      )}
                    </g>
                  );
                }}
              >
                <Tooltip content={<TreemapTooltip />} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        )}

        {/* Area Chart - Time Waves */}
        {activeView === 'area' && (
          <div className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">🌊 Music Time Waves</h3>
              <div className="text-xs text-gray-500">Song releases flowing through decades</div>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 12 }}
                  onClick={(data) => onYearClick({ activePayload: [{ payload: { year: data.value } }] })}
                  style={{ cursor: 'pointer' }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                {Object.keys(DECADE_COLORS).map((decade, index) => (
                  <Area
                    key={decade}
                    type="monotone"
                    dataKey={`decade_${decade}`}
                    stackId="1"
                    stroke={getDecadeColor(parseInt(decade))}
                    fill={getDecadeColor(parseInt(decade))}
                    fillOpacity={0.7}
                    name={`${decade}s`}
                  />
                ))}
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Active Filter Display */}
      {(chartFilters?.year || chartFilters?.singer || chartFilters?.composer) && (
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <div className="text-sm font-medium text-gray-800 mb-2">🎯 Active Filters:</div>
          <div className="flex gap-2 flex-wrap">
            {chartFilters.year && (
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs">
                Year: {chartFilters.year}
              </span>
            )}
            {chartFilters.singer && (
              <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs">
                Singer: {chartFilters.singer}
              </span>
            )}
            {chartFilters.composer && (
              <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs">
                Composer: {chartFilters.composer}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StunningVisualizations;
