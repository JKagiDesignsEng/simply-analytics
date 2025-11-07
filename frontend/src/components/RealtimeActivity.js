import { useEffect } from 'react';
import { Activity, Eye, MapPin, Monitor, Smartphone, Tablet } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RealtimeActivity = ({ data, onRefresh }) => {
	useEffect(() => {
		// Refresh every 10 seconds
		const interval = setInterval(() => {
			if (onRefresh) onRefresh();
		}, 10000);

		return () => clearInterval(interval);
	}, [onRefresh]);

	if (!data) {
		return (
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
				<h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
					<Activity className='h-5 w-5 mr-2 text-primary-600' />
					Real-time Activity
				</h3>
				<div className='text-center py-8 text-gray-500'>Loading...</div>
			</div>
		);
	}

	const { activeVisitors, recentViews, currentPages } = data;

	const getDeviceIcon = (deviceType) => {
		switch (deviceType) {
			case 'mobile':
				return <Smartphone className='h-4 w-4 text-blue-600' />;
			case 'tablet':
				return <Tablet className='h-4 w-4 text-purple-600' />;
			default:
				return <Monitor className='h-4 w-4 text-green-600' />;
		}
	};

	return (
		<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
			<div className='flex items-center justify-between mb-6'>
				<h3 className='text-lg font-medium text-gray-900 flex items-center'>
					<Activity className='h-5 w-5 mr-2 text-primary-600' />
					Real-time Activity
				</h3>
				<div className='flex items-center gap-2'>
					<div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
					<span className='text-sm text-gray-600'>Live</span>
				</div>
			</div>

			{/* Active Visitors */}
			<div className='bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 mb-6'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='text-sm text-green-800 font-medium'>Active Visitors</p>
						<p className='text-4xl font-bold text-green-900'>{activeVisitors || 0}</p>
						<p className='text-xs text-green-700 mt-1'>In the last 5 minutes</p>
					</div>
					<Eye className='h-12 w-12 text-green-600 opacity-50' />
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Currently Viewing */}
				<div>
					<h4 className='text-sm font-medium text-gray-700 mb-3 flex items-center'>
						<Eye className='h-4 w-4 mr-2' />
						Currently Viewing
					</h4>
					<div className='space-y-2 max-h-96 overflow-y-auto'>
						{currentPages && currentPages.length > 0 ? (
							currentPages.map((page) => (
								<div
									key={page.path}
									className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
								>
									<div className='flex-1 min-w-0'>
										<p className='text-sm font-medium text-gray-900 truncate'>{page.path}</p>
										<p className='text-xs text-gray-500'>Active now</p>
									</div>
									<div className='flex items-center gap-2'>
										<div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
										<span className='text-lg font-bold text-green-600'>{page.viewer_count}</span>
									</div>
								</div>
							))
						) : (
							<div className='text-center py-8 text-gray-400'>No active visitors</div>
						)}
					</div>
				</div>

				{/* Recent Activity Feed */}
				<div>
					<h4 className='text-sm font-medium text-gray-700 mb-3 flex items-center'>
						<Activity className='h-4 w-4 mr-2' />
						Recent Activity
					</h4>
					<div className='space-y-2 max-h-96 overflow-y-auto'>
						{recentViews && recentViews.length > 0 ? (
							recentViews.map((view, index) => (
								<div
									key={index}
									className='flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
								>
									<div className='mt-0.5'>{getDeviceIcon(view.device_type)}</div>
									<div className='flex-1 min-w-0'>
										<p className='text-sm font-medium text-gray-900 truncate'>{view.path}</p>
										<div className='flex items-center gap-2 mt-1'>
											{view.country && (
												<span className='inline-flex items-center gap-1 text-xs text-gray-500'>
													<MapPin className='h-3 w-3' />
													{view.country}
												</span>
											)}
											{view.browser && (
												<span className='text-xs text-gray-500'>
													{view.browser}
												</span>
											)}
										</div>
									</div>
									<span className='text-xs text-gray-400 whitespace-nowrap'>
										{formatDistanceToNow(new Date(view.timestamp), { addSuffix: true })}
									</span>
								</div>
							))
						) : (
							<div className='text-center py-8 text-gray-400'>No recent activity</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default RealtimeActivity;
