import { createChart } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

const Chart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chartOptions = {
      layout: {
        textColor: 'black',
        background: { type: 'solid', color: 'white' },
      },
    };
    const chart = createChart(chartRef.current, chartOptions);

    const series = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const data = [
      { time: 1542844800, value: 10 },
      { time: 1546214400, value: 20 },
      { time: 1548979200, value: 15 }
    ];
    
    data.sort((a, b) => a.time - b.time);
    
    const datesForMarkers = [
      { time: { year: 2018, month: 11, day: 22 }, high: 75.29, low: 65.42 },
      { time: { year: 2018, month: 12, day: 13 }, high: 80.87, low: 71.12 },
    ];
    
    let indexOfMinPrice = 0;
    for (let i = 1; i < datesForMarkers.length; i++) {
      if (datesForMarkers[i].high < datesForMarkers[indexOfMinPrice].high) {
        indexOfMinPrice = i;
      }
    }
    
    const markers = [
      {
        time: data[0].time,
        position: 'aboveBar',
        color: '#f68410',
        shape: 'circle',
        text: 'D',
      },
    ];
    
    for (let i = 0; i < datesForMarkers.length; i++) {
      if (i !== indexOfMinPrice) {
        markers.push({
          time: datesForMarkers[i].time,
          position: 'aboveBar',
          color: '#e91e63',
          shape: 'arrowDown',
          text: 'Sell @ ' + Math.floor(datesForMarkers[i].high + 2),
        });
      } else {
        markers.push({
          time: datesForMarkers[i].time,
          position: 'belowBar',
          color: '#2196F3',
          shape: 'arrowUp',
          text: 'Buy @ ' + Math.floor(datesForMarkers[i].low - 2),
        });
      }
    }
    
    series.setMarkers(markers);
    chart.timeScale().fitContent();
  }, []);

  return <div id="container" ref={chartRef} />;
};

export default Chart;