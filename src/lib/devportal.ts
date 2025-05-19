/**
 * DevPortal API Client
 * 
 * This client provides methods to interact with the Developer Portal API.
 * It handles authentication, request formatting, and response parsing.
 */

interface DevPortalConfig {
  apiUrl: string;
  apiKey: string;
  organizationId?: string;
}

interface DevPortalCredentials {
  clientId: string;
  clientSecret: string;
}

interface DevPortalAccessToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Specific API Response types
interface ApiKeyResponse {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  expiresAt: string | null;
  permissions: string[];
}

interface ApplicationResponse {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
  updatedAt: string;
  apiKeys: ApiKeyResponse[];
}

interface SubscriptionResponse {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'pending' | 'cancelled';
  startDate: string;
  endDate: string | null;
  billingCycle: 'monthly' | 'annual';
  price: number;
}

class DevPortalClient {
  private config: DevPortalConfig;
  private credentials?: DevPortalCredentials;
  private token?: DevPortalAccessToken;
  
  constructor(config: DevPortalConfig) {
    this.config = config;
  }
  
  /**
   * Initialize the client with credentials
   */
  public setCredentials(credentials: DevPortalCredentials): void {
    this.credentials = credentials;
  }
  
  /**
   * Authenticate with the DevPortal API to obtain an access token
   */
  public async authenticate(): Promise<boolean> {
    if (!this.credentials) {
      throw new Error('Credentials must be set before authentication');
    }
    
    try {
      const response = await fetch(`${this.config.apiUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey
        },
        body: JSON.stringify({
          clientId: this.credentials.clientId,
          clientSecret: this.credentials.clientSecret,
          grantType: 'client_credentials'
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Authentication failed');
      }
      
      const data = await response.json();
      this.token = {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: Date.now() + (data.expiresIn * 1000)
      };
      
      return true;
    } catch (error) {
      console.error('DevPortal authentication error:', error);
      return false;
    }
  }
  
  /**
   * Check if the current token is valid, refresh if needed
   */
  private async ensureAuthenticated(): Promise<boolean> {
    if (!this.token) {
      return this.authenticate();
    }
    
    // Token expired, needs refresh
    if (Date.now() >= this.token.expiresAt - 60000) { // 1 minute buffer
      try {
        const response = await fetch(`${this.config.apiUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.config.apiKey
          },
          body: JSON.stringify({
            refreshToken: this.token.refreshToken
          })
        });
        
        if (!response.ok) {
          // If refresh fails, try full authentication
          return this.authenticate();
        }
        
        const data = await response.json();
        this.token = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: Date.now() + (data.expiresIn * 1000)
        };
        
        return true;
      } catch (error) {
        console.error('DevPortal token refresh error:', error);
        return this.authenticate();
      }
    }
    
    return true;
  }
  
  /**
   * Make an API request to the DevPortal
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    const authenticated = await this.ensureAuthenticated();
    if (!authenticated) {
      return {
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: 'Failed to authenticate with DevPortal'
        }
      };
    }
    
    try {
      const url = `${this.config.apiUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token!.accessToken}`,
        'X-API-Key': this.config.apiKey
      };
      
      if (this.config.organizationId) {
        headers['X-Organization-ID'] = this.config.organizationId;
      }
      
      const options: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
      };
      
      const response = await fetch(url, options);
      const responseData = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: {
            code: responseData.code || 'API_ERROR',
            message: responseData.message || 'Request failed',
            details: responseData.details
          }
        };
      }
      
      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      console.error('DevPortal API request error:', error);
      return {
        success: false,
        error: {
          code: 'REQUEST_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
  
  // API Methods
  
  /**
   * Get list of applications
   */
  async getApplications(): Promise<ApiResponse<ApplicationResponse[]>> {
    return this.request<ApplicationResponse[]>('GET', '/applications');
  }
  
  /**
   * Get application details
   */
  async getApplication(appId: string): Promise<ApiResponse<ApplicationResponse>> {
    return this.request<ApplicationResponse>('GET', `/applications/${appId}`);
  }
  
  /**
   * Create a new application
   */
  async createApplication(
    data: { name: string; description: string }
  ): Promise<ApiResponse<ApplicationResponse>> {
    return this.request<ApplicationResponse>('POST', '/applications', data);
  }
  
  /**
   * Update an application
   */
  async updateApplication(
    appId: string,
    data: { name?: string; description?: string }
  ): Promise<ApiResponse<ApplicationResponse>> {
    return this.request<ApplicationResponse>('PATCH', `/applications/${appId}`, data);
  }
  
  /**
   * Delete an application
   */
  async deleteApplication(appId: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/applications/${appId}`);
  }
  
  /**
   * Generate a new API key for an application
   */
  async generateApiKey(
    appId: string,
    data: { name: string; permissions: string[]; expiresAt?: string }
  ): Promise<ApiResponse<ApiKeyResponse>> {
    return this.request<ApiKeyResponse>('POST', `/applications/${appId}/api-keys`, data);
  }
  
  /**
   * Revoke an API key
   */
  async revokeApiKey(appId: string, keyId: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/applications/${appId}/api-keys/${keyId}`);
  }
  
  /**
   * Get subscriptions for an application
   */
  async getSubscriptions(appId: string): Promise<ApiResponse<SubscriptionResponse[]>> {
    return this.request<SubscriptionResponse[]>('GET', `/applications/${appId}/subscriptions`);
  }
  
  /**
   * Subscribe an application to an API plan
   */
  async createSubscription(
    appId: string,
    data: { planId: string }
  ): Promise<ApiResponse<SubscriptionResponse>> {
    return this.request<SubscriptionResponse>('POST', `/applications/${appId}/subscriptions`, data);
  }
  
  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    appId: string,
    subscriptionId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/applications/${appId}/subscriptions/${subscriptionId}`);
  }
  
  /**
   * Get API usage metrics for an application
   */
  async getApiMetrics(
    appId: string,
    params: { startDate: string; endDate: string; interval?: 'hour' | 'day' | 'week' | 'month' }
  ): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    
    return this.request<any>('GET', `/applications/${appId}/metrics?${queryParams.toString()}`);
  }
}

// Create and export a singleton instance with configuration from environment variables
const devPortalClient = new DevPortalClient({
  apiUrl: import.meta.env.VITE_DEVPORTAL_API_URL || 'https://api.devportal.example.com',
  apiKey: import.meta.env.VITE_DEVPORTAL_API_KEY || ''
});

export { DevPortalClient, devPortalClient };
export type { 
  DevPortalConfig, 
  DevPortalCredentials, 
  ApiResponse, 
  ApplicationResponse, 
  ApiKeyResponse,
  SubscriptionResponse
};
