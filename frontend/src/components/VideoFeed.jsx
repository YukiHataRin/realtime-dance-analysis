import React, { useRef } from 'react';
import { Circle, Square, Video, Camera } from 'lucide-react';

const VideoFeed = ({ 
    url, 
    onRecordStart, 
    onRecordStop, 
    isRecording, 
    playbackUrl, 
    isPlayback, 
    onBackToLive,
    onPlaybackTimeUpdate 
}) => {
  const videoRef = useRef(null);

  const handleTimeUpdate = () => {
    if (videoRef.current && onPlaybackTimeUpdate) {
      onPlaybackTimeUpdate(videoRef.current.currentTime);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-full glass-card overflow-hidden flex flex-col group p-0 bg-black">
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {!isPlayback ? (
                <div className="badge badge-active flex items-center gap-2 bg-black/40 backdrop-blur-md border-white/20 text-white shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    LIVE WEBCAM
                </div>
            ) : (
                <div className="badge flex items-center gap-2 bg-blue-500/80 backdrop-blur-md border-white/20 text-white shadow-lg">
                    <Video className="w-3 h-3" />
                    PLAYBACK MODE
                </div>
            )}
            
            {isRecording && (
                <div className="badge flex items-center gap-2 bg-red-500/80 backdrop-blur-md border-white/20 text-white shadow-lg animate-bounce">
                    <Circle className="w-2 h-2 fill-current" />
                    RECORDING
                </div>
            )}
        </div>

        <div className="absolute bottom-6 right-6 z-10 flex items-center gap-3">
            {isPlayback ? (
                <button 
                    onClick={onBackToLive}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all transform hover:scale-105"
                >
                    <Camera className="w-4 h-4" />
                    Back to Live
                </button>
            ) : !isRecording ? (
                <button 
                    onClick={onRecordStart}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all transform hover:scale-105"
                >
                    <Video className="w-4 h-4" />
                    Start Record
                </button>
            ) : (
                <button 
                    onClick={onRecordStop}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full shadow-lg transition-all transform hover:scale-105 border border-white/20"
                >
                    <Square className="w-4 h-4 fill-current" />
                    Stop Record
                </button>
            )}
        </div>

        {isPlayback ? (
            <video 
                ref={videoRef}
                src={playbackUrl} 
                controls 
                autoPlay 
                loop
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-contain rounded-xl"
            />
        ) : (
            <img 
                src={url} 
                alt="Realtime Dance Pose Feed" 
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
            />
        )}
        
        <div className="hidden absolute inset-0 items-center justify-center flex-col gap-4 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl">
            <span className="text-4xl">📷</span>
            <p className="font-mono text-slate-800 dark:text-slate-200">Waiting for video stream...</p>
        </div>
    </div>
  );
};

export default VideoFeed;
