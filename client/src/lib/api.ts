const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export const api = {
  async get<T = any>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Something went wrong' };
      }

      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Network error. Please try again.' };
    }
  },

  async post<T = any, D = any>(
    endpoint: string,
    body: D,
    token?: string
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Something went wrong' };
      }

      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Network error. Please try again.' };
    }
  },

  async put<T = any, D = any>(
    endpoint: string,
    body: D,
    token: string
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Something went wrong' };
      }

      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Network error. Please try again.' };
    }
  },

  async delete<T = any>(
    endpoint: string,
    token: string
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.message || 'Something went wrong' };
      }

      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return { error: 'Network error. Please try again.' };
    }
  },
};
