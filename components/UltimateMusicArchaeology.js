import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, Users, Music, Mic, PenTool } from 'lucide-react';
import { renderSunburstChart } from './sunburstChart';
import { tamilSongsData } from './tamilSongsData';

const UltimateMusicArchaeology = ({ 
  filteredSongs, 
  onYearClick,
  onSingerClick,
  onComposerClick,
  onLyricistClick,
  chartFilters,
  resetTrigger = 0
}) => {
  const [activeTab, setActiveTab] = useState('collaborations');
  const [selectedYearRange, setSelectedYearRange] = useState([1960, 2024]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [highlightedArtist, setHighlightedArtist] = useState(null);
  
  const svgRef = useRef();
  const timelineRef = useRef();

  // Reset chart states when resetTrigger changes
  useEffect(() => {
    if (resetTrigger > 0) {
      setSelectedYearRange([1960, 2024]);
      setZoomLevel(1);
      setHighlightedArtist(null);
      setActiveTab('collaborations');
    }
  }, [resetTrigger]);

  // Global timeline data
  const timelineData = useMemo(() => {
    const yearCounts = {};
    filteredSongs.forEach(song => {
      if (!yearCounts[song.year]) {
        yearCounts[song.year] = {
          year: song.year,
          total: 0,
          composers: new Set(),
          singers: new Set(),
          lyricists: new Set(),
          songs: []
        };
      }
      yearCounts[song.year].total += 1;
      yearCounts[song.year].composers.add(song.composer);
      yearCounts[song.year].singers.add(song.singer);
      yearCounts[song.year].lyricists.add(song.lyricist);
      yearCounts[song.year].songs.push(song);
    });

    return Object.values(yearCounts).map(data => ({
      ...data,
      composers: data.composers.size,
      singers: data.singers.size,
      lyricists: data.lyricists.size,
      composersList: Array.from(data.composers),
      singersList: Array.from(data.singers),
      lyricistsList: Array.from(data.lyricists)
    })).sort((a, b) => a.year - b.year);
  }, [filteredSongs]);

  // All artists with their collaboration networks
  const artistNetworks = useMemo(() => {
    const networks = {
      collaborations: new Map(),
      composers: new Map(),
      singers: new Map(),
      lyricists: new Map()
    };

    filteredSongs.forEach(song => {
      // Collaboration networks
      const collabKey = `${song.composer}|${song.singer}|${song.lyricist}`;
      if (!networks.collaborations.has(collabKey)) {
        networks.collaborations.set(collabKey, {
          id: collabKey,
          composer: song.composer,
          singer: song.singer,
          lyricist: song.lyricist,
          songs: [],
          years: new Set(),
          movies: new Set()
        });
      }
      const collab = networks.collaborations.get(collabKey);
      collab.songs.push(song);
      collab.years.add(song.year);
      collab.movies.add(song.movie);

      // Individual artist tracking
      [
        { type: 'composers', name: song.composer },
        { type: 'singers', name: song.singer },
        { type: 'lyricists', name: song.lyricist }
      ].forEach(({ type, name }) => {
        if (!networks[type].has(name)) {
          networks[type].set(name, {
            name,
            songs: [],
            collaborators: { composers: new Set(), singers: new Set(), lyricists: new Set() },
            activeYears: new Set(),
            totalSongs: 0
          });
        }
        const artist = networks[type].get(name);
        artist.songs.push(song);
        artist.activeYears.add(song.year);
        artist.totalSongs += 1;
        artist.collaborators.composers.add(song.composer);
        artist.collaborators.singers.add(song.singer);
        artist.collaborators.lyricists.add(song.lyricist);
      });
    });

    return {
      collaborations: Array.from(networks.collaborations.values()),
      composers: Array.from(networks.composers.values()),
      singers: Array.from(networks.singers.values()),
      lyricists: Array.from(networks.lyricists.values())
    };
  }, [filteredSongs]);

  // Filter by year range and search (search now handled by parent component)
  const filteredArtists = useMemo(() => {
    const yearFilter = (artist) => {
      const activeYears = Array.from(artist.activeYears || []);
      return activeYears.some(year => year >= selectedYearRange[0] && year <= selectedYearRange[1]);
    };

    return {
      collaborations: artistNetworks.collaborations.filter(collab => {
        const years = Array.from(collab.years);
        return years.some(year => year >= selectedYearRange[0] && year <= selectedYearRange[1]);
      }),
      composers: artistNetworks.composers.filter(artist => yearFilter(artist)),
      singers: artistNetworks.singers.filter(artist => yearFilter(artist)),
      lyricists: artistNetworks.lyricists.filter(artist => yearFilter(artist))
    };
  }, [artistNetworks, selectedYearRange]);

  // Draw Global Timeline
  useEffect(() => {
    if (!timelineRef.current || !timelineData.length) return;

    const container = d3.select(timelineRef.current);
    container.selectAll("*").remove();

    const margin = { top: 10, right: 10, bottom: 30, left: 10 };
    const width = 800 - margin.left - margin.right;
    const height = 120 - margin.top - margin.bottom; // Increased height

    const svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(timelineData, d => d.year))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(timelineData, d => d.total)])
      .range([height, 0]);

    // Color scale for decades
    const colorScale = d3.scaleOrdinal()
      .domain(['1960', '1970', '1980', '1990', '2000', '2010', '2020'])
      .range(['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB74D']);

    // Area generator
    const area = d3.area()
      .x(d => xScale(d.year))
      .y0(height)
      .y1(d => yScale(d.total))
      .curve(d3.curveCardinal);

    // Add gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "timelineGradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#4ECDC4")
      .attr("stop-opacity", 0.1);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#4ECDC4")
      .attr("stop-opacity", 0.8);

    // Draw area
    g.append("path")
      .datum(timelineData)
      .attr("fill", "url(#timelineGradient)")
      .attr("d", area);

    // Draw line
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.total))
      .curve(d3.curveCardinal);

    g.append("path")
      .datum(timelineData)
      .attr("fill", "none")
      .attr("stroke", "#4ECDC4")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Add interactive dots
    g.selectAll(".timeline-dot")
      .data(timelineData)
      .enter()
      .append("circle")
      .attr("class", "timeline-dot")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.total))
      .attr("r", 4)
      .attr("fill", d => colorScale(Math.floor(d.year / 10) * 10))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this).attr("r", 6);
        
        // Tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "timeline-tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0,0,0,0.9)")
          .style("color", "white")
          .style("padding", "10px")
          .style("border-radius", "8px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", 1000);

        tooltip.html(`
          <strong>${d.year}</strong><br/>
          Songs: ${d.total}<br/>
          Composers: ${d.composers}<br/>
          Singers: ${d.singers}<br/>
          Lyricists: ${d.lyricists}
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function(event, d) {
        d3.select(this).attr("r", 4);
        d3.selectAll(".timeline-tooltip").remove();
      })
      .on("click", function(event, d) {
        setSelectedYearRange([d.year, d.year]);
        onYearClick({ activePayload: [{ payload: { year: d.year } }] });
      });

    // Axes - only X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    // Year range brush
    const brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on("brush end", function(event) {
        if (event.selection) {
          const [x0, x1] = event.selection;
          const year0 = Math.round(xScale.invert(x0));
          const year1 = Math.round(xScale.invert(x1));
          setSelectedYearRange([year0, year1]);
        }
      });

    g.append("g")
      .attr("class", "brush")
      .call(brush);

  }, [timelineData, onYearClick]);

  // Draw main visualization based on active tab
  useEffect(() => {
    if (!svgRef.current || !filteredArtists[activeTab]) return;

    const container = d3.select(svgRef.current);
    container.selectAll("*").remove();

    const width = 800;
    const height = 500;

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    if (activeTab === 'collaborations') {
      drawCollaborationNetwork(svg, filteredArtists.collaborations, width, height);
    } else {
      drawArtistVisualization(svg, filteredArtists[activeTab], activeTab, width, height);
    }
  }, [filteredArtists, activeTab, zoomLevel, highlightedArtist]);

  const drawCollaborationNetwork = (svg, collaborations, width, height) => {
    //Sunburst Visualizer
    
    const SunburstVisualizer = () => {
    const chartRef = useRef(null);
  
    useEffect(() => {
      if (chartRef.current) {
        renderSunburstChart(chartRef.current.id, tamilSongsData);
      }
    }, []);
  
    return <div id="sunburst-container" ref={chartRef} style={{ height: '600px' }} />;
  };
  export SunburstVisualizer;    
  
  return (
    <div className="h-full flex flex-col">
      {/* Timeline with Vertical Tab Navigation */}
      <div className="bg-white rounded-lg p-3 mb-3 shadow-sm border">
        <div className="flex gap-4">
          {/* Timeline Section */}
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-2">
              🕒 <strong>{selectedYearRange[0]} - {selectedYearRange[1]}</strong>
              {selectedYearRange[0] !== 1960 || selectedYearRange[1] !== 2024 ? (
                <span className="ml-2 text-blue-600">
                  ({selectedYearRange[1] - selectedYearRange[0] + 1} years)
                </span>
              ) : (
                <span className="ml-2 text-green-600">(All years)</span>
              )}
            </div>
            <div ref={timelineRef}></div>
          </div>
          
          {/* Vertical Tab Navigation */}
          <div className="w-48 flex flex-col gap-2">
            {[
              { key: 'collaborations', label: '🤝 Collaborations', icon: Users, count: filteredArtists.collaborations.length },
              { key: 'singers', label: '🎤 Singers', icon: Mic, count: filteredArtists.singers.length },
              { key: 'composers', label: '🎼 Composers', icon: Music, count: filteredArtists.composers.length },
              { key: 'lyricists', label: '✍️ Lyricists', icon: PenTool, count: filteredArtists.lyricists.length }
            ].map(({ key, label, icon: Icon, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center justify-between p-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </div>
                <div className={`text-lg font-bold ${activeTab === key ? 'text-white' : 'text-blue-600'}`}>
                  {count}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Visualization */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {activeTab === 'collaborations' && `🤝 ${filteredArtists.collaborations.length} Collaboration Networks`}
            {activeTab === 'singers' && `🎤 ${filteredArtists.singers.length} Singers`}
            {activeTab === 'composers' && `🎼 ${filteredArtists.composers.length} Composers`}
            {activeTab === 'lyricists' && `✍️ ${filteredArtists.lyricists.length} Lyricists`}
          </h3>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {activeTab === 'collaborations' 
                ? 'Click decades • Hover for details • Streams show collaboration flow'
                : 'Circle size = activity • Hover for details • Click to filter'
              }
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.2))}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.2))}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="h-96 w-full overflow-hidden rounded-lg border">
          <div ref={svgRef}></div>
        </div>
      </div>
    </div>
  );
};

export default UltimateMusicArchaeology;
