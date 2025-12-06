import { X, AlertCircle, User, Calendar, Trash2, CheckCircle, PlayCircle, StopCircle } from 'lucide-react';
import { Ticket, TicketStatus, PriorityLevel } from './TicketCard';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  currentUserEmail?: string;
  isAdmin?: boolean;
  onStatusChange?: (ticketId: string, newStatus: TicketStatus) => void;
  onDelete?: (ticketId: string) => void;
}

export function TicketDetailModal({ 
  isOpen, 
  onClose, 
  ticket, 
  currentUserEmail,
  isAdmin = false,
  onStatusChange,
  onDelete 
}: TicketDetailModalProps) {
  if (!isOpen || !ticket) return null;
  
  const isOwner = currentUserEmail === ticket.user_email;
  const canDelete = isAdmin || isOwner;

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

  const getPriorityStyle = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Low':
        return 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]';
      case 'Medium':
        return 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]';
      case 'High':
        return 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4 py-8" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-[90vw] sm:w-[600px] md:w-[700px] lg:w-[800px] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-[#E2E8F0] px-6 py-5 rounded-t-2xl">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs border ${getStatusStyle(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs border ${getPriorityStyle(ticket.priority)}`}>
                  {ticket.priority} Priority
                </span>
              </div>
              <h2 className="text-[#1E293B]">{ticket.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#F1F5F9] transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-[#64748B]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-6">
          
          {/* --- Admin / Owner Operations --- */}
          {(isAdmin || canDelete) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                {/* Status Change (Admin Only) */}
                {isAdmin && (
                  <>
                    <button 
                      onClick={() => onStatusChange?.(ticket.ticket_id, 'Open')}
                      disabled={ticket.status === 'Open'}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      <StopCircle className="w-4 h-4 text-yellow-600" /> Open
                    </button>
                    <button 
                      onClick={() => onStatusChange?.(ticket.ticket_id, 'Processing')}
                      disabled={ticket.status === 'Processing'}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      <PlayCircle className="w-4 h-4 text-blue-600" /> Processing
                    </button>
                    <button 
                      onClick={() => onStatusChange?.(ticket.ticket_id, 'Closed')}
                      disabled={ticket.status === 'Closed'}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" /> Closed
                    </button>
                  </>
                )}
                
                <div className="flex-1"></div>
                
                {/* Delete (Admin or Owner) */}
                {canDelete && (
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this ticket?')) {
                        onDelete?.(ticket.ticket_id);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-[#F8FAFC] rounded-xl">
              <div className="w-11 h-11 bg-[#DBEAFE] rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-[#64748B] mb-1">Created Date</div>
                <div className="text-sm text-[#1E293B]">{formatDate(ticket.created_at)}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#F8FAFC] rounded-xl">
              <div className="w-11 h-11 bg-[#FEF3C7] rounded-lg flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-[#64748B] mb-1">Priority</div>
                <div className="text-sm text-[#1E293B]">{ticket.priority}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[#F8FAFC] rounded-xl md:col-span-3 lg:col-span-1">
              <div className="w-11 h-11 bg-[#E0E7FF] rounded-lg flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-[#64748B] mb-1">Created By</div>
                <div className="text-sm font-medium text-[#1E293B]">
                  {ticket.user_name || ticket.user_email?.split('@')[0] || 'Unknown User'}
                </div>
                {ticket.user_name && ticket.user_email && (
                  <div className="text-xs text-[#64748B] mt-0.5">{ticket.user_email}</div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
            <div className="bg-[#F8FAFC] px-5 py-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-semibold text-[#475569]">Description</h3>
            </div>
            <div className="p-5">
              <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">
                {ticket.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Ticket ID */}
          <div className="pt-4 border-t border-[#E2E8F0]">
            <div className="text-xs text-[#94A3B8]">Ticket ID: #{ticket.ticket_id}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F8FAFC] border-t border-[#E2E8F0] px-6 py-5 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
