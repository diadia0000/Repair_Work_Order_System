import { Clock, AlertCircle } from 'lucide-react';

export type TicketStatus = 'Open' | 'Processing' | 'Closed';
export type PriorityLevel = 'Low' | 'Medium' | 'High';

export interface Ticket {
  ticket_id: string;
  user_id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: PriorityLevel;
  created_at: string;
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
    const date = new Date(isoString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div
      onClick={onClick}
      className="card card-hover p-6 cursor-pointer flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="flex-1 line-clamp-2">{ticket.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs border whitespace-nowrap shrink-0 ${getStatusStyle(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-[#64748B] line-clamp-3 mb-4 flex-1">
        {ticket.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-1 text-[#64748B]">
          <Clock className="w-4 h-4 shrink-0" />
          <small className="whitespace-nowrap">{formatDate(ticket.created_at)}</small>
        </div>
        <div className={`flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
          <AlertCircle className="w-4 h-4 shrink-0" />
          <small className="whitespace-nowrap">{ticket.priority}</small>
        </div>
      </div>

      {/* User ID */}
      <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
        <small className="text-[#94A3B8]">By {ticket.user_id}</small>
      </div>
    </div>
  );
}