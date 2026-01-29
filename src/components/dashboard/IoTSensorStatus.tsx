import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Thermometer, 
  Droplets, 
  Wifi, 
  WifiOff, 
  Activity,
  ArrowRight,
  Gauge
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { Link } from "react-router-dom";

interface Sensor {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string | null;
  last_reading_at: string | null;
}

interface SensorReading {
  id: string;
  sensor_id: string;
  value: number;
  unit: string;
  timestamp: string;
}

export const IoTSensorStatus = () => {
  const { data: sensors, isLoading: loadingSensors } = useQuery({
    queryKey: ["dashboard-sensors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("iot_sensors")
        .select("*")
        .order("last_reading_at", { ascending: false, nullsFirst: false })
        .limit(6);
      if (error) throw error;
      return data as Sensor[];
    },
  });

  const { data: latestReadings } = useQuery({
    queryKey: ["dashboard-sensor-readings", sensors?.map(s => s.id)],
    queryFn: async () => {
      if (!sensors?.length) return [];
      const { data, error } = await supabase
        .from("sensor_readings")
        .select("*")
        .in("sensor_id", sensors.map(s => s.id))
        .order("timestamp", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as SensorReading[];
    },
    enabled: !!sensors?.length,
  });

  const getLatestReading = (sensorId: string) => {
    return latestReadings?.find(r => r.sensor_id === sensorId);
  };

  const getSensorIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "temperature":
        return <Thermometer className="h-5 w-5 text-destructive" />;
      case "humidity":
        return <Droplets className="h-5 w-5 text-primary" />;
      default:
        return <Gauge className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string, lastReading: string | null) => {
    const isOnline = status === "active" && lastReading && 
      (new Date().getTime() - new Date(lastReading).getTime()) < 3600000; // 1 hour
    
    if (isOnline) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Wifi className="h-3 w-3" />
          Online
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1 text-muted-foreground">
        <WifiOff className="h-3 w-3" />
        Offline
      </Badge>
    );
  };

  // Calculate summary stats
  const totalSensors = sensors?.length || 0;
  const activeSensors = sensors?.filter(s => s.status === "active").length || 0;
  const onlineSensors = sensors?.filter(s => 
    s.status === "active" && s.last_reading_at && 
    (new Date().getTime() - new Date(s.last_reading_at).getTime()) < 3600000
  ).length || 0;

  if (loadingSensors) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Status dos Sensores IoT
          </CardTitle>
          <CardDescription>
            Monitorização em tempo real dos dispositivos
          </CardDescription>
        </div>
        <div className="flex gap-2 text-sm">
          <Badge variant="secondary">{onlineSensors} online</Badge>
          <Badge variant="outline">{totalSensors} total</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {sensors && sensors.length > 0 ? (
          <>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {sensors.slice(0, 4).map((sensor) => {
                const reading = getLatestReading(sensor.id);
                return (
                  <div
                    key={sensor.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                  >
                    {getSensorIcon(sensor.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{sensor.name}</p>
                        {getStatusBadge(sensor.status, sensor.last_reading_at)}
                      </div>
                      {reading ? (
                        <p className="text-lg font-bold">
                          {reading.value.toFixed(1)} {reading.unit}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">Sem leitura</p>
                      )}
                      {sensor.last_reading_at && (
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(sensor.last_reading_at), {
                            addSuffix: true,
                            locale: pt,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/iot">
                Ver Todos os Sensores
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <WifiOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum sensor configurado</p>
            <Button variant="link" size="sm" asChild>
              <Link to="/iot">Configurar Sensores</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IoTSensorStatus;
