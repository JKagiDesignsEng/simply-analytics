import React, { useState } from 'react';
import {
  Monitor,
  Activity,
  TrendingUp,
  Clock,
  Users,
  Target,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';

const AdvancedAnalytics = ({
  viewportData,
  sessionQualityData,
  timePatternsData,
  engagementData,
  retentionData,
}) => {
  const [activeTab, setActiveTab] = useState('viewport');

  const tabs = [
    { id: 'viewport', label: 'Viewport & Screens', icon: Monitor },
    { id: 'session', label: 'Session Quality', icon: Activity },
    { id: 'time', label: 'Time Patterns', icon: Clock },
    { id: 'engagement', label: 'Engagement', icon: Target },
    { id: 'retention', label: 'User Retention', icon: Users },
  ];

  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
        Advanced Analytics
      </h3>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Viewport & Screens */}
        {activeTab === 'viewport' && (
          <div>
            {viewportData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <p className="text-sm text-purple-800 font-medium">
                      High DPI Displays
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      {viewportData.highDpiPercentage
                        ? `${viewportData.highDpiPercentage.toFixed(1)}%`
                        : '0%'}
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      Retina & high-res screens
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium">
                      Top Viewport
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {viewportData.viewports?.[0]
                        ? `${viewportData.viewports[0].viewport_width}×${viewportData.viewports[0].viewport_height}`
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Most common viewport size
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <p className="text-sm text-green-800 font-medium">
                      Top Screen
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {viewportData.screens?.[0]
                        ? `${viewportData.screens[0].screen_width}×${viewportData.screens[0].screen_height}`
                        : 'N/A'}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Most common screen resolution
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Top Viewport Sizes
                    </h4>
                    <div className="space-y-2">
                      {viewportData.viewports?.slice(0, 8).map((vp, index) => {
                        const total = viewportData.viewports.reduce(
                          (sum, v) => sum + Number.parseInt(v.views),
                          0
                        );
                        const percentage = ((vp.views / total) * 100).toFixed(
                          1
                        );
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm font-medium text-gray-900">
                              {vp.viewport_width} × {vp.viewport_height}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {percentage}%
                              </span>
                              <span className="text-sm font-semibold text-primary-600">
                                {vp.views}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Top Screen Resolutions
                    </h4>
                    <div className="space-y-2">
                      {viewportData.screens
                        ?.slice(0, 8)
                        .map((screen, index) => {
                          const total = viewportData.screens.reduce(
                            (sum, s) => sum + Number.parseInt(s.views),
                            0
                          );
                          const percentage = (
                            (screen.views / total) *
                            100
                          ).toFixed(1);
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded"
                            >
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {screen.screen_width} × {screen.screen_height}
                                </span>
                                {screen.avg_pixel_ratio && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    @
                                    {Number.parseFloat(
                                      screen.avg_pixel_ratio
                                    ).toFixed(1)}
                                    x
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {percentage}%
                                </span>
                                <span className="text-sm font-semibold text-primary-600">
                                  {screen.views}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No viewport data yet
              </div>
            )}
          </div>
        )}

        {/* Session Quality */}
        {activeTab === 'session' && (
          <div>
            {sessionQualityData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium">
                      Avg Pages per Session
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {sessionQualityData.avgPagesPerSession
                        ? Number.parseFloat(
                            sessionQualityData.avgPagesPerSession
                          ).toFixed(1)
                        : '0'}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <p className="text-sm text-green-800 font-medium">
                      Median Pages per Session
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {sessionQualityData.medianPagesPerSession
                        ? Number.parseFloat(
                            sessionQualityData.medianPagesPerSession
                          ).toFixed(1)
                        : '0'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Bounce Rates by Page
                    </h4>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {sessionQualityData.bounceRates?.map((page) => (
                        <div key={page.path} className="p-3 bg-gray-50 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate flex-1">
                              {page.path}
                            </span>
                            <span
                              className={`text-sm font-bold ${
                                page.bounce_rate > 70
                                  ? 'text-red-600'
                                  : page.bounce_rate > 50
                                  ? 'text-orange-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {page.bounce_rate}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{page.total_sessions} sessions</span>
                            <span>•</span>
                            <span>{page.bounced_sessions} bounced</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Top Exit Pages
                    </h4>
                    <div className="space-y-2">
                      {sessionQualityData.exitPages?.map((page, index) => (
                        <div
                          key={page.path}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-lg font-bold text-gray-400">
                              #{index + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {page.path}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-red-600">
                            {page.exit_count} exits
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No session quality data yet
              </div>
            )}
          </div>
        )}

        {/* Time Patterns */}
        {activeTab === 'time' && (
          <div>
            {timePatternsData ? (
              <>
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Peak Traffic Hours
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {timePatternsData.peakHours?.map((hour) => (
                      <div
                        key={hour.hour}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center"
                      >
                        <p className="text-2xl font-bold text-blue-900">
                          {String(hour.hour).padStart(2, '0')}:00
                        </p>
                        <p className="text-xs text-blue-700">
                          {hour.views} views
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Traffic by Day of Week
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={timePatternsData.dayOfWeek?.map((day) => ({
                          ...day,
                          day_name: dayNames[day.day_of_week],
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day_name" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="views"
                          fill="#3b82f6"
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar
                          dataKey="unique_visitors"
                          fill="#10b981"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Hourly Heatmap
                  </h4>
                  <div className="overflow-x-auto">
                    <div className="inline-grid grid-cols-25 gap-1 min-w-full">
                      <div className="col-span-1"></div>
                      {Array.from({ length: 24 }, (_, i) => (
                        <div
                          key={i}
                          className="text-xs text-gray-500 text-center py-1"
                        >
                          {String(i).padStart(2, '0')}
                        </div>
                      ))}
                      {Array.from({ length: 7 }, (_, day) => (
                        <React.Fragment key={`day-${day}`}>
                          <div className="text-xs text-gray-500 py-2 pr-2 text-right">
                            {dayNames[day].slice(0, 3)}
                          </div>
                          {Array.from({ length: 24 }, (_, hour) => {
                            const dataPoint =
                              timePatternsData.hourlyPattern?.find(
                                (p) =>
                                  Number.parseInt(p.day_of_week) === day &&
                                  Number.parseInt(p.hour) === hour
                              );
                            const maxViews = Math.max(
                              ...(timePatternsData.hourlyPattern?.map((p) =>
                                Number.parseInt(p.views)
                              ) || [1])
                            );
                            const intensity = dataPoint
                              ? dataPoint.views / maxViews
                              : 0;
                            const opacity = 0.1 + intensity * 0.9;

                            return (
                              <div
                                key={`${day}-${hour}`}
                                className="aspect-square rounded"
                                style={{
                                  backgroundColor: `rgba(59, 130, 246, ${opacity})`,
                                }}
                                title={`${dayNames[day]} ${hour}:00 - ${
                                  dataPoint?.views || 0
                                } views`}
                              />
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No time pattern data yet
              </div>
            )}
          </div>
        )}

        {/* Engagement */}
        {activeTab === 'engagement' && (
          <div>
            {engagementData ? (
              <>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Page Engagement Scores
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Engagement score is calculated from views (30%), time on page
                  (40%), and bounce rate (30%)
                </p>
                <div className="space-y-2">
                  {engagementData.pageEngagement?.map((page, index) => (
                    <div
                      key={page.path}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl font-bold text-gray-400">
                            #{index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {page.path}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary-600">
                              {page.engagement_score}
                            </div>
                            <div className="text-xs text-gray-500">score</div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">Views:</span>
                          <span className="ml-1 font-semibold text-gray-900">
                            {page.total_views}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg Duration:</span>
                          <span className="ml-1 font-semibold text-gray-900">
                            {page.avg_duration}s
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Bounce:</span>
                          <span className="ml-1 font-semibold text-gray-900">
                            {page.bounce_rate}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Visitors:</span>
                          <span className="ml-1 font-semibold text-gray-900">
                            {page.unique_visitors}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No engagement data yet
              </div>
            )}
          </div>
        )}

        {/* Retention */}
        {activeTab === 'retention' && (
          <div>
            {retentionData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                    <p className="text-sm text-green-800 font-medium mb-2">
                      New Visitors
                    </p>
                    <p className="text-4xl font-bold text-green-900">
                      {retentionData.newVisitors || 0}
                    </p>
                    <p className="text-xs text-green-700 mt-2">
                      First-time visitors in this period
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      Returning Visitors
                    </p>
                    <p className="text-4xl font-bold text-blue-900">
                      {retentionData.returningVisitors || 0}
                    </p>
                    <p className="text-xs text-blue-700 mt-2">
                      Visitors who came back
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Visitor Frequency
                  </h4>
                  <div className="space-y-3">
                    {retentionData.frequency?.map((freq) => {
                      const total = retentionData.frequency.reduce(
                        (sum, f) => sum + Number.parseInt(f.visitor_count),
                        0
                      );
                      const percentage = (
                        (freq.visitor_count / total) *
                        100
                      ).toFixed(1);
                      const labels = {
                        'one-time': {
                          label: 'One-time Visitors',
                          color: 'gray',
                        },
                        occasional: {
                          label: 'Occasional Visitors',
                          color: 'blue',
                        },
                        regular: { label: 'Regular Visitors', color: 'green' },
                        frequent: {
                          label: 'Frequent Visitors',
                          color: 'purple',
                        },
                      };
                      const config = labels[freq.frequency_type] || {
                        label: freq.frequency_type,
                        color: 'gray',
                      };

                      return (
                        <div
                          key={freq.frequency_type}
                          className="p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {config.label}
                            </span>
                            <span className="text-lg font-bold text-primary-600">
                              {freq.visitor_count}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`bg-${config.color}-500 h-3 rounded-full flex items-center justify-end px-2`}
                              style={{ width: `${percentage}%` }}
                            >
                              <span className="text-xs font-semibold text-white">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400">
                No retention data yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
