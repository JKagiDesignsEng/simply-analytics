import { Wifi, Activity, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ConnectionQuality = ({ data }) => {
	if (!data) {
		return (
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
				<h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
					<Wifi className='h-5 w-5 mr-2 text-primary-600' />
					Connection Quality
				</h3>
				<div className='text-center py-8 text-gray-500'>Loading...</div>
			</div>
		);
	}

	const { connectionTypes, avgMetrics } = data;

	// Helper to safely format numeric values
	const formatNumber = (value, decimals = 1) => {
		if (value === null || value === undefined || Number.isNaN(value)) {
			return null;
		}
		const num = Number(value);
		return Number.isNaN(num) ? null : num.toFixed(decimals);
	};

	const getConnectionColor = (type) => {
		if (!type) return '#9ca3af';
		if (type.includes('4g') || type.includes('5g')) return '#10b981';
		if (type.includes('3g')) return '#f59e0b';
		if (type.includes('2g')) return '#ef4444';
		return '#3b82f6';
	};

	const getConnectionLabel = (type) => {
		if (!type) return 'Unknown';
		return type.toUpperCase();
	};

	return (
		<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
			<h3 className='text-lg font-medium text-gray-900 mb-6 flex items-center'>
				<Wifi className='h-5 w-5 mr-2 text-primary-600' />
				Connection Quality
			</h3>

			{/* Summary Stats */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
				<div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-blue-800 font-medium'>Avg Download Speed</p>
							<p className='text-2xl font-bold text-blue-900'>
								{formatNumber(avgMetrics?.avg_downlink) ? `${formatNumber(avgMetrics.avg_downlink)} Mbps` : 'N/A'}
							</p>
						</div>
						<Zap className='h-8 w-8 text-blue-600' />
					</div>
				</div>

				<div className='bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-green-800 font-medium'>Median Download</p>
							<p className='text-2xl font-bold text-green-900'>
								{formatNumber(avgMetrics?.median_downlink) ? `${formatNumber(avgMetrics.median_downlink)} Mbps` : 'N/A'}
							</p>
						</div>
						<Activity className='h-8 w-8 text-green-600' />
					</div>
				</div>

				<div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-purple-800 font-medium'>Avg Latency (RTT)</p>
							<p className='text-2xl font-bold text-purple-900'>
								{avgMetrics?.avg_rtt ? `${Math.round(Number(avgMetrics.avg_rtt))} ms` : 'N/A'}
							</p>
						</div>
						<Wifi className='h-8 w-8 text-purple-600' />
					</div>
				</div>
			</div>

			{/* Connection Types Chart */}
			{connectionTypes && connectionTypes.length > 0 ? (
				<>
					<h4 className='text-sm font-medium text-gray-700 mb-4'>Connection Types Distribution</h4>
					<div className='h-64 mb-4'>
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart data={connectionTypes}>
								<CartesianGrid strokeDasharray='3 3' />
								<XAxis 
									dataKey='connection_type' 
									tickFormatter={getConnectionLabel}
								/>
								<YAxis />
								<Tooltip 
									labelFormatter={getConnectionLabel}
									formatter={(value, name) => [value, name === 'views' ? 'Views' : name]}
								/>
								<Bar 
									dataKey='views' 
									fill='#3b82f6'
									radius={[8, 8, 0, 0]}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>

					{/* Connection Type Details */}
					<div className='space-y-2'>
						{connectionTypes.map((conn) => {
							const totalViews = connectionTypes.reduce((sum, c) => sum + Number.parseInt(c.views), 0);
							const percentage = ((conn.views / totalViews) * 100).toFixed(1);

							return (
								<div
									key={conn.connection_type}
									className='flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors'
								>
									<div className='flex items-center gap-3'>
										<div
											className='w-3 h-3 rounded-full'
											style={{ backgroundColor: getConnectionColor(conn.connection_type) }}
										/>
										<span className='text-sm font-medium text-gray-900'>
											{getConnectionLabel(conn.connection_type)}
										</span>
										<span className='text-xs text-gray-500'>{percentage}%</span>
									</div>
									<div className='flex items-center gap-4 text-xs text-gray-600'>
										{formatNumber(conn.avg_downlink) && (
											<span>{formatNumber(conn.avg_downlink)} Mbps</span>
										)}
										{conn.avg_rtt && (
											<span>{Math.round(Number(conn.avg_rtt))} ms RTT</span>
										)}
										<span className='font-semibold text-primary-600'>{conn.views} views</span>
									</div>
								</div>
							);
						})}
					</div>
				</>
			) : (
				<div className='text-center py-8 text-gray-400'>No connection data yet</div>
			)}
		</div>
	);
};

export default ConnectionQuality;
