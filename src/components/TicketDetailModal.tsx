import { useState } from 'react';
import { X, AlertCircle, User, Calendar, Trash2, CheckCircle, PlayCircle, StopCircle, Image as ImageIcon } from 'lucide-react';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      // 使用本地時間格式 YYYY-MM-DD
      return new Date(isoString).toLocaleDateString('en-CA');
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
        <div className="bg-white px-8 pt-8 pb-4 rounded-t-2xl">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityStyle(ticket.priority)}`}>
                  {ticket.priority} Priority
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#1E293B]">{ticket.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F1F5F9] transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-[#64748B]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 space-y-8">
          
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
            <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
              <div className="w-10 h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center shrink-0 text-[#2563EB]">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-[#64748B] mb-0.5">Created Date</div>
                <div className="text-sm font-medium text-[#1E293B]">{formatDate(ticket.created_at)}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
              <div className="w-10 h-10 bg-[#FEF3C7] rounded-lg flex items-center justify-center shrink-0 text-[#F59E0B]">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-[#64748B] mb-0.5">Urgency</div>
                <div className="text-sm font-medium text-[#1E293B]">{ticket.priority}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
              <div className="w-10 h-10 bg-[#E0E7FF] rounded-lg flex items-center justify-center shrink-0 text-[#4F46E5]">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-[#64748B] mb-0.5">Created By</div>
                <div className="text-sm font-medium text-[#1E293B] truncate">
                  {ticket.user_name || ticket.user_email?.split('@')[0] || 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-[#1E293B] mb-3">Description</h3>
            <div className="bg-[#F8FAFC] p-6 rounded-xl border border-[#F1F5F9]">
              <p className="text-[#334155] leading-relaxed whitespace-pre-wrap">
                {ticket.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Images */}
          {ticket.images && ticket.images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#1E293B] mb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Attached Images ({ticket.images.length})
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {ticket.images.map((image, index) => (
                  <div 
                    key={index} 
                    className="relative rounded-xl overflow-hidden border border-[#E2E8F0] bg-black group cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img 
                      src={image} 
                      alt={`Attachment ${index + 1}`} 
                      className="w-full h-auto max-h-[400px] object-contain mx-auto transition-opacity group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <span className="bg-white text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        Click to view full size
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ticket ID */}
          <div className="pt-4 border-t border-[#E2E8F0]">
            <div className="text-xs text-[#94A3B8]">Ticket ID: #{ticket.ticket_id}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#E2E8F0]">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>

      {/* Lightbox Overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={selectedImage} 
            alt="Full size preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
