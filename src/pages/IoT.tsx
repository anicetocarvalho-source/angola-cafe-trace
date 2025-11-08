import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Thermometer, Droplets, Gauge, Plus, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function IoT() {
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);

  const { data: sensors, isLoading: sensorsLoading, refetch: refetchSensors } = useQuery({
    queryKey: ['iot-sensors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('iot_sensors')
        .select(`
          *,
          parcela:parcelas(codigo_parcela, exploracao:exploracoes(designacao))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: readings, isLoading: readingsLoading } = useQuery({
    queryKey: ['sensor-readings', selectedSensor],
    queryFn: async () => {
      if (!selectedSensor) return [];
      
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('sensor_id', selectedSensor)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data.reverse();
    },
    enabled: !!selectedSensor,
  });

  useEffect(() => {
    if (sensors && sensors.length > 0 && !selectedSensor) {
      setSelectedSensor(sensors[0].id);
    }
  }, [sensors, selectedSensor]);

  const getSensorIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'temperatura': return <Thermometer className="h-5 w-5" />;
      case 'humidade': return <Droplets className="h-5 w-5" />;
      case 'pressão': return <Gauge className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (sensorsLoading) return <LoadingSkeleton />;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard IoT</h1>
            <p className="text-muted-foreground mt-1">
              Monitorização em tempo real de sensores
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => refetchSensors()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Sensor
            </Button>
          </div>
        </div>

        {/* Sensors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sensors?.map((sensor) => (
            <Card
              key={sensor.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedSensor === sensor.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedSensor(sensor.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getSensorIcon(sensor.type)}
                    <CardTitle className="text-lg">{sensor.name}</CardTitle>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(sensor.status)}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{sensor.type}</p>
                <p className="text-xs text-muted-foreground mt-1">{sensor.location}</p>
                {sensor.parcela && (
                  <Badge variant="outline" className="mt-2">
                    {sensor.parcela.codigo_parcela}
                  </Badge>
                )}
                {sensor.last_reading_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Última leitura: {new Date(sensor.last_reading_at).toLocaleString('pt-PT')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Readings Chart */}
        {selectedSensor && (
          <Card>
            <CardHeader>
              <CardTitle>
                Histórico de Leituras - {sensors?.find(s => s.id === selectedSensor)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {readingsLoading ? (
                <div className="h-[400px] flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : readings && readings.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={readings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) => new Date(value).toLocaleTimeString('pt-PT')}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleString('pt-PT')}
                      formatter={(value: any) => [`${value} ${readings[0]?.unit || ''}`, 'Valor']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                      name="Leitura"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Nenhuma leitura disponível
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}