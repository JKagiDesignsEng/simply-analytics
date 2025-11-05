import React from 'react';
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
        },
    },
});

function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    
    console.log('[ProtectedRoute] isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='loading-spinner w-8 h-8'></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to='/login' replace />;
}

function LoginWrapper() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <Navigate to='/' replace /> : <Login />;
}

function App() {
    const router = createBrowserRouter(
        [
            {
                path: '/login',
                element: <LoginWrapper />,
            },
            {
                path: '*',
                element: (
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        index: true,
                        element: <Dashboard />,
                    },
                    {
                        path: 'website/:websiteId',
                        element: <Dashboard />,
                    },
                ],
            },
        ],
        {
            future: {
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            },
        }
    );

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <div className='App'>
                    <RouterProvider router={router} />
                    <Toaster
                        position='top-right'
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                            success: {
                                style: {
                                    background: '#22c55e',
                                },
                            },
                            error: {
                                style: {
                                    background: '#ef4444',
                                },
                            },
                        }}
                    />
                </div>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
