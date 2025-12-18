import { useState, useRef, useEffect } from 'react';
import { X, AlertCircle, User, Calendar, Trash2, CheckCircle, PlayCircle, StopCircle, Image as ImageIcon, Pencil, Save, XCircle, Upload, Tag, Copy, Check } from 'lucide-react';
import { Ticket, TicketStatus, PriorityLevel, TICKET_TAGS, TicketTagId } from './TicketCard';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  currentUserEmail?: string;
  isAdmin?: boolean;
  onStatusChange?: (ticketId: string, newStatus: TicketStatus) => void;
  onDelete?: (ticketId: string) => void;
  onEdit?: (ticketId: string, updates: { title?: string; description?: string; images?: string[]; priority?: PriorityLevel; tags?: TicketTagId[] }, newImageFiles?: File[]) => Promise<void>;
}

export function TicketDetailModal({ 
  isOpen, 
  onClose, 
  ticket, 
  currentUserEmail,
  isAdmin = false,
  onStatusChange,
  onDelete,
  onEdit
}: TicketDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editPriority, setEditPriority] = useState<PriorityLevel>('Medium');
  const [editTags, setEditTags] = useState<TicketTagId[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UX: 鎖定背景捲動
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !ticket) return null;
  
  const isOwner = currentUserEmail === ticket.user_email;
  const canDelete = isAdmin || isOwner;
  const canEdit = isAdmin || isOwner;

  const handleCopyId = () => {
    navigator.clipboard.writeText(ticket.ticket_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const startEditing = () => {
    setEditTitle(ticket.title);
    setEditDescription(ticket.description);
    setEditImages(ticket.images || []);
    setEditPriority(ticket.priority);
    setEditTags(ticket.tags || []);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditDescription('');
    setEditImages([]);
    setEditPriority('Medium');
    setEditTags([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
  };

  const toggleTag = (tagId: TicketTagId) => {
    setEditTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    if (!onEdit) return;

    try {
      setIsSaving(true);
      await onEdit(
        ticket.ticket_id,
        {
          title: editTitle,
          description: editDescription,
          images: editImages,
          priority: editPriority,
          tags: editTags,
        },
        newImageFiles
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setEditImages(editImages.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 創建預覽
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImageFiles(prev => [...prev, ...files]);
    setNewImagePreviews(prev => [...prev, ...previews]);

    // 清空 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:px-4 sm:py-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:w-[600px] md:w-[700px] lg:w-[800px] max-h-[90vh] sm:max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white px-4 sm:px-8 pt-6 sm:pt-8 pb-4 rounded-t-2xl sticky top-0 z-10 border-b border-[#E2E8F0] sm:border-b-0">
          {/* Mobile drag indicator */}
          <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-4 sm:hidden"></div>
          <div className="flex items-start justify-between gap-4 sm:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${getStatusStyle(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium border ${getPriorityStyle(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value.slice(0, 100))}
                    maxLength={100}
                    className="w-full text-lg sm:text-2xl font-bold text-[#1E293B] border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Issue Title"
                  />
                  <div className="mt-1 text-right text-xs text-[#94A3B8]">
                    {editTitle.length}/100
                  </div>
                </div>
              ) : (
                <h2 className="text-lg sm:text-2xl font-bold text-[#1E293B] line-clamp-2">{ticket.title}</h2>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {canEdit && !isEditing && (
                <button
                  onClick={startEditing}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#DBEAFE] transition-colors text-[#2563EB]"
                  aria-label="Edit"
                >
                  <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
              <button
                onClick={isEditing ? cancelEditing : onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F1F5F9] transition-colors shrink-0"
                aria-label={isEditing ? "Cancel editing" : "Close"}
              >
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-8 pb-6 sm:pb-8 space-y-4 sm:space-y-6">

          {/* --- Admin / Owner Operations --- */}
          {(isAdmin || canDelete) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Actions
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {/* Status Change (Admin Only) */}
                {isAdmin && (
                  <>
                    <button 
                      onClick={() => onStatusChange?.(ticket.ticket_id, 'Open')}
                      disabled={ticket.status === 'Open'}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      <StopCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600" /> Open
                    </button>
                    <button 
                      onClick={() => onStatusChange?.(ticket.ticket_id, 'Processing')}
                      disabled={ticket.status === 'Processing'}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      <PlayCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" /> <span className="hidden sm:inline">Processing</span><span className="sm:hidden">Process</span>
                    </button>
                    <button 
                      onClick={() => onStatusChange?.(ticket.ticket_id, 'Closed')}
                      disabled={ticket.status === 'Closed'}
                      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" /> Closed
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
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Delete</span><span className="sm:hidden">Del</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#DBEAFE] rounded-lg flex items-center justify-center shrink-0 text-[#2563EB]">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="text-[10px] sm:text-xs text-[#64748B] mb-0.5">Created</div>
                <div className="text-xs sm:text-sm font-medium text-[#1E293B]">{formatDate(ticket.created_at)}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                (isEditing ? editPriority : ticket.priority) === 'High' ? 'bg-red-100 text-red-600' :
                (isEditing ? editPriority : ticket.priority) === 'Medium' ? 'bg-amber-100 text-amber-600' :
                'bg-slate-100 text-slate-500'
              }`}>
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="text-[10px] sm:text-xs text-[#64748B] mb-0.5">Urgency</div>
                {isEditing ? (
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as PriorityLevel)}
                    className="w-full text-xs sm:text-sm font-medium text-[#1E293B] bg-white border border-slate-300 rounded-md px-1 sm:px-2 py-0.5 sm:py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <div className={`text-xs sm:text-sm font-medium ${
                    ticket.priority === 'High' ? 'text-red-600' :
                    ticket.priority === 'Medium' ? 'text-amber-600' :
                    'text-slate-600'
                  }`}>{ticket.priority}</div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-[#F8FAFC] rounded-xl border border-[#F1F5F9]">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#E0E7FF] rounded-lg flex items-center justify-center shrink-0 text-[#4F46E5]">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="text-[10px] sm:text-xs text-[#64748B] mb-0.5">Created By</div>
                <div className="text-xs sm:text-sm font-medium text-[#1E293B] truncate">
                  {ticket.user_name || ticket.user_email?.split('@')[0] || 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#1E293B] mb-2 sm:mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
              Category Tags
            </h3>
            {isEditing ? (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {TICKET_TAGS.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      editTags.includes(tag.id)
                        ? `${tag.color} ring-2 ring-offset-1 ring-current`
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {ticket.tags && ticket.tags.length > 0 ? (
                  ticket.tags.map(tagId => {
                    const tagInfo = TICKET_TAGS.find(t => t.id === tagId);
                    if (!tagInfo) return null;
                    return (
                      <span key={tagId} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tagInfo.color}`}>
                        {tagInfo.label}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm text-[#94A3B8]">No tags assigned</span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-[#1E293B] mb-3">Description</h3>
            {isEditing ? (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full min-h-[150px] bg-[#F8FAFC] p-6 rounded-xl border border-slate-300 text-[#334155] leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Enter description..."
              />
            ) : (
              <div className="bg-[#F8FAFC] p-6 rounded-xl border border-[#F1F5F9]">
                <p className="text-[#334155] leading-relaxed whitespace-pre-wrap">
                  {ticket.description || 'No description provided.'}
                </p>
              </div>
            )}
          </div>

          {/* Images */}
          {isEditing ? (
            <div>
              <h3 className="text-lg font-semibold text-[#1E293B] mb-3 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Manage Images
              </h3>

              {/* Existing Images */}
              {editImages.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-slate-600 mb-2">Current Images ({editImages.length})</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {editImages.map((image, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden border border-slate-200 group">
                        <img
                          src={image}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {newImagePreviews.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-slate-600 mb-2">New Images ({newImagePreviews.length})</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden border border-blue-200 group">
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs py-1 text-center">
                          New
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors w-full justify-center"
              >
                <Upload className="w-5 h-5" />
                Add Images
              </button>
            </div>
          ) : (
            ticket.images && ticket.images.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#1E293B] mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Attached Images ({ticket.images.length})
                </h3>
                {/* Grid 佈局 - 更整潔 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {ticket.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative rounded-xl overflow-hidden border border-[#E2E8F0] bg-slate-100 group cursor-pointer aspect-square"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                        <span className="bg-white/90 text-[#2563EB] px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                          View
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Ticket ID with Copy */}
          <div className="pt-3 sm:pt-4 border-t border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs text-[#94A3B8] truncate">
                Ticket ID: #{ticket.ticket_id}
              </span>
              <button
                onClick={handleCopyId}
                className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-400 hover:text-slate-600"
                title="Copy Ticket ID"
              >
                {copiedId ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
              {copiedId && (
                <span className="text-[10px] text-green-500 animate-in fade-in duration-200">
                  Copied!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-[#E2E8F0] sticky bottom-0 bg-white">
          {isEditing ? (
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={cancelEditing}
                disabled={isSaving}
                className="flex-1 py-2.5 sm:py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 text-sm sm:text-base"
              >
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-2.5 sm:py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 text-sm sm:text-base"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Save Changes</span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 sm:py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={selectedImage} 
            alt="Full size preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
