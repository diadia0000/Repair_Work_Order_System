import { useState, useRef } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { PriorityLevel } from './TicketCard';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticket: { title: string; description: string; priority: PriorityLevel; images: File[] }) => void;
}

export function CreateTicketModal({ isOpen, onClose, onSubmit }: CreateTicketModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, priority, images });
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setImages([]);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      );
      setImages(prev => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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

          {/* Attach Images */}
          <div>
            <label className="block mb-2 text-[#334155]">
              Attach Images <span className="text-[#64748B] font-normal">(Optional)</span>
            </label>
            <div 
              className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-8 text-center hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept="image/png, image/jpeg, image/gif"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-[#EFF6FF] rounded-full text-[#2563EB] mb-2 group-hover:bg-[#DBEAFE] transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-[#334155]">
                  Drag and drop images here, or <span className="text-[#2563EB]">browse</span>
                </p>
                <p className="text-sm text-[#64748B]">
                  PNG, JPG, GIF up to 5MB (Max 5 images)
                </p>
              </div>
            </div>

            {/* Image Preview List */}
            {images.length > 0 && (
              <div className="mt-4 space-y-2">
                {images.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#E2E8F0] rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#334155] truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-[#64748B]">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Urgency Level */}
          <div>
            <label htmlFor="priority" className="block mb-2 text-[#334155]">
              Urgency Level <span className="text-[#EF4444]">*</span>
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