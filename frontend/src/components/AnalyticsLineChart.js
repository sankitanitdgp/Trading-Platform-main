import React from 'react'
import {Chart as ChartJS,CategoryScale,Title,Tooltip,Legend} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {Chart, ArcElement, PointElement, LineController, LineElement, registerables} from 'chart.js'

Chart.register(ArcElement);
ChartJS.register(...registerables, CategoryScale, PointElement, LineController, LineElement, Title, Tooltip, Legend);


function AnalyticsLineChart(props) {
  const d = new Date();
  let dayNumber = d.getDay();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const labels = days.slice(dayNumber+1, 7).concat(days.slice(0, dayNumber+1));
    const data = {
        labels: labels,
        datasets: [
          {
            label: 'Profit',
            fill: false,
            lineTension: 0,
            backgroundColor: "#ff654d",
            borderColor: "#ff654d",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: "#ddd",
            pointBackgroundColor: "#ff654d",
            pointBorderWidth: 2,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#ff654d",
            pointHoverBorderColor: "#ddd",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: props.profitData
          },
          {
            label: 'Net Worth',
            fill: false,
            lineTension: 0,
            backgroundColor: "#509EED",
            borderColor: "#509EED",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: "#ddd",
            pointBackgroundColor: "#509EED",
            pointBorderWidth: 2,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#509EED",
            pointHoverBorderColor: "#ddd",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: props.valueData
          }
        ]
      };
      
      const options = {
        legend: {
          display: false,
          text: "price",
          position: "bottom"
        },
        scales: {
          y: {
            ticks: {
              color: "#ddd",
              stepSize: 2,
              beginAtZero: true
            }
          },
          x: { 
            ticks: {
              color: "#ddd",
              stepSize: 2,
              beginAtZero: true
            }
          }
        }
        
      };
  return (
    <div><Line data={data} options={options} /></div>
  )
}

export default AnalyticsLineChart