import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { GET_USER } from './utils/constants';
import { selectUserData, updateUserData } from './store/slices';
import { apiClient } from './lib/api-client';
import Register from './pages/register';
import Login from './pages/auth';
import Profile from './pages/profile';
import Chat from './pages/chat';
import './App.css';

// eslint-disable-next-line react/prop-types
const PrivateRoute = ({ children }) => {
    const user = useSelector(selectUserData);
    const isAuthenticated = !!Object.keys(user).length;
    return isAuthenticated ? children : <Navigate to="/login" />;
};

// eslint-disable-next-line react/prop-types
const AuthRoute = ({ children }) => {
    const user = useSelector(selectUserData);
    const isAuthenticated = !!Object.keys(user).length;
    return isAuthenticated ? <Navigate to="/chat" /> : children;
};

function App() {
    const dispatch = useDispatch();
    const user = useSelector(selectUserData);
    const [loading, setLoading] = useState(true);

    const getUserData = async () => {
        await apiClient
            .get(GET_USER, { withCredentials: true })
            .then(function (response) {
                dispatch(updateUserData(response.data.user));
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        if (loading && !Object.keys(user).length) {
            getUserData();
        }
    }, [dispatch, user]);

    if (loading) {
        return <div>Loading data ...</div>;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route
                    path="/login"
                    element={
                        <AuthRoute>
                            {' '}
                            <Login />{' '}
                        </AuthRoute>
                    }
                />
                <Route
                    path="/chat"
                    element={
                        <PrivateRoute>
                            {' '}
                            <Chat />{' '}
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            {' '}
                            <Profile />{' '}
                        </PrivateRoute>
                    }
                />
                <Route path="/*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
