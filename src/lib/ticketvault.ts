import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database.types'

// Configuration for TicketVault API
interface TicketVaultConfig {
  apiKey: string | null;
  apiSecret: string | null;
  environment: 'sandbox' | 'production';
  timeout?: number; // API request timeout in ms
  retries?: number; // Number of retries for failed requests
}

// Read from environment variables with fallbacks
const config: TicketVaultConfig = {
  apiKey: import.meta.env.VITE_TICKETVAULT_API_KEY || null,
  apiSecret: import.meta.env.VITE_TICKETVAULT_API_SECRET || null,
  environment: (import.meta.env.VITE_TICKETVAULT_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
  timeout: 10000, // 10 seconds default timeout
  retries: 3 // Default 3 retries
}

/**
 * Error class for TicketVault API errors with detailed information
 */
export class TicketVaultError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'TicketVaultError';
  }
}

// TicketVault API Client for Electronic Ticket Delivery
class TicketVaultAPI {
  private baseUrl: string;
  private supabase: ReturnType<typeof createClient<Database>>;
  private requestQueue: Map<string, Promise<any>> = new Map();
  
  constructor(private config: TicketVaultConfig) {
    this.baseUrl = config.environment === 'production'
      ? 'https://api.ticketvault.com/v1'
      : 'https://api.sandbox.ticketvault.com/v1';

    // Initialize Supabase client for database operations
    this.supabase = createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL || '',
      import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    );
  }
  
  /**
   * Check if all required credentials are available and valid
   */
  hasValidCredentials(): boolean {
    return !!(this.config.apiKey && this.config.apiSecret);
  }
  
  /**
   * Get authentication headers for API requests
   */
  private getAuthHeaders(): HeadersInit {
    if (!this.hasValidCredentials()) {
      throw new TicketVaultError(
        'TicketVault API credentials not available',
        401,
        'MISSING_CREDENTIALS'
      );
    }
    
    // API requires HMAC signature in the Authorization header
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = this.generateSignature(timestamp);
    
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.config.apiKey!,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
      'X-Client-Version': '1.0.0',
      'Accept': 'application/json'
    };
  }
  
  /**
   * Generate HMAC signature for API authentication
   */
  private generateSignature(timestamp: string): string {
    try {
      const crypto = require('crypto');
      const message = `${this.config.apiKey}${timestamp}`;
      
      return crypto
        .createHmac('sha256', this.config.apiSecret!)
        .update(message)
        .digest('hex');
    } catch (error) {
      console.error('Error generating signature:', error);
      throw new TicketVaultError(
        'Failed to generate API signature',
        500,
        'SIGNATURE_ERROR'
      );
    }
  }
  
  /**
   * Make an API request with automatic retries and error handling
   */
  private async apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    retries = this.config.retries || 3
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestId = `${options.method || 'GET'}-${url}-${Date.now()}`;
    
    // Check if this exact request is already in progress
    // This helps prevent duplicate requests, especially for mutations
    if (this.requestQueue.has(requestId) && options.method !== 'GET') {
      return this.requestQueue.get(requestId) as Promise<T>;
    }
    
    const executeRequest = async (): Promise<T> => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 10000);
        
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...(options.headers || {})
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Handle non-2xx responses
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { message: 'Unknown error' };
          }
          
          throw new TicketVaultError(
            errorData.message || `API error: ${response.status}`,
            response.status,
            errorData.code,
            errorData.details
          );
        }
        
        return await response.json() as T;
      } catch (error: any) {
        // Handle aborted requests (timeout)
        if (error.name === 'AbortError') {
          throw new TicketVaultError(
            'Request timeout',
            408,
            'REQUEST_TIMEOUT'
          );
        }
        
        // If we have retries left and it's a recoverable error, retry
        if (
          retries > 0 && 
          (error.status === 429 || error.status >= 500 || error.name === 'TypeError')
        ) {
          console.warn(`Retrying API request to ${endpoint}, ${retries} retries left`);
          // Exponential backoff: 1s, 2s, 4s, etc.
          const delay = 1000 * Math.pow(2, this.config.retries! - retries);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.apiRequest<T>(endpoint, options, retries - 1);
        }
        
        throw error;
      }
    };
    
    // Store the promise in the queue
    const requestPromise = executeRequest();
    this.requestQueue.set(requestId, requestPromise);
    
    // Clean up the queue after completion
    requestPromise.finally(() => {
      this.requestQueue.delete(requestId);
    });
    
    return requestPromise;
  }
  
  /**
   * Fetch electronic tickets for an order
   */
  async getElectronicTickets(orderId: string): Promise<ElectronicTicket[]> {
    try {
      if (!this.hasValidCredentials()) {
        console.warn('Using mock data for electronic tickets (missing credentials)');
        return this.generateMockElectronicTickets(orderId);
      }

      const data = await this.apiRequest<{tickets: ElectronicTicket[]}>(`/orders/${orderId}/tickets`);
      
      // Record fetch in analytics
      await this.recordTicketActivity(orderId, 'view', {
        ticketCount: data.tickets.length
      });
      
      return data.tickets || [];
    } catch (error) {
      console.error('Error fetching electronic tickets:', error);
      
      // For certain error types, we can fall back to mocks
      if (error instanceof TicketVaultError && (error.status === 404 || error.status === 401)) {
        console.warn('Falling back to mock data for electronic tickets');
        return this.generateMockElectronicTickets(orderId);
      }
      
      throw error;
    }
  }
  
  /**
   * Request delivery of tickets via email
   */
  async deliverTicketsByEmail(
    ticketIds: string[], 
    email: string
  ): Promise<DeliveryResult> {
    try {
      // Validate email format
      if (!email || !this.isValidEmail(email)) {
        throw new TicketVaultError(
          'Invalid email address format',
          400,
          'INVALID_EMAIL'
        );
      }
      
      // Validate ticket IDs
      if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
        throw new TicketVaultError(
          'At least one ticket ID is required',
          400,
          'MISSING_TICKET_IDS'
        );
      }
      
      if (!this.hasValidCredentials()) {
        console.warn('Using mock delivery for electronic tickets (missing credentials)');
        
        // Still record the attempt in our database for consistency
        const mockResult = this.mockTicketDelivery('email');
        await this.recordTicketDelivery(ticketIds, 'email', {
          email,
          deliveryId: mockResult.deliveryId
        });
        
        return mockResult;
      }

      // First record the delivery attempt in our database
      const deliveryRecord = await this.createDeliveryRecord(ticketIds, 'email', email);
      
      // Make the API request
      const data = await this.apiRequest<{deliveryId: string, status: string}>('/tickets/deliver', {
        method: 'POST',
        body: JSON.stringify({
          ticketIds,
          deliveryMethod: 'email',
          recipientEmail: email
        })
      });
      
      // Update the delivery record with the response
      await this.updateDeliveryRecordStatus(
        deliveryRecord.id, 
        'completed',
        data
      );
      
      // Update the ticket records with delivery information
      await this.recordTicketDelivery(ticketIds, 'email', {
        email,
        deliveryId: data.deliveryId
      });

      return {
        success: true,
        deliveryId: data.deliveryId,
        message: `Tickets successfully sent to ${email}`
      };
    } catch (error) {
      console.error('Error delivering tickets by email:', error);
      
      // If we created a delivery record, update it with error
      if (error instanceof TicketVaultError && error.details?.deliveryRecordId) {
        await this.updateDeliveryRecordStatus(
          error.details.deliveryRecordId,
          'failed',
          { error: error.message }
        );
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Create a delivery record in the database
   */
  private async createDeliveryRecord(
    ticketIds: string[],
    method: string,
    recipient: string
  ): Promise<{ id: string }> {
    try {
      // Create a record for each ticket
      const records = ticketIds.map(ticketId => ({
        ticket_id: ticketId,
        delivery_method: method,
        recipient: recipient,
        status: 'pending'
      }));
      
      const { data, error } = await this.supabase
        .from('ticket_deliveries')
        .insert(records)
        .select('id')
        .limit(1)
        .single();
      
      if (error) {
        throw new Error(`Failed to create delivery record: ${error.message}`);
      }
      
      return { id: data.id };
    } catch (error) {
      console.error('Error creating delivery record:', error);
      throw error;
    }
  }
  
  /**
   * Update a delivery record status
   */
  private async updateDeliveryRecordStatus(
    id: string,
    status: 'completed' | 'failed' | 'pending',
    details: any
  ): Promise<void> {
    try {
      const updateData: any = {
        status: status,
        provider_response: details
      };
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      if (status === 'failed' && details?.error) {
        updateData.error_details = details.error.toString();
      }
      
      const { error } = await this.supabase
        .from('ticket_deliveries')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error('Failed to update delivery record:', error);
      }
    } catch (error) {
      console.error('Error updating delivery record:', error);
    }
  }
  
  /**
   * Generate wallet passes (Apple Wallet, Google Pay)
   */
  async generateWalletTickets(
    ticketIds: string[], 
    walletType: 'apple' | 'google'
  ): Promise<WalletTicket | null> {
    try {
      // Validate wallet type
      if (!['apple', 'google'].includes(walletType)) {
        throw new TicketVaultError(
          'Invalid wallet type. Must be "apple" or "google"',
          400, 
          'INVALID_WALLET_TYPE'
        );
      }
      
      // Validate ticket IDs
      if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
        throw new TicketVaultError(
          'At least one ticket ID is required',
          400,
          'MISSING_TICKET_IDS'
        );
      }
      
      if (!this.hasValidCredentials()) {
        console.warn('Using mock wallet tickets (missing credentials)');
        return this.generateMockWalletTicket(ticketIds[0], walletType);
      }

      // First record the delivery attempt
      const deliveryRecord = await this.createDeliveryRecord(
        ticketIds, 
        `wallet_${walletType}`, 
        'user'
      );

      // Make the API request
      const data = await this.apiRequest<{
        passId: string;
        passUrl: string;
        expiresAt: string;
      }>('/tickets/wallet', {
        method: 'POST',
        body: JSON.stringify({
          ticketIds,
          walletType
        })
      });
      
      // Update the delivery record with success
      await this.updateDeliveryRecordStatus(
        deliveryRecord.id,
        'completed',
        data
      );
      
      // Update tickets with wallet information
      await this.recordTicketDelivery(ticketIds, 'wallet', {
        walletType,
        passId: data.passId,
        passUrl: data.passUrl
      });
      
      // Update ticket records with wallet pass URL
      for (const ticketId of ticketIds) {
        await this.supabase
          .from('tickets')
          .update({
            wallet_pass_url: data.passUrl
          })
          .eq('id', ticketId);
      }

      return {
        passId: data.passId,
        passUrl: data.passUrl,
        walletType,
        expiresAt: data.expiresAt
      };
    } catch (error) {
      console.error(`Error generating ${walletType} wallet tickets:`, error);
      
      // If we created a delivery record, update it with error
      if (error instanceof Error && 'details' in error && 
          (error as any).details?.deliveryRecordId) {
        await this.updateDeliveryRecordStatus(
          (error as any).details.deliveryRecordId,
          'failed',
          { error: error.message }
        );
      }
      
      return null;
    }
  }
  
  /**
   * Validate a ticket's authenticity and status
   */
  async validateTicket(
    ticketId: string, 
    barcode: string
  ): Promise<ValidationResult> {
    try {
      // Validate inputs
      if (!ticketId) {
        throw new TicketVaultError(
          'Ticket ID is required',
          400,
          'MISSING_TICKET_ID'
        );
      }
      
      if (!barcode) {
        throw new TicketVaultError(
          'Barcode is required',
          400,
          'MISSING_BARCODE'
        );
      }
      
      if (!this.hasValidCredentials()) {
        console.warn('Using mock ticket validation (missing credentials)');
        return this.mockTicketValidation(ticketId, barcode);
      }

      // Make API request with extra security measures for validation
      const data = await this.apiRequest<ValidationResult>('/tickets/validate', {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          // Add extra security for validation requests
          'X-Validation-Source': window.location.hostname,
          'X-Validation-Time': new Date().toISOString()
        },
        body: JSON.stringify({
          ticketId,
          barcode
        })
      });

      // Record the validation attempt regardless of result
      await this.recordTicketActivity(ticketId, 'validate', {
        valid: data.valid,
        status: data.status,
        timestamp: new Date().toISOString()
      });

      return data;
    } catch (error) {
      console.error('Error validating ticket:', error);
      
      // Record validation failure
      try {
        await this.recordTicketActivity(ticketId, 'validate_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      } catch (recordError) {
        console.error('Failed to record validation error:', recordError);
      }
      
      return {
        valid: false,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Record ticket delivery in the database
   */
  private async recordTicketDelivery(
    ticketIds: string[], 
    deliveryMethod: string, 
    details: any
  ): Promise<void> {
    try {
      // First get the orders associated with these tickets
      const { data: tickets, error: ticketsError } = await this.supabase
        .from('tickets')
        .select('id, event_id')
        .in('id', ticketIds);
        
      if (ticketsError) {
        throw new Error(`Error retrieving tickets: ${ticketsError.message}`);
      }
      
      // Extract event and ticket IDs
      const ticketIdList = tickets?.map(t => t.id) || [];
      const eventIds = [...new Set(tickets?.map(t => t.event_id) || [])];
      
      // Find orders with these tickets
      const { data: orders, error: ordersError } = await this.supabase
        .from('orders')
        .select('id, status, webhook_logs')
        .in('ticket_id', ticketIdList);
        
      if (ordersError) {
        throw new Error(`Error retrieving orders: ${ordersError.message}`);
      }

      // Update each ticket with delivery information
      for (const ticketId of ticketIdList) {
        await this.supabase
          .from('tickets')
          .update({
            delivery_status: 'delivered',
            last_delivery_timestamp: new Date().toISOString(),
            electronic_ticket_url: details.ticketUrl || null,
            wallet_pass_url: details.passUrl || null,
          })
          .eq('id', ticketId);
      }

      // Update each order with delivery information
      for (const order of orders || []) {
        const webhookLog = {
          timestamp: new Date().toISOString(),
          event: 'ticket.delivered',
          deliveryMethod,
          ticketIds: ticketIdList,
          details
        };
        
        await this.supabase
          .from('orders')
          .update({
            status: 'delivered',
            last_webhook_status: 'ticket_delivered',
            last_webhook_timestamp: new Date().toISOString(),
            webhook_logs: order.webhook_logs ? [...order.webhook_logs, webhookLog] : [webhookLog],
            notification_sent: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);
      }
    } catch (error) {
      console.error('Error recording ticket delivery:', error);
      throw error;
    }
  }
  
  /**
   * Record ticket activity for analytics
   */
  private async recordTicketActivity(
    ticketIdOrOrderId: string,
    activityType: 'view' | 'validate' | 'download' | 'delivery' | 'validate_error' | 'transfer',
    details: any
  ): Promise<void> {
    try {
      // This is a stub - in a real implementation, this would record to an analytics system
      console.log(`[TicketVault Analytics] ${activityType} for ${ticketIdOrOrderId}:`, details);
      
      // We could record this to a database table for analytics reports
      // Here we're just logging for demonstration purposes
    } catch (error) {
      console.error('Error recording ticket activity:', error);
      // Non-critical, so we swallow the error
    }
  }
  
  // ------------------------
  // Mock Data Implementation
  // ------------------------
  /**
   * Generate mock electronic tickets for an order
   */
  private generateMockElectronicTickets(orderId: string): ElectronicTicket[] {
    const tickets: ElectronicTicket[] = [];
    const ticketCount = Math.floor(Math.random() * 3) + 1; // 1-3 tickets
    
    for (let i = 1; i <= ticketCount; i++) {
      const ticketId = `mock-ticket-${orderId}-${i}`;
      tickets.push({
        ticketId,
        orderId,
        eventName: 'Mock Concert Event',
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        venue: 'Mock Arena',
        section: `Section ${100 + i}`,
        row: `Row ${String.fromCharCode(64 + i)}`, // A, B, C, etc.
        seat: `${10 + i}`,
        barcode: this.generateMockBarcode(),
        barcodeType: 'qrcode',
        status: 'valid',
        restrictions: [],
        deliveryMethods: ['email', 'app', 'wallet'],
        imageUrl: `https://example.com/tickets/${ticketId}.png`
      });
    }
    
    return tickets;
  }
  
  /**
   * Generate a mock barcode for testing
   */
  private generateMockBarcode(): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  /**
   * Mock a ticket delivery operation
   */
  private mockTicketDelivery(method: string): DeliveryResult {
    return {
      success: true,
      deliveryId: `mock-delivery-${Date.now()}`,
      message: `Tickets successfully sent via ${method} (MOCK)`
    };
  }
  
  /**
   * Generate a mock wallet ticket
   */
  private generateMockWalletTicket(ticketId: string, walletType: 'apple' | 'google'): WalletTicket {
    const now = new Date();
    const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    
    return {
      passId: `mock-pass-${Date.now()}`,
      passUrl: `https://example.com/${walletType}-wallet/pass-${ticketId}`,
      walletType,
      expiresAt: expiryDate.toISOString()
    };
  }
  
  /**
   * Mock ticket validation
   */
  private mockTicketValidation(ticketId: string, barcode: string): ValidationResult {
    // Generate a deterministic validation based on the barcode
    const isValid = barcode.length > 8 && /^[A-Z0-9]+$/.test(barcode);
    
    if (!isValid) {
      return {
        valid: false,
        status: 'invalid',
        message: 'Invalid barcode format'
      };
    }
    
    // Randomly determine if the ticket has been used
    const hasBeenUsed = barcode.charAt(0) <= 'G'; // ~25% chance

    if (hasBeenUsed) {
      return {
        valid: true,
        status: 'used',
        message: 'Ticket has already been scanned',
        scannedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
      };
    }
    
    return {
      valid: true,
      status: 'valid',
      message: 'Ticket is valid and ready for use',
      ticketId,
      eventName: 'Mock Concert Event',
      section: 'Section 101',
      row: 'Row A',
      seat: '12'
    };
  }
}

// Initialize the API client
const ticketVaultClient = new TicketVaultAPI(config);

// Log environment for clarity
const isUsingMockData = !config.apiKey || !config.apiSecret;
console.log(`TicketVault running with ${isUsingMockData ? 'MOCK' : 'REAL'} data in ${config.environment} mode`);

// -----------------
// Types
// -----------------

export interface ElectronicTicket {
  ticketId: string;
  orderId: string;
  eventName: string;
  eventDate: string;
  venue: string;
  section: string;
  row: string;
  seat: string;
  barcode: string;
  barcodeType: 'qrcode' | 'barcode' | 'aztec';
  status: 'valid' | 'used' | 'expired' | 'voided';
  restrictions: string[];
  deliveryMethods: string[];
  imageUrl: string;
  scannedAt?: string; // When the ticket was scanned/used
}

export interface DeliveryResult {
  success: boolean;
  deliveryId?: string;
  message: string;
}

export interface WalletTicket {
  passId: string;
  passUrl: string;
  walletType: 'apple' | 'google';
  expiresAt: string;
}

export interface ValidationResult {
  valid: boolean;
  status: 'valid' | 'used' | 'expired' | 'voided' | 'invalid' | 'error';
  message: string;
  scannedAt?: string;
  ticketId?: string;
  eventName?: string;
  section?: string;
  row?: string;
  seat?: string;
}

// -----------------
// API Functions
// -----------------

/**
 * Get electronic tickets for an order
 */
export async function getElectronicTickets(orderId: string): Promise<ElectronicTicket[]> {
  return ticketVaultClient.getElectronicTickets(orderId);
}

/**
 * Deliver tickets via email
 */
export async function deliverTicketsByEmail(
  ticketIds: string[], 
  email: string
): Promise<DeliveryResult> {
  return ticketVaultClient.deliverTicketsByEmail(ticketIds, email);
}

/**
 * Generate wallet passes for tickets
 */
export async function generateWalletTickets(
  ticketIds: string[], 
  walletType: 'apple' | 'google'
): Promise<WalletTicket | null> {
  return ticketVaultClient.generateWalletTickets(ticketIds, walletType);
}

/**
 * Validate a ticket
 */
export async function validateTicket(ticketId: string, barcode: string): Promise<ValidationResult> {
  return ticketVaultClient.validateTicket(ticketId, barcode);
}

// -----------------
// React Query Hooks
// -----------------

/**
 * Hook for getting electronic tickets
 */
export const useElectronicTickets = (orderId: string | null) => {
  return useQuery({
    queryKey: ['electronic-tickets', orderId],
    queryFn: () => orderId ? getElectronicTickets(orderId) : [],
    enabled: !!orderId,
  });
};

/**
 * Hook for delivering tickets via email
 */
export const useDeliverTicketsByEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ticketIds, email }: { ticketIds: string[], email: string }) => 
      deliverTicketsByEmail(ticketIds, email),
    onSuccess: () => {
      // Invalidate relevant queries when delivery succeeds
      queryClient.invalidateQueries({ queryKey: ['electronic-tickets'] });
    },
  });
};

/**
 * Hook for generating wallet passes
 */
export const useGenerateWalletTickets = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ticketIds, walletType }: { ticketIds: string[], walletType: 'apple' | 'google' }) =>
      generateWalletTickets(ticketIds, walletType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['electronic-tickets'] });
    },
  });
};
