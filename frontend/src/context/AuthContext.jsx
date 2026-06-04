import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
    const navigate = useNavigate();

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/token/', { username, password });
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('token', access);
            localStorage.setItem('logged_username', username);

            setIsAuthenticated(true);
            navigate('/grupos');
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            if (refresh) {
                const token = localStorage.getItem('access_token');
                await api.post('auth/logout/', { refresh }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('token');
            localStorage.removeItem('logged_username');
            localStorage.removeItem('email');
            setIsAuthenticated(false);
            navigate('/');
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};