import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, BarChart3, LogOut, Globe } from 'lucide-react';

const Layout = () => {
    console.log('[Layout] Component rendering');
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <div className='min-h-screen bg-gray-50'>
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
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
            >
                <div className='flex items-center justify-between h-16 px-6 border-b border-gray-200'>
                    <div className='flex items-center'>
                        <div className='h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center mr-3'>
                            <BarChart3 className='h-5 w-5 text-white' />
                        </div>
                        <h1 className='text-xl font-bold text-gray-900'>
                            Simply Analytics
                        </h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className='lg:hidden text-gray-400 hover:text-gray-600'
                    >
                        <X className='h-6 w-6' />
                    </button>
                </div>

                <nav className='mt-6 px-3'>
                    <div className='space-y-2'>
                        <a
                            href='/'
                            className='flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors'
                        >
                            <BarChart3 className='h-5 w-5 mr-3' />
                            Dashboard
                        </a>
                        <a
                            href='/websites'
                            className='flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors'
                        >
                            <Globe className='h-5 w-5 mr-3' />
                            Websites
                        </a>
                    </div>

                    <div className='mt-8 pt-6 border-t border-gray-200'>
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
                <div className='absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50'>
                    <div className='flex items-center'>
                        <div className='h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center'>
                            <span className='text-sm font-medium text-white'>
                                {user?.username?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className='ml-3'>
                            <p className='text-sm font-medium text-gray-700'>
                                {user?.username}
                            </p>
                            <p className='text-xs text-gray-500'>
                                Administrator
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className='lg:pl-64'>
                {/* Top header */}
                <header className='bg-white shadow-sm border-b border-gray-200'>
                    <div className='flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16'>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className='lg:hidden text-gray-400 hover:text-gray-600'
                        >
                            <Menu className='h-6 w-6' />
                        </button>

                        <div className='flex items-center space-x-4'>
                            {/* Add Website button moved to Dashboard component */}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className='p-4 sm:p-6 lg:p-8'><Outlet /></main>
            </div>
        </div>
    );
};

export default Layout;
