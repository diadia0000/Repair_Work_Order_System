import { Clock, AlertCircle, Image as ImageIcon } from 'lucide-react';

export type TicketStatus = 'Open' | 'Processing' | 'Closed';
export type PriorityLevel = 'Low' | 'Medium' | 'High';

export interface Ticket {
  ticket_id: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: PriorityLevel;
  created_at: string;
  images?: string[];
}

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const getStatusStyle = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
      case 'Processing':
        return 'bg-[#DBEAFE] text-[#1E40AF] border-[#93C5FD]';
      case 'Closed':
        return 'bg-[#D1FAE5] text-[#065F46] border-[#6EE7B7]';
    }
  };

  const getPriorityColor = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Low':
        return 'text-[#64748B]';
      case 'Medium':
        return 'text-[#F59E0B]';
      case 'High':
        return 'text-[#EF4444]';
    }
  };

  // 格式化 ISO 8601 時間為顯示用格式
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      // 使用本地時間格式 YYYY-MM-DD
      return date.toLocaleDateString('en-CA');
    } catch {
      return isoString;
    }
  };

  return (
    <div
      onClick={onClick}
      className="card card-hover p-6 cursor-pointer flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="flex-1 line-clamp-2 font-semibold text-[#1E293B] text-lg">{ticket.title}</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap shrink-0 ${getStatusStyle(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-[#64748B] text-sm line-clamp-3 mb-4 flex-1 leading-relaxed">
        {ticket.description}
      </p>

      {/* Image Indicator */}
      {ticket.images && ticket.images.length > 0 && (
        <div className="flex items-center gap-1.5 text-[#2563EB] mb-4">
          <ImageIcon className="w-4 h-4" />
          <span className="text-xs font-medium">
            {ticket.images.length} image{ticket.images.length > 1 ? 's' : ''} attached
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-slate-100 w-full mb-4"></div>

      {/* Footer Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 text-[#94A3B8]">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs">{formatDate(ticket.created_at)}</span>
        </div>
        <div className={`flex items-center gap-1.5 ${getPriorityColor(ticket.priority)}`}>
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{ticket.priority}</span>
        </div>
      </div>
      
      <div className="mt-auto">
         <span className="text-xs text-[#94A3B8]">By {ticket.user_name || ticket.user_email?.split('@')[0] || 'Unknown'}</span>
      </div>
    </div>
  );
}