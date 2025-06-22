
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrafficGrid } from "@/components/TrafficGrid";
import { ControlPanel } from "@/components/ControlPanel";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { StatusPanel } from "@/components/StatusPanel";
import { useTrafficSystem } from "@/hooks/useTrafficSystem";

const Index = () => {
  const { 
    systemStatus, 
    startSystem, 
    stopSystem, 
    setManualOverride,
    isLoading 
  } = useTrafficSystem();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Traffic Signal Control System
          </h1>
          <p className="text-gray-600">
            Real-time traffic management with intelligent signal optimization
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <StatusPanel status={systemStatus} isLoading={isLoading} />
          </div>
          <div>
            <ControlPanel 
              onStart={startSystem}
              onStop={stopSystem}
              onManualOverride={setManualOverride}
              systemStatus={systemStatus}
              isLoading={isLoading}
            />
          </div>
        </div>

        <Tabs defaultValue="traffic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="traffic">Traffic Monitor</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="traffic" className="space-y-6">
            <TrafficGrid systemStatus={systemStatus} />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
