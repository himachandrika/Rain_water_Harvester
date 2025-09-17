import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

type Props = { 
	months: number[];
	dataPeriod?: string;
	yearsCount?: number;
};

export default function RainChart({ months, dataPeriod = '2023-2024', yearsCount = 2 }: Props) {
	// For historical data (like 2023-2024), show ALL 12 months
	// Only limit months for current year data
	const currentYear = new Date().getFullYear();
	const dataYear = dataPeriod.split('-')[1]; // Extract end year from "2023-2024"
	
	// If data is from previous years (complete years), show all 12 months
	// If data includes current year, only show up to current month
	const isHistoricalData = parseInt(dataYear) < currentYear;
	const maxMonthIndex = isHistoricalData ? 11 : new Date().getMonth(); // Show all months for historical data
	
	const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	const displayLabels = monthLabels.slice(0, maxMonthIndex + 1);
	const displayData = months.slice(0, maxMonthIndex + 1);
	
	const data = {
		labels: displayLabels,
		datasets: [
			{
				label: `Monthly Rainfall (mm) - Avg ${dataPeriod}`,
				data: displayData,
				borderColor: '#2563eb',
				backgroundColor: 'rgba(37, 99, 235, 0.3)',
				borderWidth: 2,
				fill: true
			}
		]
	};
	
	const options = {
		responsive: true,
		plugins: { 
			legend: { 
				display: true,
				position: 'top' as const,
				labels: {
					font: { size: 12 }
				}
			},
			title: {
				display: true,
				text: `Rainfall Pattern (${dataPeriod}, ${yearsCount} year avg)`,
				font: { size: 14, weight: 'bold' }
			}
		},
		scales: {
			y: {
				beginAtZero: true,
				title: {
					display: true,
					text: 'Rainfall (mm)'
				}
			},
			x: {
				title: {
					display: true,
					text: 'Month'
				}
			}
		}
	} as const;
	
	return (
		<div className="w-full">
			<Bar data={data} options={options} />
			<div className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
				Data period: {dataPeriod} ({yearsCount} year average)
			</div>
		</div>
	);
}
