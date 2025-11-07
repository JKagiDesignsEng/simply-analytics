import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Menu, X, BarChart3, LogOut, Globe, Moon, Sun, Settings, Palette } from 'lucide-react';

const Layout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
    const { user, logout } = useAuth();
    const { isDarkMode, toggleDarkMode, currentTheme, themes, setTheme } = useTheme();
    const location = useLocation();

    const handleLogout = () => {
        logout();
    };

    const themeColors = isDarkMode ? themes.dark.colors : themes[currentTheme].colors;

    return (
        <div className={`min-h-screen ${themeColors.background} transition-colors duration-200`}>
            {/* Top header - Fixed at top */}
            <header className={`fixed top-0 left-0 right-0 z-30 ${themeColors.card} shadow-sm border-b ${themeColors.border}`}>
                <div className='flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16'>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className='lg:hidden text-gray-400 hover:text-gray-600'
                    >
                        <Menu className='h-6 w-6' />
                    </button>

                    {/* Logo and title for mobile */}
                    <div className='flex items-center lg:hidden'>
                        <div className={`h-8 w-8 ${themeColors.primary} rounded-lg flex items-center justify-center mr-2`}>
                            <BarChart3 className='h-5 w-5 text-white' />
                        </div>
                        <h1 className={`text-lg font-bold ${themeColors.text}`}>
                            Simply Analytics
                        </h1>
                    </div>

                    <div className='flex items-center space-x-2 ml-auto'>
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDarkMode ? (
                                <Sun className='h-5 w-5' />
                            ) : (
                                <Moon className='h-5 w-5' />
                            )}
                        </button>

                        {/* Settings Button */}
                        <div className='relative'>
                            <button
                                onClick={() => setSettingsOpen(!settingsOpen)}
                                className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
                                title='Theme Settings'
                            >
                                <Settings className='h-5 w-5' />
                            </button>

                            {/* Settings Dropdown */}
                            {settingsOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className='fixed inset-0 z-40'
                                        onClick={() => setSettingsOpen(false)}
                                    />
                                    
                                    {/* Dropdown Menu */}
                                    <div className='absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 p-4'>
                                        <div className='flex items-center justify-between mb-4'>
                                            <h3 className='text-sm font-semibold text-gray-900 flex items-center'>
                                                <Palette className='h-4 w-4 mr-2' />
                                                Theme Settings
                                            </h3>
                                            <button
                                                onClick={() => setSettingsOpen(false)}
                                                className='text-gray-400 hover:text-gray-600'
                                            >
                                                <X className='h-4 w-4' />
                                            </button>
                                        </div>

                                        {/* Dark Mode Toggle in Settings */}
                                        <div className='mb-4 pb-4 border-b border-gray-200'>
                                            <label className='flex items-center justify-between cursor-pointer'>
                                                <span className='text-sm font-medium text-gray-700'>
                                                    Dark Mode
                                                </span>
                                                <button
                                                    onClick={toggleDarkMode}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                        isDarkMode ? 'bg-primary-600' : 'bg-gray-200'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                            isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </label>
                                        </div>

                                        {/* Theme Selector */}
                                        <div>
                                            <h4 className='text-xs font-semibold text-gray-700 uppercase mb-3'>
                                                Color Themes
                                            </h4>
                                            <div className='grid grid-cols-2 gap-2'>
                                                {Object.values(themes).map((theme) => (
                                                    <button
                                                        key={theme.id}
                                                        onClick={() => {
                                                            setTheme(theme.id);
                                                            if (theme.id === 'dark') {
                                                                // Automatically enable dark mode for dark theme
                                                                if (!isDarkMode) toggleDarkMode();
                                                            }
                                                        }}
                                                        className={`p-3 rounded-lg border-2 transition-all ${
                                                            currentTheme === theme.id
                                                                ? 'border-primary-500 bg-primary-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div className='flex items-center justify-between mb-1'>
                                                            <span className='text-xs font-medium text-gray-900'>
                                                                {theme.name}
                                                            </span>
                                                            {currentTheme === theme.id && (
                                                                <div className='h-2 w-2 rounded-full bg-primary-500' />
                                                            )}
                                                        </div>
                                                        <div className='flex space-x-1'>
                                                            {theme.id === 'dark' ? (
                                                                <>
                                                                    <div className='h-3 flex-1 bg-gray-800 rounded' />
                                                                    <div className='h-3 flex-1 bg-gray-700 rounded' />
                                                                    <div className='h-3 flex-1 bg-gray-600 rounded' />
                                                                </>
                                                            ) : theme.id === 'blue' ? (
                                                                <>
                                                                    <div className='h-3 flex-1 bg-blue-200 rounded' />
                                                                    <div className='h-3 flex-1 bg-blue-400 rounded' />
                                                                    <div className='h-3 flex-1 bg-blue-600 rounded' />
                                                                </>
                                                            ) : theme.id === 'purple' ? (
                                                                <>
                                                                    <div className='h-3 flex-1 bg-purple-200 rounded' />
                                                                    <div className='h-3 flex-1 bg-purple-400 rounded' />
                                                                    <div className='h-3 flex-1 bg-purple-600 rounded' />
                                                                </>
                                                            ) : theme.id === 'green' ? (
                                                                <>
                                                                    <div className='h-3 flex-1 bg-green-200 rounded' />
                                                                    <div className='h-3 flex-1 bg-green-400 rounded' />
                                                                    <div className='h-3 flex-1 bg-green-600 rounded' />
                                                                </>
                                                            ) : theme.id === 'slate' ? (
                                                                <>
                                                                    <div className='h-3 flex-1 bg-slate-300 rounded' />
                                                                    <div className='h-3 flex-1 bg-slate-500 rounded' />
                                                                    <div className='h-3 flex-1 bg-slate-700 rounded' />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className='h-3 flex-1 bg-gray-200 rounded' />
                                                                    <div className='h-3 flex-1 bg-gray-400 rounded' />
                                                                    <div className='h-3 flex-1 bg-primary-600 rounded' />
                                                                </>
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className='fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden'
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
        fixed top-16 bottom-0 left-0 z-50 w-64 ${themeColors.card} shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
            >
                {/* Logo and title for desktop */}
                <div className={`hidden lg:flex items-center h-16 px-6 border-b ${themeColors.border}`}>
                    <div className={`h-8 w-8 ${themeColors.primary} rounded-lg flex items-center justify-center mr-3`}>
                        <BarChart3 className='h-5 w-5 text-white' />
                    </div>
                    <h1 className={`text-xl font-bold ${themeColors.text}`}>
                        Simply Analytics
                    </h1>
                </div>

                <nav className='mt-6 px-3'>
                    <div className='space-y-2'>
                        <Link
                            to='/'
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                location.pathname === '/'
                                    ? 'bg-primary-50 text-primary-700'
                                    : `${themeColors.text} ${themeColors.hover}`
                            }`}
                        >
                            <BarChart3 className='h-5 w-5 mr-3' />
                            Dashboard
                        </Link>
                        <Link
                            to='/websites'
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                location.pathname === '/websites'
                                    ? 'bg-primary-50 text-primary-700'
                                    : `${themeColors.text} ${themeColors.hover}`
                            }`}
                        >
                            <Globe className='h-5 w-5 mr-3' />
                            Websites
                        </Link>
                    </div>

                    <div className={`mt-8 pt-6 border-t ${themeColors.border}`}>
                        <button
                            onClick={handleLogout}
                            className='flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors'
                        >
                            <LogOut className='h-5 w-5 mr-3' />
                            Sign Out
                        </button>
                    </div>
                </nav>

                {/* User info at bottom */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${themeColors.border} ${themeColors.background}`}>
                    <div className='flex items-center'>
                        <div className={`h-8 w-8 ${themeColors.primary} rounded-full flex items-center justify-center`}>
                            <span className='text-sm font-medium text-white'>
                                {user?.username?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className='ml-3'>
                            <p className={`text-sm font-medium ${themeColors.text}`}>
                                {user?.username}
                            </p>
                            <p className={`text-xs ${themeColors.textSecondary}`}>
                                Administrator
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className='pt-16 lg:pl-64'>
                {/* Page content */}
                <main className='p-4 sm:p-6 lg:p-8'><Outlet /></main>
            </div>
        </div>
    );
};

export default Layout;
