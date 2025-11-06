import { AlertCircle, CheckCircle, Info, TrendingUp, Zap } from 'lucide-react';

const Insights = ({ insights }) => {
	if (!insights || insights.length === 0) {
		return (
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
				<h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
					<Zap className='h-5 w-5 mr-2 text-yellow-500' />
					Insights & Suggestions
				</h3>
				<p className='text-sm text-gray-500'>
					Not enough data yet. Keep tracking to get personalized insights!
				</p>
			</div>
		);
	}

	const getIcon = (type) => {
		switch (type) {
			case 'warning':
				return <AlertCircle className='h-5 w-5 text-orange-500' />;
			case 'success':
				return <CheckCircle className='h-5 w-5 text-green-500' />;
			case 'info':
				return <Info className='h-5 w-5 text-blue-500' />;
			default:
				return <TrendingUp className='h-5 w-5 text-purple-500' />;
		}
	};

	const getBgColor = (type) => {
		switch (type) {
			case 'warning':
				return 'bg-orange-50 border-orange-200';
			case 'success':
				return 'bg-green-50 border-green-200';
			case 'info':
				return 'bg-blue-50 border-blue-200';
			default:
				return 'bg-purple-50 border-purple-200';
		}
	};

	const getTextColor = (type) => {
		switch (type) {
			case 'warning':
				return 'text-orange-900';
			case 'success':
				return 'text-green-900';
			case 'info':
				return 'text-blue-900';
			default:
				return 'text-purple-900';
		}
	};

	const getCategoryBadge = (category) => {
		const badges = {
			performance: 'bg-red-100 text-red-700',
			engagement: 'bg-blue-100 text-blue-700',
			audience: 'bg-purple-100 text-purple-700',
			trending: 'bg-green-100 text-green-700',
		};
		return badges[category] || 'bg-gray-100 text-gray-700';
	};

	return (
		<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
			<h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
				<Zap className='h-5 w-5 mr-2 text-yellow-500' />
				Insights & Suggestions
			</h3>

			<div className='space-y-4'>
				{insights.map((insight, index) => (
					<div
						key={index}
						className={`p-4 rounded-lg border-2 ${getBgColor(insight.type)} transition-all hover:shadow-md`}
					>
						<div className='flex items-start'>
							<div className='flex-shrink-0 mt-1'>
								{getIcon(insight.type)}
							</div>
							<div className='ml-3 flex-1'>
								<div className='flex items-center justify-between mb-2'>
									<h4 className={`text-sm font-semibold ${getTextColor(insight.type)}`}>
										{insight.title}
									</h4>
									<span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryBadge(insight.category)}`}>
										{insight.category}
									</span>
								</div>
								<p className={`text-sm ${getTextColor(insight.type)} opacity-90`}>
									{insight.message}
								</p>
								{insight.path && (
									<p className='text-xs text-gray-600 mt-2 font-mono bg-white px-2 py-1 rounded'>
										{insight.path}
									</p>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Insights;
