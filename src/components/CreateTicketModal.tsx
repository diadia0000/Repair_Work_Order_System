import { useState } from 'react';
import { X } from 'lucide-react';
import { PriorityLevel } from './TicketCard';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: { title: string; description: string; priority: PriorityLevel }) => void;
}

export function CreateTicketModal({ isOpen, onClose, onSubmit }: CreateTicketModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, priority });
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('Medium');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative card w-full max-w-2xl min-w-[360px] max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <h2 className="flex-1">Create New Ticket</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Title */}
          <div>
            <label htmlFor="title" className="block mb-2 text-[#334155]">
              Issue Title <span className="text-[#EF4444]">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
              placeholder="e.g., PC not working"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block mb-2 text-[#334155]">
              Description <span className="text-[#EF4444]">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none"
              placeholder="Please describe the issue in detail..."
              required
            />
            <small className="text-[#64748B] mt-2 block">
              Be as specific as possible to help us resolve the issue faster
            </small>
          </div>

          {/* Priority Level */}
          <div>
            <label htmlFor="priority" className="block mb-2 text-[#334155]">
              Priority Level <span className="text-[#EF4444]">*</span>
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all bg-white"
              required
            >
              <option value="Low">Low - Can wait a few days</option>
              <option value="Medium">Medium - Should be addressed soon</option>
              <option value="High">High - Urgent, blocking work</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-[#E2E8F0] text-[#64748B] rounded-lg hover:bg-[#F8FAFC] transition-all order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg transition-all shadow-sm hover:shadow-md order-1 sm:order-2"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}