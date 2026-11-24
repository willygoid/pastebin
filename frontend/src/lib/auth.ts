import api from './api';

export interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: 'admin' | 'user';
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

export interface RegisterResponse {
    message: string;
    user: User;
}

export interface AdminPaste {
    id: string; // short_id
    title: string;
    language: string;
    expires_at: string | null;
    views: number;
    is_private: boolean;
    created_at: string;
    owner?: {
        id: number;
        username: string;
        email: string;
    } | null;
}

export interface AppSettings {
    google_client_id: string;
    google_client_secret_set: boolean;
    github_client_id: string;
    github_client_secret_set: boolean;
    updated_at: string;
}

// Auth functions
export const authService = {
    // Register new user
    register: async (data: {
        username: string;
        email: string;
        password: string;
        full_name?: string;
        role?: 'admin' | 'user';
    }): Promise<RegisterResponse> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    // Login user
    login: async (emailOrUsername: string, password: string): Promise<LoginResponse> => {
        const response = await api.post('/auth/login', {
            email_or_username: emailOrUsername,
            password,
        });

        // Save token and user to localStorage
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    // Logout user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    // Get current user from localStorage
    getCurrentUser: (): User | null => {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('token');
    },

    // Check if user is admin
    isAdmin: (): boolean => {
        const user = authService.getCurrentUser();
        return user?.role === 'admin';
    },

    // Get user profile
    getProfile: async (): Promise<User> => {
        const response = await api.get('/profile');
        return response.data.user;
    },

    // Update profile
    updateProfile: async (data: { full_name: string; email: string }): Promise<User> => {
        const response = await api.put('/profile', data);

        // Update user in localStorage
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data.user;
    },

    // Change password
    changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
        await api.post('/change-password', {
            old_password: oldPassword,
            new_password: newPassword,
        });
    },
};

// Admin functions
export const adminService = {
    // Get all users
    getAllUsers: async (page: number = 1, limit: number = 10) => {
        const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Get user by ID
    getUserById: async (id: number): Promise<User> => {
        const response = await api.get(`/admin/users/${id}`);
        return response.data.user;
    },

    // Update user role
    updateUserRole: async (id: number, role: 'admin' | 'user'): Promise<void> => {
        await api.put(`/admin/users/${id}/role`, { role });
    },

    // Toggle user status
    toggleUserStatus: async (id: number): Promise<void> => {
        await api.put(`/admin/users/${id}/toggle-status`);
    },

    // Delete user
    deleteUser: async (id: number): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    },

    // Reset user password
    resetPassword: async (id: number, newPassword: string): Promise<void> => {
        await api.post(`/admin/users/${id}/reset-password`, { new_password: newPassword });
    },

    // Get all pastes (paginated, searchable)
    getAllPastes: async (page: number = 1, limit: number = 10, search: string = '') => {
        const response = await api.get(
            `/admin/pastes?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
        );
        return response.data.data as { pastes: AdminPaste[]; pagination: any };
    },

    // Delete a paste
    deletePaste: async (shortId: string): Promise<void> => {
        await api.delete(`/admin/pastes/${shortId}`);
    },

    // Get OAuth app settings
    getSettings: async (): Promise<AppSettings> => {
        const response = await api.get('/admin/settings');
        return response.data.settings;
    },

    // Update OAuth app settings (omit secret fields to leave them unchanged)
    updateSettings: async (data: {
        google_client_id?: string;
        google_client_secret?: string;
        github_client_id?: string;
        github_client_secret?: string;
    }): Promise<AppSettings> => {
        const response = await api.put('/admin/settings', data);
        return response.data.settings;
    },
};

// Current user's own paste collection
export const myPasteService = {
    // Get my pastes (paginated, searchable)
    getMyPastes: async (page: number = 1, limit: number = 10, search: string = '') => {
        const response = await api.get(
            `/my-pastes?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
        );
        return response.data.data as { pastes: AdminPaste[]; pagination: any };
    },

    // Delete one of my pastes
    deleteMyPaste: async (shortId: string): Promise<void> => {
        await api.delete(`/my-pastes/${shortId}`);
    },
};
