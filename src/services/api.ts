import { config } from '../config/env';

const TOKEN_KEY = '@swamys_token';
const USER_KEY = '@swamys_user';

export class ApiError extends Error {
  public status?: number;
  public data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(TOKEN_KEY);
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      // Do not trigger session expiry reload for authentication requests (login/register)
      if (response.url.includes('/auth/login') || response.url.includes('/auth/register')) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || 'Invalid credentials',
          401,
          errorData,
        );
      }

      console.log('🔐 401 Unauthorized - Logging out user');

      // Clear tokens
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      // Alert user
      alert('Your session has expired. Please log in again.');
      
      // Force reload to update app state and redirect to login
      window.location.reload();

      throw new ApiError('Session expired. Please login again.', 401);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `API Error: ${response.statusText}`,
        response.status,
        errorData,
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    console.log(`📡 GET ${this.baseUrl}${endpoint}`);
    const headers = this.getAuthHeaders();

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, { headers });
      console.log(`✅ GET ${endpoint} - Status: ${response.status}`);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`❌ GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    console.log(`📡 POST ${this.baseUrl}${endpoint}`);
    const headers = this.getAuthHeaders();

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      console.log(`✅ POST ${endpoint} - Status: ${response.status}`);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`❌ POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    console.log(`📡 PUT ${this.baseUrl}${endpoint}`);
    const headers = this.getAuthHeaders();

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      console.log(`✅ PUT ${endpoint} - Status: ${response.status}`);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`❌ PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  async delete<T = void>(endpoint: string): Promise<T> {
    console.log(`📡 DELETE ${this.baseUrl}${endpoint}`);
    const headers = this.getAuthHeaders();

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers,
      });
      console.log(`✅ DELETE ${endpoint} - Status: ${response.status}`);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`❌ DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  async upload(endpoint: string, formData: FormData): Promise<any> {
    console.log(`📡 UPLOAD ${this.baseUrl}${endpoint}`);
    const token = localStorage.getItem(TOKEN_KEY);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        body: formData,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      console.log(`✅ UPLOAD ${endpoint} - Status: ${response.status}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error(`❌ UPLOAD ${endpoint} failed:`, error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
