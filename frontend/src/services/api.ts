const API_BASE_URL = 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Recipients API
export interface Recipient {
  id: string;
  roomNumber: string;
  name: string;
  phone: string;
}

export interface RecipientsByFloor {
  [floor: string]: Recipient[];
}

export interface RecipientsResponse {
  success: boolean;
  recipients: Recipient[];
  recipientsByFloor: RecipientsByFloor;
  totalCount: number;
}

// Delivery Companies API
export interface DeliveryCompany {
  id: string;
  name: string;
  color: string;
}

export interface DeliveryCompaniesResponse {
  success: boolean;
  deliveryCompanies: DeliveryCompany[];
  totalCount: number;
}

// Parcels API
export interface Parcel {
  id: number;
  trackingNumber: string;
  roomNumber: string;
  recipientName: string;
  phoneNumber: string;
  senderPhone?: string;
  senderName?: string;
  deliveryCompany: string;
  status: 'pending' | 'notified' | 'collected' | 'returned';
  createdAt: string;
  updatedAt: string;
  notifications: Array<{
    type: string;
    sentAt: string;
    success: boolean;
    message: string;
    error?: string;
  }>;
}

export interface CreateParcelRequest {
  roomNumber: string;
  recipientName: string;
  phoneNumber: string;
  deliveryCompany: string;
  senderPhone?: string;
  senderName?: string;
}

export interface CreateParcelResponse {
  success: boolean;
  message: string;
  parcel: Parcel;
}

// Admin API
export interface AdminUser {
  username: string;
  sessionToken: string;
  loginTime: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  admin?: AdminUser;
}

export interface AdminStats {
  total: number;
  pending: number;
  notified: number;
  collected: number;
  returned: number;
  percentages: {
    pending: number;
    notified: number;
    collected: number;
    returned: number;
  };
}

export interface AdminStatsResponse {
  success: boolean;
  stats: AdminStats;
  timestamp: string;
}

class ApiService {
  private adminToken: string | null = null;

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      // Create headers object
      const requestHeaders = new Headers({
        'Content-Type': 'application/json',
      });

      // Add existing headers if provided
      if (options?.headers) {
        const existingHeaders = new Headers(options.headers);
        existingHeaders.forEach((value, key) => {
          requestHeaders.set(key, value);
        });
      }

      // Add admin token if available
      if (this.adminToken) {
        requestHeaders.set('x-admin-token', this.adminToken);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: requestHeaders,
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Clear invalid token
        this.clearAdminToken();
        throw new Error('HTTP 401: Unauthorized - Please login again');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Recipients API methods
  async getRecipients(floor?: string): Promise<RecipientsResponse> {
    const queryParam = floor ? `?floor=${floor}` : '';
    return this.fetch<RecipientsResponse>(`/recipients${queryParam}`);
  }

  async getRecipientByRoom(roomNumber: string): Promise<{success: boolean; recipient: Recipient}> {
    return this.fetch<{success: boolean; recipient: Recipient}>(`/recipients/room/${roomNumber}`);
  }

  // Delivery Companies API methods
  async getDeliveryCompanies(): Promise<DeliveryCompaniesResponse> {
    return this.fetch<DeliveryCompaniesResponse>('/delivery-companies');
  }

  // Parcels API methods
  async createParcel(parcelData: CreateParcelRequest): Promise<CreateParcelResponse> {
    return this.fetch<CreateParcelResponse>('/parcels', {
      method: 'POST',
      body: JSON.stringify(parcelData),
    });
  }

  async getParcels(params?: {
    status?: string;
    roomNumber?: string;
    deliveryCompany?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{success: boolean; parcels: Parcel[]; totalCount: number; stats: any}> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.roomNumber) queryParams.append('roomNumber', params.roomNumber);
    if (params?.deliveryCompany) queryParams.append('deliveryCompany', params.deliveryCompany);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    return this.fetch<{success: boolean; parcels: Parcel[]; totalCount: number; stats: any}>(
      `/parcels${queryString ? `?${queryString}` : ''}`
    );
  }

  async getParcelByTracking(trackingNumber: string): Promise<{success: boolean; parcel: Parcel}> {
    return this.fetch<{success: boolean; parcel: Parcel}>(`/parcels/track/${trackingNumber}`);
  }

  // Admin API methods
  async adminLogin(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    const response = await this.fetch<AdminLoginResponse>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store admin token for future requests
    if (response.success && response.admin?.sessionToken) {
      this.setAdminToken(response.admin.sessionToken);
    }

    return response;
  }

  async adminLogout(): Promise<{success: boolean; message: string}> {
    try {
      const response = await this.fetch<{success: boolean; message: string}>('/admin/logout', {
        method: 'POST',
        body: JSON.stringify({ sessionToken: this.adminToken }),
      });

      return response;
    } catch (error) {
      // Even if logout fails, clear local token
      console.error('Logout API error:', error);
      return { success: true, message: 'Logged out locally' };
    } finally {
      // Always clear admin token
      this.clearAdminToken();
    }
  }

  async getAdminStats(): Promise<AdminStatsResponse> {
    return this.fetch<AdminStatsResponse>('/admin/stats');
  }

  // Token management methods
  private setAdminToken(token: string) {
    console.log('Setting admin token:', token.substring(0, 10) + '...');
    this.adminToken = token;
    try {
      localStorage.setItem('adminToken', token);
      console.log('Admin token stored in localStorage successfully');
    } catch (error) {
      console.error('Failed to store admin token:', error);
    }
  }

  private clearAdminToken() {
    this.adminToken = null;
    try {
      localStorage.removeItem('adminToken');
      console.log('Admin token cleared');
    } catch (error) {
      console.error('Failed to clear admin token:', error);
    }
  }

  // Initialize admin token from localStorage
  initializeAdminToken() {
    try {
      const savedToken = localStorage.getItem('adminToken');
      console.log('Initializing admin token from localStorage:', savedToken ? 'found' : 'not found');
      if (savedToken) {
        this.adminToken = savedToken;
        console.log('Admin token initialized from localStorage');
      }
    } catch (error) {
      console.error('Failed to initialize admin token:', error);
    }
  }

  // Check if admin is logged in
  isAdminLoggedIn(): boolean {
    const isLoggedIn = !!this.adminToken;
    console.log('Checking admin login status:', isLoggedIn, 'Token exists:', !!this.adminToken);
    return isLoggedIn;
  }

  // Get current admin token (for debugging)
  getAdminToken(): string | null {
    return this.adminToken;
  }
}

export const apiService = new ApiService();

// Initialize admin token when service is created
apiService.initializeAdminToken();