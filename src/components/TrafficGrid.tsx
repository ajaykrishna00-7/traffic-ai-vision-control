
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrafficGridProps {
  systemStatus: any;
}

interface CameraFeed {
  id: number;
  image: string;
  direction: string;
  state: string;
  count: number;
  remainingTime: number;
}

export const TrafficGrid: React.FC<TrafficGridProps> = ({ systemStatus }) => {
  const [cameraFeeds, setCameraFeeds] = useState<CameraFeed[]>([]);

  useEffect(() => {
    if (!systemStatus?.running) return;

    const fetchCameraFeeds = async () => {
      const feeds: CameraFeed[] = [];
      
      for (let i = 0; i < 4; i++) {
        try {
          const response = await fetch(`http://localhost:5000/api/camera/${i}`);
          const data = await response.json();
          
          if (data.image) {
            feeds.push({
              id: i,
              image: data.image,
              direction: systemStatus.direction_names[i],
              state: systemStatus.current_states[i],
              count: systemStatus.vehicle_counts[i],
              remainingTime: systemStatus.remaining_time
            });
          }
        } catch (error) {
          console.error(`Error fetching camera ${i}:`, error);
        }
      }
      
      setCameraFeeds(feeds);
    };

    fetchCameraFeeds();
    const interval = setInterval(fetchCameraFeeds, 1000);

    return () => clearInterval(interval);
  }, [systemStatus]);

  const getStateColor = (state: string) => {
    switch (state) {
      case 'GREEN': return 'bg-green-500';
      case 'YELLOW': return 'bg-yellow-500';
      case 'RED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!systemStatus?.running) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-500 mb-2">System Offline</h3>
            <p className="text-gray-400">Start the system to view camera feeds</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cameraFeeds.map((feed) => (
        <Card key={feed.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{feed.direction}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={`${getStateColor(feed.state)} text-white`}>
                  {feed.state}
                  {feed.state !== 'RED' && ` (${feed.remainingTime}s)`}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {feed.image ? (
                <img 
                  src={feed.image} 
                  alt={`Camera ${feed.id + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Loading...</p>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded">
                Vehicles: {feed.count}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
