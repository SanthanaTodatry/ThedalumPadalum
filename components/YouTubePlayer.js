import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, SkipForward, SkipBack, X, Search, ExternalLink } from 'lucide-react';

const YouTubePlayer = ({ 
  song, 
  isPlaying, 
  onPlay, 
  onPause, 
  onNext, 
  onPrevious, 
  onClose,
  className = ""
}) => {
  const [videoId, setVideoId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);

  // Add your YouTube API key here
  const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  
  // Search for video when song changes
  useEffect(() => {
    if (song && !videoId) {
      searchForVideo(song);
    }
  }, [song]);

  const searchForVideo = async (song) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const query = `${song.song} ${song.movie} ${song.singer}`;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search YouTube');
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        setVideoId(data.items[0].id.videoId);
      } else {
        throw new Error('No videos found');
      }
    } catch (error) {
      console.error('YouTube search error:', error);
      setError(error.message);
    }
    
    setIsLoading(false);
  };

  const fallbackToNewTab = () => {
    const query = `${song.song} ${song.movie} ${song.singer}`;
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  // YouTube player options
  const opts = {
    width: '100%',
    height: '240',
    playerVars: {
      autoplay: isPlaying ? 1 : 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      fs: 1, // Allow fullscreen
    },
  };

  // Handle player events
  const onReady = (event) => {
    setPlayer(event.target);
    if (isPlaying) {
      event.target.playVideo();
    }
  };

  const onStateChange = (event) => {
    // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    if (event.data === 1) {
      onPlay && onPlay();
    } else if (event.data === 2) {
      onPause && onPause();
    } else if (event.data === 0) {
      // Video ended, play next
      onNext && onNext();
    }
  };

  const handlePlayPause = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">🔍 Searching for video...</p>
          <p className="text-sm text-gray-500 mt-2">{song.song} - {song.singer}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !videoId) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Search className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Couldn't find video</p>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => searchForVideo(song)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              🔄 Try Again
            </button>
            
            <button
              onClick={fallbackToNewTab}
              className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open in YouTube
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Close Player
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border shadow-lg ${className}`}>
      {/* Song Info Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800 truncate">{song.song}</h3>
            <p className="text-gray-600 text-sm truncate">{song.movie} • {song.singer}</p>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
              title="Close Player"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* YouTube Player */}
      {videoId && (
        <div className="relative">
          <YouTube
            videoId={videoId}
            opts={opts}
            onReady={onReady}
            onStateChange={onStateChange}
            className="youtube-player"
          />
        </div>
      )}

      {/* Custom Controls */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-center gap-4">
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="p-2 bg-white text-gray-600 rounded-full hover:bg-gray-100 transition-colors shadow"
              title="Previous Song"
            >
              <SkipBack className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={handlePlayPause}
            className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          
          {onNext && (
            <button
              onClick={onNext}
              className="p-2 bg-white text-gray-600 rounded-full hover:bg-gray-100 transition-colors shadow"
              title="Next Song"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Additional Controls */}
        <div className="flex justify-center gap-2 mt-3">
          <button
            onClick={() => searchForVideo(song)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            title="Find Different Version"
          >
            🔄 Different Version
          </button>
          
          <button
            onClick={fallbackToNewTab}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 flex items-center gap-1"
            title="Open in YouTube"
          >
            <ExternalLink className="w-3 h-3" />
            YouTube
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;
