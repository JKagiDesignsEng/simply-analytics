import { Globe2, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const LanguageAnalytics = ({ data }) => {
	if (!data) {
		return (
			<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
				<h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
					<Globe2 className='h-5 w-5 mr-2 text-primary-600' />
					Language & Locale
				</h3>
				<div className='text-center py-8 text-gray-500'>Loading...</div>
			</div>
		);
	}

	const { languages, timezones } = data;

	return (
		<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
			<h3 className='text-lg font-medium text-gray-900 mb-6 flex items-center'>
				<Globe2 className='h-5 w-5 mr-2 text-primary-600' />
				Language & Locale Analytics
			</h3>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				{/* Languages */}
				<div>
					<h4 className='text-sm font-medium text-gray-700 mb-4 flex items-center'>
						<Globe2 className='h-4 w-4 mr-2' />
						Top Languages
					</h4>
					{languages && languages.length > 0 ? (
						<>
							<div className='h-64 mb-4'>
								<ResponsiveContainer width='100%' height='100%'>
									<PieChart>
										<Pie
											data={languages.slice(0, 6)}
											cx='50%'
											cy='50%'
											labelLine={false}
											label={({ language, percent }) => `${language} (${(percent * 100).toFixed(0)}%)`}
											outerRadius={80}
											fill='#8884d8'
											dataKey='views'
										>
											{languages.slice(0, 6).map((entry, index) => (
												<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
											))}
										</Pie>
										<Tooltip />
									</PieChart>
								</ResponsiveContainer>
							</div>
							<div className='space-y-2'>
								{languages.slice(0, 5).map((lang, index) => (
									<div
										key={lang.language}
										className='flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors'
									>
										<div className='flex items-center gap-2'>
											<div
												className='w-3 h-3 rounded-full'
												style={{ backgroundColor: COLORS[index % COLORS.length] }}
											/>
											<span className='text-sm font-medium text-gray-900'>{lang.language}</span>
										</div>
										<div className='flex items-center gap-3'>
											<span className='text-xs text-gray-500'>{lang.unique_visitors} visitors</span>
											<span className='text-sm font-semibold text-primary-600'>{lang.views} views</span>
										</div>
									</div>
								))}
							</div>
						</>
					) : (
						<div className='text-center py-8 text-gray-400'>No language data yet</div>
					)}
				</div>

				{/* Timezones */}
				<div>
					<h4 className='text-sm font-medium text-gray-700 mb-4 flex items-center'>
						<Clock className='h-4 w-4 mr-2' />
						Top Timezones
					</h4>
					{timezones && timezones.length > 0 ? (
						<div className='space-y-2'>
							{timezones.slice(0, 10).map((tz) => {
								const totalViews = timezones.reduce((sum, t) => sum + Number.parseInt(t.views), 0);
								const percentage = ((tz.views / totalViews) * 100).toFixed(1);
								
								return (
									<div
										key={tz.timezone}
										className='flex flex-col p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors'
									>
										<div className='flex items-center justify-between mb-1'>
											<span className='text-sm font-medium text-gray-900'>{tz.timezone}</span>
											<span className='text-xs text-gray-500'>{percentage}%</span>
										</div>
										<div className='flex items-center justify-between'>
											<div className='flex-1 bg-gray-200 rounded-full h-2 mr-3'>
												<div
													className='bg-primary-500 h-2 rounded-full'
													style={{ width: `${percentage}%` }}
												/>
											</div>
											<span className='text-xs text-gray-500'>{tz.views} views</span>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className='text-center py-8 text-gray-400'>No timezone data yet</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default LanguageAnalytics;
