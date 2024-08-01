import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const PredictionDistributionChart = ({ predictions }) => {
  const counts = predictions.reduce((acc, prediction) => {
    if (prediction === 'Well Prepared') {
      acc.wellPrepared += 1;
    } else if (prediction === 'Less Prepared') {
      acc.lessPrepared += 1;
    }
    return acc;
  }, { wellPrepared: 0, lessPrepared: 0 });

  const data = {
    labels: ['Well Prepared', 'Less Prepared'],
    datasets: [
      {
        label: 'Number of Respondents',
        data: [counts.wellPrepared, counts.lessPrepared],
        backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className='p-4 rounded-lg shadow-md'>
      <div style={{ width: '100%', height: '500px' }}>
        <Bar data={data} />
      </div>
    </div>
  );
};

export default PredictionDistributionChart;
