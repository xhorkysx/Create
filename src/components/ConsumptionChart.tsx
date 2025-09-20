import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ConsumptionEntry {
  id: string;
  date: string;
  fuelConsumption?: number;
  kilometers: number;
  averageConsumption: number;
  notes?: string;
}

interface ConsumptionChartProps {
  entries: ConsumptionEntry[];
  currentMonth: Date;
}

export function ConsumptionChart({ entries, currentMonth }: ConsumptionChartProps) {
  console.log('ConsumptionChart - entries:', entries);
  console.log('ConsumptionChart - entries.length:', entries.length);
  console.log('ConsumptionChart - currentMonth:', currentMonth);
  
  // Filter entries for current month only
  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();
  
  const monthlyEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonthIndex;
  });
  
  console.log('ConsumptionChart - monthlyEntries:', monthlyEntries);
  console.log('ConsumptionChart - monthlyEntries.length:', monthlyEntries.length);
  
  if (monthlyEntries.length === 0) {
    return (
      <Card className="relative z-10">
        <CardHeader>
          <CardTitle>
            Graf spotřeby - {currentMonth.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <div className="h-12 w-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <p>Žádná data pro zobrazení grafu</p>
            <p className="text-sm">Přidejte záznamy spotřeby pro zobrazení grafu</p>
            <p className="text-xs text-red-500 mt-2">DEBUG: monthlyEntries.length = {monthlyEntries.length}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort monthly entries by date
  const sortedEntries = [...monthlyEntries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Use only entries with data (no empty dates)
  const allEntries = sortedEntries;

  // Calculate statistics
  const totalFuel = sortedEntries.reduce((sum, entry) => sum + (entry.kilometers * entry.averageConsumption / 100), 0);
  const totalKilometers = sortedEntries.reduce((sum, entry) => sum + entry.kilometers, 0);
  const averageConsumption = sortedEntries.length > 0 ? sortedEntries.reduce((sum, entry) => sum + entry.averageConsumption, 0) / sortedEntries.length : 0;
  
  // Combined chart values - use separate scales
  const minConsumption = Math.min(...sortedEntries.map(e => e.averageConsumption));
  const maxConsumption = Math.max(...sortedEntries.map(e => e.averageConsumption));
  const maxKilometers = Math.max(...sortedEntries.map(e => e.kilometers));
  const chartHeight = 200;
  

  return (
    <Card className="relative z-10">
      <CardHeader>
        <CardTitle>
          Graf spotřeby - {currentMonth.toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Statistics */}
        <div className="flex justify-center items-center mb-6" style={{ gap: '80px' }}>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {averageConsumption.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Průměr (l/100km)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalKilometers.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Celkem km</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalFuel.toFixed(0)}
            </div>
            <div className="text-sm text-gray-600">Celkem paliva (l)</div>
          </div>
        </div>

        {/* Combined chart with axes */}
        <div className="space-y-4">
          <h4 className="font-medium">Spotřeba a kilometry v čase</h4>
          <div className="p-4 bg-gray-50 rounded-lg">
            {/* Y-axis labels and chart area */}
            <div style={{ display: 'flex', height: '300px', position: 'relative' }}>
              {/* Y-axis labels - for consumption */}
              <div style={{ width: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '8px' }}>
                {[maxConsumption, maxConsumption * 0.75, maxConsumption * 0.5, maxConsumption * 0.25, 0].map((value, index) => (
                  <div key={index} style={{ fontSize: '10px', color: '#6b7280', textAlign: 'right' }}>
                    {value.toFixed(1)}
                  </div>
                ))}
              </div>
              
              {/* Chart area with line */}
              <div style={{ flex: 1, position: 'relative', borderLeft: '1px solid #d1d5db', borderBottom: '1px solid #d1d5db' }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                  <div
                    key={index}
                    style={{
                      position: 'absolute',
                      top: `${ratio * 100}%`,
                      left: 0,
                      right: 0,
                      height: '1px',
                      backgroundColor: '#e5e7eb',
                      zIndex: 0
                    }}
                  />
                ))}
                
                {/* Combined chart - bars for kilometers and line for consumption */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, display: 'flex', alignItems: 'flex-end', padding: '0 2px' }}>
                  {/* Bars for kilometers - scaled to fit in bottom 30% of chart */}
                  {allEntries.map((entry, index) => {
                    const barHeight = (entry.kilometers / maxKilometers) * 30; // Max 30% of chart height
                    const barWidth = 100 / allEntries.length;
                    
                    return (
                      <div
                        key={`bar-${entry.id}`}
                        style={{
                          width: `${barWidth}%`,
                          height: `${barHeight}%`,
                          backgroundColor: '#10b981',
                          margin: '0 1px',
                          position: 'relative',
                          borderRadius: '2px 2px 0 0',
                          opacity: 0.7
                        }}
                      >
                        {/* Kilometer value label above the bar */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '-20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#059669',
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {entry.kilometers}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Line chart for consumption */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }} viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Line connecting points */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1"
                    points={allEntries.map((entry, index) => {
                      const x = 5 + (index / Math.max(allEntries.length - 1, 1)) * 90;
                      const y = 95 - (entry.averageConsumption / maxConsumption) * 90;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  
                  {/* Data points */}
                  {allEntries.map((entry, index) => {
                    const x = 5 + (index / Math.max(allEntries.length - 1, 1)) * 90;
                    const y = 95 - (entry.averageConsumption / maxConsumption) * 90;
                    const isRecent = index >= allEntries.length - 3;
                    
                    return (
                      <g key={entry.id}>
                        {/* Point */}
                        <circle
                          cx={x}
                          cy={y}
                          r="2"
                          fill={isRecent ? '#1e40af' : '#3b82f6'}
                          stroke="white"
                          strokeWidth="0.5"
                        />
                        
                        {/* Value label */}
                        <text
                          x={x}
                          y={y - 4}
                          textAnchor="middle"
                          fontSize="2.5"
                          fontWeight="bold"
                          fill="#1f2937"
                        >
                          {entry.averageConsumption}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
            
            {/* X-axis labels */}
            <div style={{ display: 'flex', marginTop: '8px', paddingLeft: '58px' }}>
              {allEntries.map((entry) => {
                const date = new Date(entry.date);
                return (
                  <div key={entry.id} style={{ flex: 1, fontSize: '10px', color: '#6b7280', textAlign: 'center' }}>
                    {date.toLocaleDateString('cs-CZ', { day: '2-digit', month: '2-digit' })}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '16px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px', opacity: 0.7 }}></div>
                <span style={{ color: '#6b7280' }}>Kilometry (spodní 30%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '20px', height: '2px', backgroundColor: '#3b82f6' }}></div>
                <span style={{ color: '#6b7280' }}>Spotřeba (l/100km) - Y osa</span>
              </div>
            </div>
            
            {/* Axis labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
              <div>Dny</div>
              <div>Hodnoty</div>
            </div>
          </div>
        </div>


        {/* Range info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Nejlepší: <strong className="text-green-600">{minConsumption} l/100km</strong></span>
            <span>Nejhorší: <strong className="text-red-600">{maxConsumption} l/100km</strong></span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
