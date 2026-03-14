import React from 'react';

const VideoFeed = ({ url }) => {
  return (
    <div className="relative w-full h-full min-h-[400px] lg:min-h-full glass-card overflow-hidden flex flex-col group p-0">
        <div className="absolute top-4 left-4 z-10">
            <div className="badge badge-active flex items-center gap-2 bg-black/40 backdrop-blur-md border-white/20 text-white shadow-lg">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                LIVE WEBCAM
            </div>
        </div>
        <img 
            src={url} 
            alt="Realtime Dance Pose Feed" 
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
            }}
        />
        <div className="hidden absolute inset-0 items-center justify-center flex-col gap-4 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl">
            <span className="text-4xl">📷</span>
            <p className="font-mono text-slate-800 dark:text-slate-200">Waiting for video stream...</p>
        </div>
    </div>
  );
};

export default VideoFeed;
