import { Clock, AlertCircle, Image as ImageIcon, Tag } from 'lucide-react';

export type TicketStatus = 'Open' | 'Processing' | 'Closed';
export type PriorityLevel = 'Low' | 'Medium' | 'High';

// 預設標籤選項
export const TICKET_TAGS = [
  { id: 'hardware', label: 'Hardware', color: 'bg-purple-100 text-purple-700' },
  { id: 'software', label: 'Software', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'network', label: 'Network', color: 'bg-orange-100 text-orange-700' },
  { id: 'printer', label: 'Printer', color: 'bg-pink-100 text-pink-700' },
  { id: 'account', label: 'Account', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700' },
] as const;

export type TicketTagId = typeof TICKET_TAGS[number]['id'];

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
  tags?: TicketTagId[];
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
      className="group relative bg-white rounded-xl p-5 cursor-pointer flex flex-col h-full border border-[#E2E8F0] hover:border-[#2563EB]/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* 狀態指示條 */}
      <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${
        ticket.status === 'Open' ? 'bg-[#F59E0B]' :
        ticket.status === 'Processing' ? 'bg-[#2563EB]' :
        'bg-[#10B981]'
      }`}></div>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3 pl-3">
        <h3 className="flex-1 line-clamp-2 font-semibold text-[#1E293B] text-base group-hover:text-[#2563EB] transition-colors">
          {ticket.title}
        </h3>
        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 ${getStatusStyle(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>

      {/* Description */}
      <p className="text-[#64748B] text-sm line-clamp-2 mb-4 flex-1 leading-relaxed pl-3">
        {ticket.description || 'No description provided.'}
      </p>

      {/* Tags Row */}
      <div className="flex items-center gap-2 mb-4 pl-3 flex-wrap">
        {/* Priority Tag */}
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
          ticket.priority === 'High' ? 'bg-red-50 text-red-600' : 
          ticket.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 
          'bg-slate-50 text-slate-500'
        }`}>
          <AlertCircle className="w-3 h-3" />
          {ticket.priority}
        </div>

        {/* Category Tags */}
        {ticket.tags && ticket.tags.length > 0 && ticket.tags.slice(0, 2).map(tagId => {
          const tagInfo = TICKET_TAGS.find(t => t.id === tagId);
          if (!tagInfo) return null;
          return (
            <div key={tagId} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${tagInfo.color}`}>
              <Tag className="w-3 h-3" />
              {tagInfo.label}
            </div>
          );
        })}
        {ticket.tags && ticket.tags.length > 2 && (
          <span className="text-xs text-[#64748B]">+{ticket.tags.length - 2}</span>
        )}

        {/* Image Indicator */}
        {ticket.images && ticket.images.length > 0 && (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#EFF6FF] text-[#2563EB] rounded-md text-xs font-medium">
            <ImageIcon className="w-3 h-3" />
            {ticket.images.length}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9] pl-3">
        <div className="flex items-center gap-1.5 text-[#94A3B8]">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs">{formatDate(ticket.created_at)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-[#F1F5F9] rounded-full flex items-center justify-center">
            <span className="text-[10px] font-medium text-[#64748B]">
              {(ticket.user_name || ticket.user_email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-[#64748B] max-w-[80px] truncate">
            {ticket.user_name || ticket.user_email?.split('@')[0] || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Hover Overlay Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-[#2563EB]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
}