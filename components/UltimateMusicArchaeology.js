import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Search, ZoomIn, ZoomOut, RotateCcw, Users, Music, Mic, PenTool } from 'lucide-react';

const UltimateMusicArchaeology = ({ 
  filteredSongs, 
  onYearClick,
  onSingerClick,
  onComposerClick,
  onLyricistClick,
  chartFilters
}) => {
  const [activeTab, setActiveTab] = useState('collaborations');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYearRange, setSelectedYearRange] = useState([1960, 2024]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [highlightedArtist, setHighlightedArtist] = useState(null);
  
  const svgRef = useRef();
  const timelineRef = useRef();

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

  // Filter by year range and search
  const filteredArtists = useMemo(() => {
    const yearFilter = (artist) => {
      const activeYears = Array.from(artist.activeYears || []);
      return activeYears.some(year => year >= selectedYearRange[0] && year <= selectedYearRange[1]);
    };

    const searchFilter = (artist) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      if (artist.name) return artist.name.toLowerCase().includes(term);
      if (artist.composer) {
        return artist.composer.toLowerCase().includes(term) ||
               artist.singer.toLowerCase().includes(term) ||
               artist.lyricist.toLowerCase().includes(term);
      }
      return false;
    };

    return {
      collaborations: artistNetworks.collaborations.filter(collab => {
        const years = Array.from(collab.years);
        return years.some(year => year >= selectedYearRange[0] && year <= selectedYearRange[1]) &&
               searchFilter(collab);
      }),
      composers: artistNetworks.composers.filter(artist => yearFilter(artist) && searchFilter(artist)),
      singers: artistNetworks.singers.filter(artist => yearFilter(artist) && searchFilter(artist)),
      lyricists: artistNetworks.lyricists.filter(artist => yearFilter(artist) && searchFilter(artist))
    };
  }, [artistNetworks, selectedYearRange, searchTerm]);

  // Draw Global Timeline
  useEffect(() => {
    if (!timelineRef.current || !timelineData.length) return;

    const container = d3.select(timelineRef.current);
    container.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 120 - margin.top - margin.bottom;

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

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    g.append("g")
      .call(d3.axisLeft(yScale));

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
    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Create nodes and links
    const nodes = collaborations.map(collab => ({
      id: collab.id,
      ...collab,
      size: collab.songs.length * 5 + 10,
      decade: Math.floor(Math.min(...collab.years) / 10) * 10
    }));

    const links = [];
    // Create links between collaborations that share artists
    for (let i = 0; i < collaborations.length; i++) {
      for (let j = i + 1; j < collaborations.length; j++) {
        const a = collaborations[i];
        const b = collaborations[j];
        const shared = [
          a.composer === b.composer,
          a.singer === b.singer,
          a.lyricist === b.lyricist
        ].filter(Boolean).length;
        
        if (shared > 0) {
          links.push({
            source: a.id,
            target: b.id,
            strength: shared,
            type: shared === 3 ? 'exact' : shared === 2 ? 'strong' : 'weak'
          });
        }
      }
    }

    const colorScale = d3.scaleOrdinal()
      .domain([1960, 1970, 1980, 1990, 2000, 2010, 2020])
      .range(['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB74D']);

    // Add links
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", d => d.type === 'exact' ? '#ff4757' : d.type === 'strong' ? '#5352ed' : '#a4b0be')
      .attr("stroke-opacity", d => d.type === 'exact' ? 0.8 : d.type === 'strong' ? 0.6 : 0.3)
      .attr("stroke-width", d => d.strength * 2);

    // Add nodes
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", d => Math.sqrt(d.size) * zoomLevel)
      .attr("fill", d => colorScale(d.decade))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("r", Math.sqrt(d.size) * zoomLevel * 1.5)
          .attr("stroke-width", 4);

        // Highlight connected links
        link.style("stroke-opacity", l => 
          l.source.id === d.id || l.target.id === d.id ? 1 : 0.1);

        showTooltip(event, d, 'collaboration');
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .attr("r", Math.sqrt(d.size) * zoomLevel)
          .attr("stroke-width", 2);

        link.style("stroke-opacity", d => d.type === 'exact' ? 0.8 : d.type === 'strong' ? 0.6 : 0.3);
        hideTooltip();
      })
      .on("click", function(event, d) {
        setHighlightedArtist(d.id);
      });

    simulation
      .nodes(nodes)
      .on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
      });

    simulation.force("link").links(links);

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  const drawArtistVisualization = (svg, artists, type, width, height) => {
    const packLayout = d3.pack()
      .size([width, height])
      .padding(5);

    const root = d3.hierarchy({ children: artists })
      .sum(d => d.totalSongs || 1)
      .sort((a, b) => b.value - a.value);

    packLayout(root);

    const colorScale = d3.scaleSequential()
      .domain([0, d3.max(artists, d => d.totalSongs)])
      .interpolator(d3.interpolateViridis);

    const circles = svg.selectAll("circle")
      .data(root.children)
      .enter()
      .append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.r * zoomLevel)
      .attr("fill", d => colorScale(d.data.totalSongs))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("r", d.r * zoomLevel * 1.2)
          .attr("stroke-width", 4);
        
        showTooltip(event, d.data, type);
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .attr("r", d.r * zoomLevel)
          .attr("stroke-width", 2);
        
        hideTooltip();
      })
      .on("click", function(event, d) {
        setHighlightedArtist(d.data.name);
        if (type === 'composers') onComposerClick({ name: d.data.name });
        if (type === 'singers') onSingerClick({ name: d.data.name });
        if (type === 'lyricists') onLyricistClick({ name: d.data.name });
      });

    // Add labels for larger circles
    svg.selectAll("text")
      .data(root.children.filter(d => d.r > 20))
      .enter()
      .append("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", d => Math.min(d.r / 3, 14) + "px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .style("pointer-events", "none")
      .text(d => d.data.name.length > 12 ? d.data.name.substring(0, 12) + "..." : d.data.name);
  };

  const showTooltip = (event, data, type) => {
    const tooltip = d3.select("body").append("div")
      .attr("class", "main-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.9)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "8px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("z-index", 1000)
      .style("max-width", "300px");

    let content = "";
    if (type === 'collaboration') {
      content = `
        <strong>Collaboration</strong><br/>
        Composer: ${data.composer}<br/>
        Singer: ${data.singer}<br/>
        Lyricist: ${data.lyricist}<br/>
        Songs: ${data.songs.length}<br/>
        Years: ${Math.min(...data.years)} - ${Math.max(...data.years)}<br/>
        Movies: ${data.movies.size}
      `;
    } else {
      const years = Array.from(data.activeYears);
      content = `
        <strong>${data.name}</strong><br/>
        Total Songs: ${data.totalSongs}<br/>
        Active: ${Math.min(...years)} - ${Math.max(...years)}<br/>
        Collaborators: ${data.collaborators.composers.size + data.collaborators.singers.size + data.collaborators.lyricists.size - 1}
      `;
    }

    tooltip.html(content)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 10) + "px");
  };

  const hideTooltip = () => {
    d3.selectAll(".main-tooltip").remove();
  };

  const resetView = () => {
    setZoomLevel(1);
    setSelectedYearRange([1960, 2024]);
    setSearchTerm('');
    setHighlightedArtist(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header Controls */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            🎵 Tamil Music Archaeology
          </h2>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search any artist..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Zoom Controls */}
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

            {/* Reset */}
            <button
              onClick={resetView}
              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Year Range Display */}
        <div className="text-sm text-gray-600 mb-4">
          🕒 Viewing: <strong>{selectedYearRange[0]} - {selectedYearRange[1]}</strong>
          {selectedYearRange[0] !== 1960 || selectedYearRange[1] !== 2024 ? (
            <span className="ml-2 text-blue-600">
              ({selectedYearRange[1] - selectedYearRange[0] + 1} years selected)
            </span>
          ) : (
            <span className="ml-2 text-green-600">(Complete timeline)</span>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'collaborations', label: '🤝 Collaborations', icon: Users },
            { key: 'composers', label: '🎼 Composers', icon: Music },
            { key: 'singers', label: '🎤 Singers', icon: Mic },
            { key: 'lyricists', label: '✍️ Lyricists', icon: PenTool }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Timeline */}
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          📊 Global Timeline - Brush to Select Years
        </h3>
        <div ref={timelineRef}></div>
      </div>

      {/* Main Visualization */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {activeTab === 'collaborations' && `🤝 ${filteredArtists.collaborations.length} Collaboration Networks`}
            {activeTab === 'composers' && `🎼 ${filteredArtists.composers.length} Composers`}
            {activeTab === 'singers' && `🎤 ${filteredArtists.singers.length} Singers`}
            {activeTab === 'lyricists' && `✍️ ${filteredArtists.lyricists.length} Lyricists`}
          </h3>
          <div className="text-sm text-gray-500">
            {activeTab === 'collaborations' 
              ? 'Drag nodes • Hover for details • Click to focus'
              : 'Circle size = activity • Hover for details • Click to filter'
            }
          </div>
        </div>
        
        <div className="h-96 w-full overflow-hidden rounded-lg border">
          <div ref={svgRef}></div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-4 grid grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{filteredArtists.collaborations.length}</div>
          <div className="text-sm text-blue-700">Unique Collaborations</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{filteredArtists.composers.length}</div>
          <div className="text-sm text-green-700">Active Composers</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{filteredArtists.singers.length}</div>
          <div className="text-sm text-purple-700">Active Singers</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{filteredArtists.lyricists.length}</div>
          <div className="text-sm text-orange-700">Active Lyricists</div>
        </div>
      </div>
    </div>
  );
};

export default UltimateMusicArchaeology;
