import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { websitesAPI, analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
    Eye,
    Users,
    Globe,
    Clock,
    TrendingUp,
    Monitor,
    Smartphone,
    Tablet,
    MapPin,
    ExternalLink,
    BarChart3,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import WorldMap from './WorldMap';
import Insights from './Insights';
import PerformanceMetrics from './PerformanceMetrics';
import LanguageAnalytics from './LanguageAnalytics';
import ConnectionQuality from './ConnectionQuality';
import AdvancedAnalytics from './AdvancedAnalytics';
import RealtimeActivity from './RealtimeActivity';

const Dashboard = () => {
	const { websiteId } = useParams();
	const [selectedWebsite, setSelectedWebsite] = useState(websiteId || null);
	const [period, setPeriod] = useState('7d');
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
	const [newWebsiteName, setNewWebsiteName] = useState('');
	const [newWebsiteDomain, setNewWebsiteDomain] = useState('');
	const [newlyCreatedWebsite, setNewlyCreatedWebsite] = useState(null);

	const queryClient = useQueryClient();
	const socketRef = useRef(null);

	const createMutation = useMutation(
		(newWebsite) => websitesAPI.create(newWebsite),
		{
			onSuccess: (response) => {
				queryClient.invalidateQueries('websites');
				setSelectedWebsite(response.data.id);
				setNewlyCreatedWebsite(response.data);
				toast.success('Website added successfully');
				setIsAddModalOpen(false);
				setIsTrackingModalOpen(true);
				setNewWebsiteName('');
				setNewWebsiteDomain('');
			},
			onError: (error) => {
				toast.error(`Failed to add website: ${error.response?.data?.error || error.message}`);
			},
		}
	);

	const handleAddWebsite = () => {
		if (!newWebsiteName || !newWebsiteDomain) {
			toast.error('Please fill in all fields');
			return;
		}
		
		createMutation.mutate({ name: newWebsiteName, domain: newWebsiteDomain });
	};

    // Fetch websites
    const { data: websites, isLoading: websitesLoading } = useQuery(
        'websites',
        websitesAPI.getAll,
        {
            select: (response) => response.data,
        }
    );

    // Fetch analytics data when website is selected
    const { data: analyticsData, isLoading: analyticsLoading } = useQuery(
        ['analytics', selectedWebsite, period],
        () => analyticsAPI.getOverview(selectedWebsite, period),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
        }
    );

    const { data: pagesData } = useQuery(
        ['pages', selectedWebsite, period],
        () => analyticsAPI.getPages(selectedWebsite, period),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
        }
    );

    const { data: referrersData } = useQuery(
        ['referrers', selectedWebsite, period],
        () => analyticsAPI.getReferrers(selectedWebsite, period),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
        }
    );

    const { data: techData } = useQuery(
        ['technology', selectedWebsite, period],
        () => analyticsAPI.getTechnology(selectedWebsite, period),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
        }
    );

    const { data: geoData } = useQuery(
        ['geography', selectedWebsite, period],
        () => analyticsAPI.getGeography(selectedWebsite, period),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
        }
    );

    const { data: performanceData } = useQuery(
        ['performance', selectedWebsite, period],
        () => analyticsAPI.getPerformance(selectedWebsite, period),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
        }
    );

    const { data: insights } = useQuery(
        ['insights', selectedWebsite, period],
        () => analyticsAPI.getInsights(selectedWebsite, period),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
        }
    );

    const { data: languageData } = useQuery(
        ['language', selectedWebsite, period],
        () => analyticsAPI.getLanguage(selectedWebsite, period),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
        }
    );

    const { data: connectionData } = useQuery(
        ['connection', selectedWebsite, period],
        () => analyticsAPI.getConnection(selectedWebsite, period),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
        }
    );

    const { data: viewportData } = useQuery(
        ['viewport', selectedWebsite, period],
        () => analyticsAPI.getViewport(selectedWebsite, period),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
        }
    );

    const { data: sessionQualityData } = useQuery(
        ['session-quality', selectedWebsite, period],
        () => analyticsAPI.getSessionQuality(selectedWebsite, period),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
        }
    );

    const { data: timePatternsData } = useQuery(
        ['time-patterns', selectedWebsite, period],
        () => analyticsAPI.getTimePatterns(selectedWebsite, period),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
        }
    );

    const { data: engagementData } = useQuery(
        ['engagement', selectedWebsite, period],
        () => analyticsAPI.getEngagement(selectedWebsite, period),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
        }
    );

    const { data: realtimeData, refetch: refetchRealtime } = useQuery(
        ['realtime', selectedWebsite],
        () => analyticsAPI.getRealtime(selectedWebsite),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
            refetchInterval: 10000, // Refetch every 10 seconds
        }
    );

    const { data: retentionData } = useQuery(
        ['retention', selectedWebsite, period],
        () => analyticsAPI.getRetention(selectedWebsite, period),
        {
            enabled: !!selectedWebsite,
            select: (response) => response.data,
        }
    );

    // Set default selected website
    useEffect(() => {
        if (websites && websites.length > 0 && !selectedWebsite) {
            setSelectedWebsite(websites[0].id);
        }
    }, [websites, selectedWebsite]);

    // WebSocket for real-time updates
    useEffect(() => {
        if (!selectedWebsite) return;

        if (socketRef.current) {
            socketRef.current.close();
        }

        const API_BASE_URL = process.env.REACT_APP_API_URL || '';
        let wsUrl;
        if (API_BASE_URL) {
            const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss' : 'ws';
            const wsHost = API_BASE_URL.replace(/^https?:\/\//, '');
            wsUrl = `${wsProtocol}://${wsHost}/ws?websiteId=${selectedWebsite}`;
        } else {
            // Use current host if no API_BASE_URL is set
            const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
            wsUrl = `${wsProtocol}://${window.location.host}/ws?websiteId=${selectedWebsite}`;
        }

        socketRef.current = new WebSocket(wsUrl);

        socketRef.current.onopen = () => {
            console.log('WebSocket connected for website:', selectedWebsite);
        };

        socketRef.current.onmessage = (event) => {
            queryClient.invalidateQueries(['analytics', selectedWebsite, period]);
            queryClient.invalidateQueries(['pages', selectedWebsite, period]);
            queryClient.invalidateQueries(['referrers', selectedWebsite, period]);
            queryClient.invalidateQueries(['technology', selectedWebsite, period]);
            queryClient.invalidateQueries(['geography', selectedWebsite, period]);
        };

	socketRef.current.onclose = () => {
		console.log('WebSocket disconnected for website:', selectedWebsite);
	};

        socketRef.current.onerror = (error) => {
            console.error('WebSocket error for website:', selectedWebsite, error);
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [selectedWebsite, queryClient]);

    const formatNumber = (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num?.toString() || '0';
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '0s';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const COLORS = [
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6',
        '#06b6d4',
    ];

    if (websitesLoading) {
        return (
            <div className='flex items-center justify-center h-64'>
                <div className='loading-spinner w-8 h-8'></div>
            </div>
        );
    }


    const selectedSite = websites?.find((site) => site.id === selectedWebsite);

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
                <div>
				<h1 className='text-2xl font-bold text-gray-900'>
					Analytics Dashboard
				</h1>
				<p className='mt-1 text-sm text-gray-500'>
					Monitor your website performance and user behavior
				</p>
                </div>

                <div className='mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3'>
                    {/* Website selector */}
                    <select
                        value={selectedWebsite || ''}
                        onChange={(e) => setSelectedWebsite(e.target.value)}
                        className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                    >
                        {websites?.map((website) => (
                            <option key={website.id} value={website.id}>
                                {website.name}
                            </option>
                        ))}
                    </select>

                    {/* Period selector */}
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className='px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                    >
                        <option value='1d'>Last 24 hours</option>
                        <option value='7d'>Last 7 days</option>
                        <option value='30d'>Last 30 days</option>
                    </select>

				{selectedWebsite && (
					<button
						onClick={() => {
							setNewlyCreatedWebsite(selectedSite);
							setIsTrackingModalOpen(true);
						}}
						className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
					>
						View Tracking Code
					</button>
				)}

				<button
					onClick={() => setIsAddModalOpen(true)}
					className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
				>
					Add Website
				</button>
                </div>
            </div>

            {selectedWebsite ? (
                <>
                    {/* Overview Stats */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
					<div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-6 hover:scale-[1.02] transition-all duration-200'>
						<div className='flex items-center'>
							<div className='flex-shrink-0'>
								<div className='h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center'>
									<Eye className='h-6 w-6 text-white' />
								</div>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-blue-800'>
									Total Views
								</p>
								<p className='text-3xl font-bold text-blue-900'>
									{analyticsLoading ? (
										<span className='loading-spinner inline-block w-6 h-6'></span>
									) : (
										formatNumber(
											analyticsData?.overview
												?.total_views
										)
									)}
								</p>
								{!analyticsLoading && analyticsData?.overview?.total_views > 0 && (
									<div className='flex items-center mt-1'>
										<TrendingUp className='h-4 w-4 text-green-500 mr-1' />
										<span className='text-xs text-green-600 font-medium'>
											Active
										</span>
									</div>
								)}
							</div>
						</div>
					</div>

					<div className='bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-6 hover:scale-[1.02] transition-all duration-200'>
						<div className='flex items-center'>
							<div className='flex-shrink-0'>
								<div className='h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center'>
									<Users className='h-6 w-6 text-white' />
								</div>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-green-800'>
									Unique Visitors
								</p>
								<p className='text-3xl font-bold text-green-900'>
									{analyticsLoading ? (
										<span className='loading-spinner inline-block w-6 h-6'></span>
									) : (
										formatNumber(
											analyticsData?.overview
												?.unique_visitors
										)
									)}
								</p>
								{!analyticsLoading && analyticsData?.overview?.unique_visitors > 0 && (
									<div className='flex items-center mt-1'>
										<span className='relative flex h-3 w-3 mr-2'>
											<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75'></span>
											<span className='relative inline-flex rounded-full h-3 w-3 bg-green-500'></span>
										</span>
										<span className='text-xs text-green-600 font-medium'>
											Live tracking
										</span>
									</div>
								)}
							</div>
						</div>
					</div>

					<div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-6 hover:scale-[1.02] transition-all duration-200'>
						<div className='flex items-center'>
							<div className='flex-shrink-0'>
								<div className='h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center'>
									<Globe className='h-6 w-6 text-white' />
								</div>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-purple-800'>
									Unique Pages
								</p>
								<p className='text-3xl font-bold text-purple-900'>
									{analyticsLoading ? (
										<span className='loading-spinner inline-block w-6 h-6'></span>
									) : (
										formatNumber(
											analyticsData?.overview
												?.unique_pages
										)
									)}
								</p>
							</div>
						</div>
					</div>

					<div className='bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-6 hover:scale-[1.02] transition-all duration-200'>
						<div className='flex items-center'>
							<div className='flex-shrink-0'>
								<div className='h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center'>
									<Clock className='h-6 w-6 text-white' />
								</div>
							</div>
							<div className='ml-4'>
								<p className='text-sm font-medium text-orange-800'>
									Avg. Duration
								</p>
								<p className='text-3xl font-bold text-orange-900'>
									{analyticsLoading ? (
										<span className='loading-spinner inline-block w-6 h-6'></span>
									) : (
										formatDuration(
											analyticsData?.overview
												?.avg_duration
										)
									)}
								</p>
							</div>
						</div>
					</div>
                    </div>

                    {/* Traffic Chart */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                        <h3 className='text-lg font-medium text-gray-900 mb-4'>
                            Traffic Overview
                        </h3>
                        <div className='h-80'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <AreaChart data={analyticsData?.daily || []}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis
                                        dataKey='date'
                                        tickFormatter={(value) =>
                                            format(parseISO(value), 'MMM dd')
                                        }
                                    />
                                    <YAxis />
                                    <Tooltip
                                        labelFormatter={(value) =>
                                            format(
                                                parseISO(value),
                                                'MMM dd, yyyy'
                                            )
                                        }
                                        formatter={(value, name) => [
                                            value,
                                            name === 'views'
                                                ? 'Page Views'
                                                : 'Visitors',
                                        ]}
                                    />
                                    <Area
                                        type='monotone'
                                        dataKey='views'
                                        stackId='1'
                                        stroke='#2563eb'
                                        strokeWidth={3}
                                        fill='#3b82f6'
                                        fillOpacity={0.3}
                                    />
                                    <Area
                                        type='monotone'
                                        dataKey='visitors'
                                        stackId='1'
                                        stroke='#059669'
                                        strokeWidth={3}
                                        fill='#10b981'
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {/* Top Pages */}
                        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>
                                Top Pages
                            </h3>
                            <div className='space-y-3'>
                                {pagesData?.slice(0, 5).map((page, index) => (
                                    <div
                                        key={page.path}
                                        className='flex items-center justify-between'
                                    >
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm font-medium text-gray-900 truncate'>
                                                {page.path}
                                            </p>
                                            <p className='text-xs text-gray-500'>
                                                {page.unique_visitors} unique
                                                visitors
                                            </p>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <span className='text-sm font-medium text-gray-900'>
                                                {formatNumber(page.views)}
                                            </span>
                                            <ExternalLink className='h-4 w-4 text-gray-400' />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Referrers */}
                        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>
                                Top Referrers
                            </h3>
                            <div className='space-y-3'>
                                {referrersData
                                    ?.slice(0, 5)
                                    .map((referrer, index) => (
                                        <div
                                            key={referrer.referrer}
                                            className='flex items-center justify-between'
                                        >
                                            <div className='flex-1 min-w-0'>
                                                <p className='text-sm font-medium text-gray-900 truncate'>
                                                    {referrer.referrer ===
                                                    'Direct'
                                                        ? 'Direct Traffic'
                                                        : referrer.referrer}
                                                </p>
                                                <p className='text-xs text-gray-500'>
                                                    {referrer.unique_visitors}{' '}
                                                    unique visitors
                                                </p>
                                            </div>
                                            <span className='text-sm font-medium text-gray-900'>
                                                {formatNumber(referrer.views)}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        {/* Browsers */}
                        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>
                                Browsers
                            </h3>
                            <div className='h-64'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <PieChart>
                                        <Pie
                                            data={
                                                techData?.browsers?.slice(
                                                    0,
                                                    5
                                                ) || []
                                            }
                                            cx='50%'
                                            cy='50%'
                                            outerRadius={80}
                                            dataKey='views'
                                            nameKey='browser'
                                        >
                                            {techData?.browsers
                                                ?.slice(0, 5)
                                                .map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            COLORS[
                                                                index %
                                                                    COLORS.length
                                                            ]
                                                        }
                                                    />
                                                ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Operating Systems */}
                        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>
                                Operating Systems
                            </h3>
                            <div className='h-64'>
                                <ResponsiveContainer width='100%' height='100%'>
                                    <PieChart>
                                        <Pie
                                            data={
                                                techData?.os?.slice(0, 5) || []
                                            }
                                            cx='50%'
                                            cy='50%'
                                            outerRadius={80}
                                            dataKey='views'
                                            nameKey='os'
                                        >
                                            {techData?.os
                                                ?.slice(0, 5)
                                                .map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            COLORS[
                                                                index %
                                                                    COLORS.length
                                                            ]
                                                        }
                                                    />
                                                ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Devices */}
                        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>
                                Devices
                            </h3>
                            <div className='space-y-4'>
                                {techData?.devices?.map((device, index) => {
                                    const percentage = techData?.devices
                                        ? (device.views /
                                              techData.devices.reduce(
                                                  (sum, d) => sum + d.views,
                                                  0
                                              )) *
                                          100
                                        : 0;

                                    const getDeviceIcon = (type) => {
                                        switch (type) {
                                            case 'mobile':
                                                return (
                                                    <Smartphone className='h-5 w-5' />
                                                );
                                            case 'tablet':
                                                return (
                                                    <Tablet className='h-5 w-5' />
                                                );
                                            default:
                                                return (
                                                    <Monitor className='h-5 w-5' />
                                                );
                                        }
                                    };

                                    return (
                                        <div
                                            key={device.device_type}
                                            className='flex items-center'
                                        >
                                            <div className='flex items-center flex-1'>
                                                <div className='text-gray-600 mr-3'>
                                                    {getDeviceIcon(
                                                        device.device_type
                                                    )}
                                                </div>
                                                <div className='flex-1'>
                                                    <div className='flex items-center justify-between'>
                                                        <span className='text-sm font-medium text-gray-900 capitalize'>
                                                            {device.device_type}
                                                        </span>
                                                        <span className='text-sm text-gray-500'>
                                                            {percentage.toFixed(
                                                                1
                                                            )}
                                                            %
                                                        </span>
                                                    </div>
                                                    <div className='mt-1 w-full bg-gray-200 rounded-full h-2'>
                                                        <div
                                                            className='bg-primary-500 h-2 rounded-full'
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

				{/* Geography */}
				<div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
					<h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
						<MapPin className='h-5 w-5 mr-2 text-primary-600' />
						Geographic Distribution
					</h3>
					
					{/* World Map */}
					<div className='mb-6 bg-gray-50 rounded-lg p-4 overflow-hidden' style={{ height: '400px', position: 'relative' }}>
						<WorldMap geographyData={geoData} />
					</div>

					{/* Country List */}
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
						{geoData?.slice(0, 12).map((country) => (
							<div
								key={country.country}
								className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
							>
								<div className='flex items-center'>
									<MapPin className='h-4 w-4 text-gray-500 mr-2' />
									<span className='text-sm font-medium text-gray-900'>
										{country.country || 'Unknown'}
									</span>
								</div>
								<span className='text-sm font-semibold text-primary-600'>
									{formatNumber(country.views)}
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Insights */}
				<Insights insights={insights} />

				{/* Performance Metrics */}
				<PerformanceMetrics performanceData={performanceData} />

				{/* Real-time Activity */}
				<RealtimeActivity data={realtimeData} onRefresh={refetchRealtime} />

				{/* Language & Locale */}
				<LanguageAnalytics data={languageData} />

				{/* Connection Quality */}
				<ConnectionQuality data={connectionData} />

				{/* Advanced Analytics (Viewport, Session, Time, Engagement, Retention) */}
				<AdvancedAnalytics 
					viewportData={viewportData}
					sessionQualityData={sessionQualityData}
					timePatternsData={timePatternsData}
					engagementData={engagementData}
					retentionData={retentionData}
				/>

			</>
		) : (
                <div className='text-center py-12'>
                    <Globe className='mx-auto h-12 w-12 text-gray-400' />
                    <h3 className='mt-2 text-sm font-medium text-gray-900'>
                        No websites
                    </h3>
                    <p className='mt-1 text-sm text-gray-500'>
                        Get started by adding your first website.
                    </p>
                </div>
            )}
		{isAddModalOpen && (
			<div 
				className='fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center'
				onClick={(e) => {
					if (e.target === e.currentTarget) {
						setIsAddModalOpen(false);
					}
				}}
			>
				<div className='bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl'>
					<h2 className='text-xl font-bold mb-4 text-gray-900'>Add New Website</h2>
					<form onSubmit={(e) => { 
						e.preventDefault(); 
						handleAddWebsite(); 
					}}>
						<div className='mb-4'>
							<label htmlFor='name' className='block text-sm font-medium text-gray-700'>Name</label>
							<input
								id='name'
								type='text'
								value={newWebsiteName}
								onChange={(e) => setNewWebsiteName(e.target.value)}
								className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 sm:text-sm px-3 py-2'
								placeholder='My Website'
								required
							/>
						</div>
						<div className='mb-4'>
							<label htmlFor='domain' className='block text-sm font-medium text-gray-700'>Domain</label>
							<input
								id='domain'
								type='text'
								value={newWebsiteDomain}
								onChange={(e) => setNewWebsiteDomain(e.target.value)}
								className='mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 sm:text-sm px-3 py-2'
								placeholder='example.com'
								required
							/>
						</div>
						<div className='flex justify-end gap-3'>
							<button
								type='button'
								onClick={() => setIsAddModalOpen(false)}
								className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
							>
								Cancel
							</button>
							<button
								type='submit'
								disabled={createMutation.isLoading}
								className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{createMutation.isLoading ? 'Adding...' : 'Add Website'}
							</button>
						</div>
					</form>
				</div>
			</div>
		)}

		{isTrackingModalOpen && newlyCreatedWebsite && (
			<div 
				className='fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center'
				onClick={(e) => {
					if (e.target === e.currentTarget) {
						setIsTrackingModalOpen(false);
					}
				}}
			>
				<div className='bg-white rounded-lg p-6 w-full max-w-2xl mx-4 shadow-xl'>
					<h2 className='text-xl font-bold mb-4 text-gray-900'>Setup Tracking Code</h2>
					<div className='mb-4'>
						<p className='text-sm text-gray-600 mb-4'>
							Website <span className='font-semibold text-gray-900'>{newlyCreatedWebsite.name}</span> has been created successfully!
						</p>
						<p className='text-sm text-gray-600 mb-4'>
							To start tracking analytics, add the following JavaScript code to your website's HTML, just before the closing <code className='bg-gray-100 px-1 py-0.5 rounded text-xs'>&lt;/head&gt;</code> tag:
						</p>
						<div className='bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4'>
							<code className='text-sm text-green-400 whitespace-pre'>
{`<!-- Simply Analytics Tracking Code -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/tracking.js';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-website-id', '${newlyCreatedWebsite.id}');
    script.setAttribute('data-api-url', '${window.location.origin}');
    document.head.appendChild(script);
  })();
</script>`}
							</code>
						</div>
						<div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
							<h3 className='text-sm font-semibold text-blue-900 mb-2'>Important Notes:</h3>
							<ul className='text-xs text-blue-800 space-y-1 list-disc list-inside'>
								<li>The tracking script is lightweight and loads asynchronously</li>
								<li>It automatically tracks page views and user interactions</li>
								<li>Analytics data will appear in your dashboard within a few minutes</li>
								<li>You can view this code again from the Dashboard at any time</li>
							</ul>
						</div>
					</div>
					<div className='flex justify-end gap-3'>
						<button
							type='button'
							onClick={() => {
								navigator.clipboard.writeText(`<!-- Simply Analytics Tracking Code -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${window.location.origin}/tracking.js';
    script.async = true;
    script.defer = true;
    script.setAttribute('data-website-id', '${newlyCreatedWebsite.id}');
    script.setAttribute('data-api-url', '${window.location.origin}');
    document.head.appendChild(script);
  })();
</script>`);
								toast.success('Tracking code copied to clipboard!');
							}}
							className='px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'
						>
							Copy to Clipboard
						</button>
						<button
							type='button'
							onClick={() => setIsTrackingModalOpen(false)}
							className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700'
						>
							Done
						</button>
					</div>
				</div>
			</div>
		)}
    </div>
    );
};

export default Dashboard;