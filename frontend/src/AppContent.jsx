import React, { useState, useEffect } from 'react';
import VideoFeed from './components/VideoFeed';
import { MetricsDashboard } from './components/MetricsDashboard';
import { Moon, Sun, Activity } from 'lucide-react';
import { useTheme } from './ThemeContext';

const MAX_HISTORY = 100;

function AppContent() {
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    // Determine WebSocket URL based on host
    // (Assuming backend is running on 8000 on the same host)
    const hostname = window.location.hostname;
    const wsUrl = `ws://${hostname}:8000/ws/metrics`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to metrics WebSocket');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const timestamp = new Date().getTime();
        
        setMetricsHistory(prev => {
          const newHistory = [...prev, { ...data, time: timestamp }];
          if (newHistory.length > MAX_HISTORY) {
            return newHistory.slice(newHistory.length - MAX_HISTORY);
          }
          return newHistory;
        });
      } catch (e) {
        console.error("Failed to parse websocket data", e);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="min-h-screen p-4 lg:p-6 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto h-full flex flex-col gap-6">
        
        {/* Header Area */}
        <header className="flex justify-between items-center glass-card py-3 px-6 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-xl md:text-2xl text-slate-800 dark:text-slate-100 mb-0 leading-none">
                    Realtime Dance Aesthetics
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-1">Live motion analytics dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`badge ${isConnected ? 'badge-active' : 'badge-inactive'} hidden md:flex items-center gap-2`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} ${isConnected ? 'animate-pulse' : ''}`}></span>
                {isConnected ? 'WS CONNECTED' : 'WS DISCONNECTED'}
            </div>
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-sm"
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[800px] xl:h-[calc(100vh-140px)] items-stretch">
          
          {/* Left Column: Video Feed (relative size = 5/12) */}
          <div className="lg:col-span-4 xl:col-span-5 h-[50vh] lg:h-full relative overflow-hidden rounded-2xl shadow-glass dark:shadow-glass-dark group">
              <VideoFeed url={`http://${window.location.hostname}:8000/video_feed`} />
          </div>
          
          {/* Right Column: 3x3 Dashboard (relative size = 7/12) */}
          <div className="lg:col-span-8 xl:col-span-7 h-full flex flex-col bg-slate-100/30 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-2 shadow-inner">
             <MetricsDashboard dataHistory={metricsHistory} />
          </div>

        </main>
      </div>
    </div>
  );
}

export default AppContent;
