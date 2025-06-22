
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Play, Square, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ControlPanelProps {
  onStart: () => void;
  onStop: () => void;
  onManualOverride: (enabled: boolean, states?: string[]) => void;
  systemStatus: any;
  isLoading: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onStart,
  onStop,
  onManualOverride,
  systemStatus,
  isLoading
}) => {
  const [manualMode, setManualMode] = useState(false);
  const { toast } = useToast();

  const handleStart = () => {
    onStart();
    toast({
      title: "System Started",
      description: "AI traffic control system is now active",
    });
  };

  const handleStop = () => {
    onStop();
    toast({
      title: "System Stopped",
      description: "Traffic control system has been stopped",
    });
  };

  const handleManualToggle = (enabled: boolean) => {
    setManualMode(enabled);
    onManualOverride(enabled);
    toast({
      title: enabled ? "Manual Mode Enabled" : "Automatic Mode Enabled",
      description: enabled 
        ? "You can now manually control traffic signals" 
        : "System returned to AI control",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          System Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleStart}
            disabled={systemStatus?.running || isLoading}
            className="w-full"
            variant="default"
          >
            <Play className="h-4 w-4 mr-2" />
            Start System
          </Button>
          
          <Button 
            onClick={handleStop}
            disabled={!systemStatus?.running || isLoading}
            className="w-full"
            variant="destructive"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop System
          </Button>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="manual-mode"
              checked={manualMode}
              onCheckedChange={handleManualToggle}
              disabled={!systemStatus?.running || isLoading}
            />
            <Label htmlFor="manual-mode">Manual Override</Label>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Override AI control for manual signal management
          </p>
        </div>

        {systemStatus && (
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-semibold text-sm">Current Status</h4>
            <div className="text-sm space-y-1">
              <p>Mode: {systemStatus.manual_override ? 'Manual' : 'Automatic'}</p>
              <p>Active Direction: {systemStatus.direction_names?.[systemStatus.current_direction]}</p>
              <p>Remaining Time: {systemStatus.remaining_time}s</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
