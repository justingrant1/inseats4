import { supabase } from '@/lib/supabase';
import { ElectronicTicket } from '@/lib/ticketvault';
import { Database } from '@/types/database.types';

type TicketShare = Database['public']['Tables']['ticket_shares']['Row'];

interface EmailShareOptions {
  recipientEmail: string;
  senderName?: string;
  personalMessage?: string;
}

interface SmsShareOptions {
  phoneNumber: string;
  personalMessage?: string;
}

interface SharingResult {
  success: boolean;
  message: string;
  shareId?: string;
  shareUrl?: string;
  error?: any;
}

// Main service for ticket sharing functionality
export const TicketSharing = {
  /**
   * Share a ticket via email
   */
  async shareViaEmail(
    ticketId: string,
    options: EmailShareOptions
  ): Promise<SharingResult> {
    try {
      const { recipientEmail, senderName, personalMessage } = options;
      
      // First, get the ticket details to include in the email
      const ticket = await getTicketDetails(ticketId);
      if (!ticket) {
        return {
          success: false,
          message: 'Ticket not found',
        };
      }
      
      // Create a secure sharing record with expiration
      const { data: sharingData, error: sharingError } = await supabase
        .from('ticket_shares')
        .insert({
          ticket_id: ticketId,
          recipient_email: recipientEmail,
          share_type: 'email',
          sender_name: senderName || '',
          personal_message: personalMessage || '',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        })
        .select()
        .single();
      
      if (sharingError) {
        console.error('Error creating sharing record:', sharingError);
        return {
          success: false,
          message: 'Failed to create sharing record',
          error: sharingError,
        };
      }
      
      // Generate a secure sharing URL with the share ID
      const shareUrl = `https://inseats.com/shared/${sharingData.id}`;
      
      // Send the email via Supabase Edge Function
      const { error: emailError } = await supabase.functions.invoke('ticket-sharing', {
        body: {
          type: 'email',
          ticketId,
          shareId: sharingData.id,
          recipientEmail,
          senderName,
          personalMessage,
          shareUrl,
          ticketDetails: {
            eventName: ticket.eventName,
            eventDate: ticket.eventDate,
            venue: ticket.venue,
            section: ticket.section,
            row: ticket.row,
            seat: ticket.seat,
          },
        },
      });
      
      if (emailError) {
        console.error('Error sending email:', emailError);
        return {
          success: false,
          message: 'Failed to send email',
          error: emailError,
        };
      }
      
      return {
        success: true,
        message: `Ticket shared via email to ${recipientEmail}`,
        shareId: sharingData.id,
        shareUrl,
      };
    } catch (error) {
      console.error('Error sharing ticket via email:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error,
      };
    }
  },
  
  /**
   * Share a ticket via SMS
   */
  async shareViaSms(
    ticketId: string,
    options: SmsShareOptions
  ): Promise<SharingResult> {
    try {
      const { phoneNumber, personalMessage } = options;
      
      // First, get the ticket details
      const ticket = await getTicketDetails(ticketId);
      if (!ticket) {
        return {
          success: false,
          message: 'Ticket not found',
        };
      }
      
      // Create a secure sharing record with expiration
      const { data: sharingData, error: sharingError } = await supabase
        .from('ticket_shares')
        .insert({
          ticket_id: ticketId,
          recipient_phone: phoneNumber,
          share_type: 'sms',
          personal_message: personalMessage || '',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        })
        .select()
        .single();
      
      if (sharingError) {
        console.error('Error creating sharing record:', sharingError);
        return {
          success: false,
          message: 'Failed to create sharing record',
          error: sharingError,
        };
      }
      
      // Generate a secure sharing URL with the share ID
      const shareUrl = `https://inseats.com/shared/${sharingData.id}`;
      
      // Send the SMS via Supabase Edge Function
      const { error: smsError } = await supabase.functions.invoke('ticket-sharing', {
        body: {
          type: 'sms',
          ticketId,
          shareId: sharingData.id,
          phoneNumber,
          personalMessage,
          shareUrl,
          ticketDetails: {
            eventName: ticket.eventName,
            eventDate: ticket.eventDate,
          },
        },
      });
      
      if (smsError) {
        console.error('Error sending SMS:', smsError);
        return {
          success: false,
          message: 'Failed to send SMS',
          error: smsError,
        };
      }
      
      return {
        success: true,
        message: `Ticket shared via SMS to ${phoneNumber}`,
        shareId: sharingData.id,
        shareUrl,
      };
    } catch (error) {
      console.error('Error sharing ticket via SMS:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error,
      };
    }
  },
  
  /**
   * Generate a shareable link for a ticket
   */
  async generateShareableLink(ticketId: string): Promise<SharingResult> {
    try {
      // First, get the ticket details to verify it exists
      const ticket = await getTicketDetails(ticketId);
      if (!ticket) {
        return {
          success: false,
          message: 'Ticket not found',
        };
      }
      
      // Create a secure sharing record with expiration
      const { data: sharingData, error: sharingError } = await supabase
        .from('ticket_shares')
        .insert({
          ticket_id: ticketId,
          share_type: 'link',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        })
        .select()
        .single();
      
      if (sharingError) {
        console.error('Error creating sharing record:', sharingError);
        return {
          success: false,
          message: 'Failed to create sharing record',
          error: sharingError,
        };
      }
      
      // Generate a secure sharing URL with the share ID
      const shareUrl = `https://inseats.com/shared/${sharingData.id}`;
      
      return {
        success: true,
        message: 'Shareable link generated successfully',
        shareId: sharingData.id,
        shareUrl,
      };
    } catch (error) {
      console.error('Error generating shareable link:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error,
      };
    }
  },
  
  /**
   * Get a shared ticket by its share ID
   */
  async getSharedTicket(shareId: string): Promise<{
    ticket?: ElectronicTicket;
    shareInfo?: TicketShare;
    error?: string;
  }> {
    try {
      // Get the share record
      const { data: shareData, error: shareError } = await supabase
        .from('ticket_shares')
        .select('*')
        .eq('id', shareId)
        .single();
      
      if (shareError || !shareData) {
        return { error: 'Shared ticket not found' };
      }
      
      // Check if the share has expired
      if (new Date(shareData.expires_at) < new Date()) {
        return { error: 'This shared ticket link has expired' };
      }
      
      // Get the ticket details
      const ticket = await getTicketDetails(shareData.ticket_id);
      if (!ticket) {
        return { error: 'Ticket information not available' };
      }
      
      // Update view count
      if (shareData) {
        await supabase
          .from('ticket_shares')
          .update({ view_count: (shareData.view_count || 0) + 1 })
          .eq('id', shareId);
      }
      
      return {
        ticket,
        shareInfo: shareData,
      };
    } catch (error) {
      console.error('Error getting shared ticket:', error);
      return { error: 'An unexpected error occurred' };
    }
  },
  
  /**
   * Revoke a shared ticket
   */
  async revokeSharedTicket(shareId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ticket_shares')
        .update({ 
          revoked: true, 
          revoked_at: new Date().toISOString() 
        })
        .eq('id', shareId);
      
      return !error;
    } catch (error) {
      console.error('Error revoking shared ticket:', error);
      return false;
    }
  },
};

/**
 * Helper function to get ticket details
 */
async function getTicketDetails(ticketId: string): Promise<ElectronicTicket | null> {
  try {
    // Get ticket from database
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        id,
        event_id,
        section,
        row_name,
        seat,
        barcode,
        barcode_type,
        electronic_ticket_url,
        status,
        events (
          title,
          date,
          venue,
          location
        )
      `)
      .eq('id', ticketId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching ticket:', error);
      return null;
    }
    
    // Map database result to ElectronicTicket format
    return {
      ticketId: data.id,
      orderId: data.event_id, // using event_id as orderId since this is what the ElectronicTicket type expects
      eventName: data.events.title,
      eventDate: data.events.date,
      venue: `${data.events.venue}, ${data.events.location}`,
      section: data.section,
      row: data.row_name,
      seat: data.seat,
      barcode: data.barcode,
      barcodeType: data.barcode_type as 'qrcode' | 'barcode' | 'aztec',
      imageUrl: data.electronic_ticket_url,
      status: data.status as 'valid' | 'used' | 'expired' | 'voided',
      restrictions: [], // Adding required empty restrictions array
      deliveryMethods: ['email', 'app', 'wallet'], // Adding required delivery methods
    };
  } catch (error) {
    console.error('Error in getTicketDetails:', error);
    return null;
  }
}
