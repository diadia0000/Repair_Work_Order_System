import { useState } from 'react';
import { Plus, LogOut, User, Filter } from 'lucide-react';
import { TicketCard, Ticket, TicketStatus } from './TicketCard';
import { CreateTicketModal } from './CreateTicketModal';
import { TicketDetailModal } from './TicketDetailModal';

interface DashboardProps {
  tickets: Ticket[];
  onCreateTicket: (ticket: { title: string; description: string; priority: string; images?: File[] }) => void;
  onUpdateTicketStatus: (ticketId: string, newStatus: TicketStatus) => void;
  onDeleteTicket: (ticketId: string) => void;
  onLogout: () => void;
  userEmail: string;
  isAdmin?: boolean;
}

export function Dashboard({ tickets, onCreateTicket, onUpdateTicketStatus, onDeleteTicket, onLogout, userEmail, isAdmin = false }: DashboardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'All'>('All');

  const filteredTickets = filterStatus === 'All' 
    ? tickets 
    : tickets.filter(t => t.status === filterStatus);

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    processing: tickets.filter(t => t.status === 'Processing').length,
    closed: tickets.filter(t => t.status === 'Closed').length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="hidden sm:block min-w-0">
                <h4 className="text-[#1E293B]">Lab Service Portal</h4>
                <small className="text-[#64748B]">Ticket Management</small>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Ticket</span>
              </button>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 hover:bg-[#F1F5F9] rounded-lg transition-colors">
                  <div className="w-8 h-8 bg-[#DBEAFE] rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <span className="hidden lg:inline text-[#334155] max-w-[120px] truncate">{userEmail.split('@')[0]}</span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#E2E8F0] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-3 border-b border-[#E2E8F0]">
                    <small className="text-[#64748B]">Signed in as</small>
                    <p className="text-[#334155] truncate">{userEmail}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-[#EF4444] hover:bg-[#FEF2F2] transition-colors rounded-b-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-5">
            <small className="text-[#64748B]">Total Tickets</small>
            <h2 className="text-[#1E293B] mt-1">{stats.total}</h2>
          </div>
          <div className="card p-5 border-l-4 border-[#F59E0B]">
            <small className="text-[#64748B]">Open</small>
            <h2 className="text-[#F59E0B] mt-1">{stats.open}</h2>
          </div>
          <div className="card p-5 border-l-4 border-[#2563EB]">
            <small className="text-[#64748B]">Processing</small>
            <h2 className="text-[#2563EB] mt-1">{stats.processing}</h2>
          </div>
          <div className="card p-5 border-l-4 border-[#10B981]">
            <small className="text-[#64748B]">Closed</small>
            <h2 className="text-[#10B981] mt-1">{stats.closed}</h2>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#1E293B]">All Tickets</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-[#64748B]" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TicketStatus | 'All')}
              className="px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="Processing">Processing</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-[#64748B] mb-2">No tickets found</h3>
            <p className="text-[#94A3B8]">
              {filterStatus === 'All' 
                ? 'Create your first ticket to get started' 
                : `No tickets with status "${filterStatus}"`}
            </p>
            {filterStatus === 'All' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-6 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create New Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTickets.map((ticket) => (
              <TicketCard 
                key={ticket.ticket_id} 
                ticket={ticket} 
                onClick={() => setSelectedTicket(ticket)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={onCreateTicket}
      />

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
        currentUserEmail={userEmail}
        isAdmin={isAdmin}
        onStatusChange={onUpdateTicketStatus}
        onDelete={onDeleteTicket}
      />
    </div>
  );
}