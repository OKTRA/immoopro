
import { supabase } from '@/lib/supabase';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  assigned_to?: string;
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
  attachments?: any[];
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_staff_reply: boolean;
  created_at: Date;
  attachments?: any[];
}

export interface TicketFilter {
  status?: string;
  priority?: string;
  category?: string;
  assigned_to?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export const supportTicketService = {
  async createTicket(ticket: Omit<SupportTicket, 'id' | 'ticket_number' | 'created_at' | 'updated_at'>): Promise<SupportTicket | null> {
    try {
      // Generate a ticket number (format: T-YYMMDDxxxx)
      const date = new Date();
      const datePart = date.getFullYear().toString().substring(2) + 
                      (date.getMonth() + 1).toString().padStart(2, '0') + 
                      date.getDate().toString().padStart(2, '0');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const ticketNumber = `T-${datePart}${randomPart}`;
      
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          ...ticket,
          ticket_number: ticketNumber
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Failed to create support ticket:', error);
      return null;
    }
  },
  
  async getTicket(ticketId: string): Promise<SupportTicket | null> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error(`Failed to get ticket with ID ${ticketId}:`, error);
      return null;
    }
  },
  
  async getTickets(filter?: TicketFilter): Promise<SupportTicket[]> {
    try {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filter) {
        if (filter.status) query = query.eq('status', filter.status);
        if (filter.priority) query = query.eq('priority', filter.priority);
        if (filter.category) query = query.eq('category', filter.category);
        if (filter.assigned_to) query = query.eq('assigned_to', filter.assigned_to);
        if (filter.dateFrom) query = query.gte('created_at', filter.dateFrom.toISOString());
        if (filter.dateTo) query = query.lte('created_at', filter.dateTo.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to get support tickets:', error);
      return [];
    }
  },
  
  async updateTicket(ticketId: string, updates: Partial<SupportTicket>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error(`Failed to update ticket with ID ${ticketId}:`, error);
      return false;
    }
  },
  
  async addTicketMessage(message: Omit<TicketMessage, 'id' | 'created_at'>): Promise<TicketMessage | null> {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .insert(message)
        .select()
        .single();
      
      if (error) throw error;
      
      // Also update the ticket's updated_at timestamp
      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', message.ticket_id);
      
      return data;
    } catch (error) {
      console.error('Failed to add ticket message:', error);
      return null;
    }
  },
  
  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error(`Failed to get messages for ticket with ID ${ticketId}:`, error);
      return [];
    }
  },
  
  async getTicketStats(): Promise<{ 
    open: number; 
    in_progress: number; 
    closed: number; 
    high_priority: number;
    response_time_avg: number;
    resolution_time_avg: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('id, status, priority, created_at, updated_at, resolved_at');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          open: 0,
          in_progress: 0,
          closed: 0,
          high_priority: 0,
          response_time_avg: 0,
          resolution_time_avg: 0
        };
      }
      
      const stats = {
        open: data.filter(t => t.status === 'open').length,
        in_progress: data.filter(t => t.status === 'in_progress').length,
        closed: data.filter(t => t.status === 'closed').length,
        high_priority: data.filter(t => t.priority === 'high').length,
        response_time_avg: 0,
        resolution_time_avg: 0
      };
      
      // Calculate average resolution time for closed tickets
      const closedTickets = data.filter(t => t.status === 'closed' && t.resolved_at);
      if (closedTickets.length > 0) {
        const totalResolutionTime = closedTickets.reduce((sum, ticket) => {
          const created = new Date(ticket.created_at);
          const resolved = new Date(ticket.resolved_at);
          return sum + (resolved.getTime() - created.getTime());
        }, 0);
        
        // Convert to hours
        stats.resolution_time_avg = totalResolutionTime / closedTickets.length / (1000 * 60 * 60);
      }
      
      return stats;
    } catch (error) {
      console.error('Failed to get ticket statistics:', error);
      return {
        open: 0,
        in_progress: 0,
        closed: 0,
        high_priority: 0,
        response_time_avg: 0,
        resolution_time_avg: 0
      };
    }
  }
};
