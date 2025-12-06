import { fetchAPI, API_ENDPOINTS } from '../config/api';
import { Ticket, TicketStatus, PriorityLevel } from '../components/TicketCard';

/**
 * Ticket API 服務層
 * 封裝所有與後端 API 的互動邏輯
 */
export const ticketService = {
  /**
   * 查詢所有工單
   * GET /tickets
   */
  async getAllTickets(): Promise<Ticket[]> {
    try {
      const data = await fetchAPI(API_ENDPOINTS.tickets);
      console.log('[TicketService] Raw API response:', data);

      // 處理多種可能的回應格式
      let items: Ticket[] = [];

      if (Array.isArray(data)) {
        // 直接是陣列: [...]
        items = data;
      } else if (data.items && Array.isArray(data.items)) {
        // 格式: { items: [...] }
        items = data.items;
      } else if (data.Items && Array.isArray(data.Items)) {
        // 格式: { Items: [...] } (DynamoDB 預設)
        items = data.Items;
      } else {
        console.warn('[TicketService] Unknown data format:', data);
        return [];
      }

      console.log('[TicketService] Parsed tickets:', items.length);
      return items;
    } catch (error) {
      console.error('[TicketService] Failed to load tickets:', error);
      throw error;
    }
  },

  /**
   * 查詢單筆工單詳情
   * GET /tickets/{ticket_id}
   */
  async getTicketById(ticketId: string): Promise<Ticket> {
    try {
      const data = await fetchAPI(API_ENDPOINTS.ticketById(ticketId));
      console.log('[TicketService] Loaded ticket:', ticketId);
      return data;
    } catch (error) {
      console.error('[TicketService] Failed to load ticket:', ticketId, error);
      throw error;
    }
  },

  /**
   * 註冊新使用者
   */
  async register(email: string, password: string, name: string) {
    return fetchAPI(API_ENDPOINTS.tickets, {
      method: 'POST',
      body: JSON.stringify({ action: 'register', email, password, name }),
    });
  },

  /**
   * 使用者登入
   */
  async login(email: string, password: string) {
    return fetchAPI(API_ENDPOINTS.tickets, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email, password }),
    });
  },

  /**
   * 建立新工單
   * POST /tickets
   * 會觸發 SQS 訊息並發送 SNS Email 通知
   */
  async createTicket(request: {
    title: string;
    description: string;
    priority: PriorityLevel;
    user_email: string;
    user_name?: string;
  }): Promise<{ message: string; ticket_id: string }> {
    try {
      const data = await fetchAPI(API_ENDPOINTS.tickets, {
        method: 'POST',
        body: JSON.stringify(request),
      });
      console.log('[TicketService] Created ticket:', data.ticket_id);
      return data;
    } catch (error) {
      console.error('[TicketService] Failed to create ticket:', error);
      throw error;
    }
  },

  /**
   * 更新工單狀態
   * 改用 PUT 以配合標準 RESTful 風格及簡化 Gateway 設定
   */
  async updateTicket(
    ticketId: string,
    status: TicketStatus
  ): Promise<void> {
    try {
      await fetchAPI(API_ENDPOINTS.ticketById(ticketId), {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      console.log('[TicketService] Updated ticket:', ticketId, 'to', status);
    } catch (error) {
      console.error('[TicketService] Failed to update ticket:', ticketId, error);
      throw error;
    }
  },

  /**
   * 刪除工單
   * DELETE /tickets/{ticket_id}
   */
  async deleteTicket(ticketId: string): Promise<void> {
    try {
      await fetchAPI(API_ENDPOINTS.ticketById(ticketId), {
        method: 'DELETE',
      });
      console.log('[TicketService] Deleted ticket:', ticketId);
    } catch (error) {
      console.error('[TicketService] Failed to delete ticket:', ticketId, error);
      throw error;
    }
  },
};
