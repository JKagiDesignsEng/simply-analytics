import { Activity, Zap, Clock, TrendingDown, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

const PerformanceMetrics = ({ performanceData }) => {
	if (!performanceData || !performanceData.summary) {
		return (
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
				<h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
					<Activity className='h-5 w-5 mr-2 text-primary-600' />
					Performance Metrics
				</h3>
				<p className='text-sm text-gray-500'>
					Not enough performance data available yet.
				</p>
			</div>
		);
	}

	const { summary, daily } = performanceData;

	const formatTime = (ms) => {
		if (!ms) return 'N/A';
		if (ms < 1000) return `${Math.round(ms)}ms`;
		return `${(ms / 1000).toFixed(2)}s`;
	};

	const getPerformanceColor = (ms) => {
		if (!ms) return 'text-gray-500';
		if (ms < 1000) return 'text-green-600';
		if (ms < 2500) return 'text-yellow-600';
		return 'text-red-600';
	};

	const getPerformanceIcon = (ms) => {
		if (!ms) return <Clock className='h-5 w-5 text-gray-500' />;
		if (ms < 1000) return <Zap className='h-5 w-5 text-green-500' />;
		if (ms < 2500) return <TrendingUp className='h-5 w-5 text-yellow-500' />;
		return <TrendingDown className='h-5 w-5 text-red-500' />;
	};

	return (
		<div className='space-y-6'>
			{/* Performance Summary Cards */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
					<div className='flex items-center justify-between mb-2'>
						<p className='text-sm font-medium text-gray-600'>Avg Load Time</p>
						{getPerformanceIcon(summary.avg_load_time)}
					</div>
					<p className={`text-2xl font-bold ${getPerformanceColor(summary.avg_load_time)}`}>
						{formatTime(summary.avg_load_time)}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						Target: &lt;2.5s
					</p>
				</div>

				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
					<div className='flex items-center justify-between mb-2'>
						<p className='text-sm font-medium text-gray-600'>Median Load Time</p>
						{getPerformanceIcon(summary.median_load_time)}
					</div>
					<p className={`text-2xl font-bold ${getPerformanceColor(summary.median_load_time)}`}>
						{formatTime(summary.median_load_time)}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						50th percentile
					</p>
				</div>

				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
					<div className='flex items-center justify-between mb-2'>
						<p className='text-sm font-medium text-gray-600'>P95 Load Time</p>
						{getPerformanceIcon(summary.p95_load_time)}
					</div>
					<p className={`text-2xl font-bold ${getPerformanceColor(summary.p95_load_time)}`}>
						{formatTime(summary.p95_load_time)}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						95th percentile
					</p>
				</div>

				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
					<div className='flex items-center justify-between mb-2'>
						<p className='text-sm font-medium text-gray-600'>First Contentful Paint</p>
						{getPerformanceIcon(summary.avg_first_contentful_paint)}
					</div>
					<p className={`text-2xl font-bold ${getPerformanceColor(summary.avg_first_contentful_paint)}`}>
						{formatTime(summary.avg_first_contentful_paint)}
					</p>
					<p className='text-xs text-gray-500 mt-1'>
						Avg FCP time
					</p>
				</div>
			</div>

			{/* Performance Over Time Chart */}
			{daily && daily.length > 0 && (
				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
					<h3 className='text-lg font-medium text-gray-900 mb-4'>
						Performance Trends
					</h3>
					<div className='h-80'>
						<ResponsiveContainer width='100%' height='100%'>
							<LineChart data={daily}>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis
									dataKey='date'
									tickFormatter={(value) =>
										format(parseISO(value), 'MMM dd')
									}
								/>
								<YAxis
									label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }}
								/>
								<Tooltip
									labelFormatter={(value) =>
										format(parseISO(value), 'MMM dd, yyyy')
									}
									formatter={(value) => [formatTime(value), '']}
								/>
								<Legend />
								<Line
									type='monotone'
									dataKey='avg_load_time'
									stroke='#2563eb'
									strokeWidth={3}
									name='Load Time'
									dot={{ r: 5 }}
								/>
								<Line
									type='monotone'
									dataKey='avg_fcp'
									stroke='#059669'
									strokeWidth={3}
									name='First Contentful Paint'
									dot={{ r: 5 }}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>
			)}
		</div>
	);
};

export default PerformanceMetrics;
