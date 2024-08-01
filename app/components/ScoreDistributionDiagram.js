import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto'; // Automatically register the chart components

const ScoreDistributionChart = ({ quizId }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/dashboard/${quizId}`);
        const result = await response.json();
        setData(result.scoreDistribution);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [quizId]);

  if (!data) {
    return <div>Loading...</div>;
  }

  const chartData = {
    labels: Object.keys(data).map(key => `${key}-${key + 9}%`),
    datasets: [
      {
        label: 'Number of Respondents',
        data: Object.values(data), 
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Score Range (%)',
        }
      },
      y: {
        title: {
          display: true,
          text: 'Number of Respondents',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <div style={{ width: '100%', height: '500px' }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ScoreDistributionChart;
