import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
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

    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='loading-spinner w-8 h-8'></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to='/login' replace />;
}

function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path='/login'
                element={
                    isAuthenticated ? <Navigate to='/' replace /> : <Login />
                }
            />
            <Route
                path='/*'
                element={
                    <ProtectedRoute>
                        <Layout>
                            <Routes>
                                <Route path='/' element={<Dashboard />} />
                                <Route
                                    path='/website/:websiteId'
                                    element={<Dashboard />}
                                />
                            </Routes>
                        </Layout>
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <div className='App'>
                        <AppRoutes />
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
                </Router>
            </AuthProvider>
        </QueryClientProvider>
    );
}

export default App;
