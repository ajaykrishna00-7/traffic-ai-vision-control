
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Car, Clock, Navigation } from "lucide-react";

interface StatusPanelProps {
  status: any;
  isLoading: boolean;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ status, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const totalVehicles = status?.vehicle_counts?.reduce((a: number, b: number) => a + b, 0) || 0;
  const extraVehicles = status?.extra_counts?.reduce((a: number, b: number) => a + b, 0) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Status</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Badge variant={status?.running ? "default" : "secondary"}>
            {status?.running ? "Active" : "Stopped"}
          </Badge>
          <p className="text-xs text-muted-foreground mt-2">
            {status?.manual_override ? "Manual Mode" : "AI Control"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Direction</CardTitle>
          <Navigation className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {status?.direction_names?.[status?.current_direction] || "None"}
          </div>
          <p className="text-xs text-muted-foreground">
            Current signal direction
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVehicles}</div>
          <p className="text-xs text-muted-foreground">
            Main intersections: {totalVehicles} | Others: {extraVehicles}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{status?.remaining_time || 0}s</div>
          <p className="text-xs text-muted-foreground">
            Current phase duration
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
