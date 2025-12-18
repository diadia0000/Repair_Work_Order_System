import { useState, useEffect } from 'react';
import { Plus, LogOut, User, Filter, Search, X, RefreshCw, ArrowUpDown, LayoutGrid, List, Clock, TrendingUp, Tag } from 'lucide-react';
import { TicketCard, Ticket, TicketStatus, PriorityLevel, TicketTagId, TICKET_TAGS } from './TicketCard';
import { CreateTicketModal } from './CreateTicketModal';
import { TicketDetailModal } from './TicketDetailModal';

type SortOption = 'newest' | 'oldest' | 'priority' | 'title';
type ViewMode = 'grid' | 'list';

interface DashboardProps {
  tickets: Ticket[];
  onCreateTicket: (ticket: { title: string; description: string; priority: string; images?: File[]; tags?: TicketTagId[] }) => void;
  onUpdateTicketStatus: (ticketId: string, newStatus: TicketStatus) => void;
  onDeleteTicket: (ticketId: string) => void;
  onEditTicket?: (ticketId: string, updates: { title?: string; description?: string; images?: string[]; priority?: PriorityLevel; tags?: TicketTagId[] }, newImageFiles?: File[]) => Promise<void>;
  onLogout: () => void;
  onRefresh?: () => void;
  userEmail: string;
  isAdmin?: boolean;
}

export function Dashboard({ tickets, onCreateTicket, onUpdateTicketStatus, onDeleteTicket, onEditTicket, onLogout, onRefresh, userEmail, isAdmin = false }: DashboardProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'All'>('All');
  const [filterTag, setFilterTag] = useState<TicketTagId | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // 當 tickets 更新時，同步更新 selectedTicket
  useEffect(() => {
    if (selectedTicket) {
      const updatedTicket = tickets.find(t => t.ticket_id === selectedTicket.ticket_id);
      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }
    }
  }, [tickets]);

  // 排序函數
  const sortTickets = (ticketList: Ticket[]): Ticket[] => {
    const priorityOrder: Record<PriorityLevel, number> = { 'High': 0, 'Medium': 1, 'Low': 2 };

    return [...ticketList].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'priority':
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  // 搜尋和篩選邏輯
  const filteredAndSortedTickets = sortTickets(tickets.filter(t => {
    // 狀態篩選
    const statusMatch = filterStatus === 'All' || t.status === filterStatus;

    // Tag 篩選
    const tagMatch = filterTag === 'All' || (t.tags && t.tags.includes(filterTag));

    // 搜尋篩選（標題、描述、建立者、Ticket ID）
    const query = searchQuery.toLowerCase().trim();
    const searchMatch = !query ||
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      (t.user_name?.toLowerCase().includes(query)) ||
      (t.user_email?.toLowerCase().includes(query)) ||
      t.ticket_id.toLowerCase().includes(query);

    return statusMatch && tagMatch && searchMatch;
  }));

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    processing: tickets.filter(t => t.status === 'Processing').length,
    closed: tickets.filter(t => t.status === 'Closed').length,
  };

  // 計算每個 Tag 的數量
  const tagStats = TICKET_TAGS.map(tag => ({
    ...tag,
    count: tickets.filter(t => t.tags && t.tags.includes(tag.id)).length
  }));

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterStatus('All');
    setFilterTag('All');
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
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards - 可點擊進行快速篩選 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => setFilterStatus('All')}
            className={`relative overflow-hidden bg-white rounded-xl p-3 sm:p-5 text-left transition-all hover:shadow-lg border ${filterStatus === 'All' ? 'ring-2 ring-[#2563EB] border-[#2563EB]' : 'border-[#E2E8F0]'}`}
          >
            <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-[#2563EB]/10 to-transparent rounded-bl-full"></div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-[#64748B] text-xs sm:text-sm">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-[#1E293B]">{stats.total}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setFilterStatus('Open')}
            className={`relative overflow-hidden bg-white rounded-xl p-3 sm:p-5 text-left transition-all hover:shadow-lg border ${filterStatus === 'Open' ? 'ring-2 ring-[#F59E0B] border-[#F59E0B]' : 'border-[#E2E8F0]'}`}
          >
            <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-[#F59E0B]/10 to-transparent rounded-bl-full"></div>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F59E0B]"></div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-[#64748B] text-xs sm:text-sm">Open</p>
                <p className="text-xl sm:text-2xl font-bold text-[#F59E0B]">{stats.open}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setFilterStatus('Processing')}
            className={`relative overflow-hidden bg-white rounded-xl p-3 sm:p-5 text-left transition-all hover:shadow-lg border ${filterStatus === 'Processing' ? 'ring-2 ring-[#2563EB] border-[#2563EB]' : 'border-[#E2E8F0]'}`}
          >
            <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-[#2563EB]/10 to-transparent rounded-bl-full"></div>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]"></div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="text-[#64748B] text-xs sm:text-sm hidden sm:block">Processing</p>
                <p className="text-[#64748B] text-xs sm:hidden">Process</p>
                <p className="text-xl sm:text-2xl font-bold text-[#2563EB]">{stats.processing}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setFilterStatus('Closed')}
            className={`relative overflow-hidden bg-white rounded-xl p-3 sm:p-5 text-left transition-all hover:shadow-lg border ${filterStatus === 'Closed' ? 'ring-2 ring-[#10B981] border-[#10B981]' : 'border-[#E2E8F0]'}`}
          >
            <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-[#10B981]/10 to-transparent rounded-bl-full"></div>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10B981]"></div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-[#64748B] text-xs sm:text-sm">Closed</p>
                <p className="text-xl sm:text-2xl font-bold text-[#10B981]">{stats.closed}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-3 sm:p-4 mb-6 shadow-sm">
          <div className="flex flex-col gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, ID, or creator..."
                className="w-full pl-10 pr-10 py-2.5 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all bg-[#F8FAFC] text-sm"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8] hover:text-[#64748B] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Filter, Sort and View Options */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] shrink-0">
                <Filter className="w-3.5 h-3.5 text-[#64748B]" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as TicketStatus | 'All')}
                  className="bg-transparent focus:outline-none text-xs cursor-pointer text-[#334155]"
                >
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="Processing">Processing</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Tag Filter */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] shrink-0">
                <Tag className="w-3.5 h-3.5 text-[#64748B]" />
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value as TicketTagId | 'All')}
                  className="bg-transparent focus:outline-none text-xs cursor-pointer text-[#334155]"
                >
                  <option value="All">All Tags</option>
                  {TICKET_TAGS.map(tag => (
                    <option key={tag.id} value={tag.id}>
                      {tag.label} ({tagStats.find(t => t.id === tag.id)?.count || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent focus:outline-none text-xs cursor-pointer text-[#334155]"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] p-0.5 shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-[#64748B] hover:text-[#334155]'}`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#2563EB]' : 'text-[#64748B] hover:text-[#334155]'}`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg hover:bg-[#F1F5F9] transition-colors disabled:opacity-50"
                  title="Refresh tickets"
                >
                  <RefreshCw className={`w-4 h-4 text-[#64748B] ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || filterStatus !== 'All' || filterTag !== 'All') && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E2E8F0] flex-wrap">
              <span className="text-sm text-[#64748B]">Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#DBEAFE] text-[#2563EB] rounded-full text-xs font-medium">
                  "{searchQuery}"
                  <button onClick={clearSearch} className="hover:text-[#1D4ED8]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterStatus !== 'All' && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  filterStatus === 'Open' ? 'bg-[#FEF3C7] text-[#92400E]' :
                  filterStatus === 'Processing' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                  'bg-[#D1FAE5] text-[#065F46]'
                }`}>
                  {filterStatus}
                  <button onClick={() => setFilterStatus('All')} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterTag !== 'All' && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  TICKET_TAGS.find(t => t.id === filterTag)?.color || 'bg-gray-100 text-gray-700'
                }`}>
                  <Tag className="w-3 h-3" />
                  {TICKET_TAGS.find(t => t.id === filterTag)?.label}
                  <button onClick={() => setFilterTag('All')} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#EF4444] hover:underline ml-auto"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1E293B]">
              {searchQuery || filterStatus !== 'All' ? 'Search Results' : 'All Tickets'}
            </h2>
            <p className="text-sm text-[#64748B]">
              {filteredAndSortedTickets.length} ticket{filteredAndSortedTickets.length !== 1 ? 's' : ''}
              {sortBy !== 'newest' && ` • Sorted by ${sortBy === 'oldest' ? 'oldest' : sortBy === 'priority' ? 'priority' : 'title'}`}
            </p>
          </div>
        </div>

        {/* Tickets Grid/List */}
        {filteredAndSortedTickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] rounded-full mx-auto mb-6 flex items-center justify-center">
              {searchQuery ? (
                <Search className="w-10 h-10 text-[#94A3B8]" />
              ) : (
                <svg className="w-10 h-10 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-semibold text-[#334155] mb-2">
              {searchQuery
                ? 'No matching tickets'
                : filterStatus !== 'All' || filterTag !== 'All'
                  ? 'No tickets match your filters'
                  : 'No tickets yet'
              }
            </h3>
            <p className="text-[#64748B] mb-6 max-w-md mx-auto">
              {searchQuery
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                : filterStatus !== 'All' || filterTag !== 'All'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by creating your first ticket. It only takes a moment!'
              }
            </p>
            {!searchQuery && filterStatus === 'All' && filterTag === 'All' ? (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white rounded-xl transition-all inline-flex items-center gap-2 shadow-lg shadow-blue-500/25"
              >
                <Plus className="w-5 h-5" />
                Create Your First Ticket
              </button>
            ) : (
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#64748B] rounded-xl transition-all"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAndSortedTickets.map((ticket) => (
              <TicketCard
                key={ticket.ticket_id} 
                ticket={ticket} 
                onClick={() => setSelectedTicket(ticket)}
              />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-medium text-[#64748B] uppercase tracking-wider">
              <div className="col-span-4">Title</div>
              <div className="col-span-2">Tags</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Priority</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-1">By</div>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {filteredAndSortedTickets.map((ticket) => (
                <button
                  key={ticket.ticket_id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-[#F8FAFC] transition-colors text-left group"
                >
                  <div className="sm:col-span-4 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{
                      backgroundColor: ticket.status === 'Open' ? '#F59E0B' :
                                       ticket.status === 'Processing' ? '#2563EB' : '#10B981'
                    }}></div>
                    <span className="font-medium text-[#1E293B] truncate group-hover:text-[#2563EB] transition-colors">
                      {ticket.title}
                    </span>
                    {ticket.images && ticket.images.length > 0 && (
                      <span className="shrink-0 text-xs text-[#2563EB] bg-[#EFF6FF] px-1.5 py-0.5 rounded">
                        📷 {ticket.images.length}
                      </span>
                    )}
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-1 flex-wrap">
                    {ticket.tags && ticket.tags.length > 0 ? (
                      <>
                        {ticket.tags.slice(0, 2).map(tagId => {
                          const tagInfo = TICKET_TAGS.find(t => t.id === tagId);
                          if (!tagInfo) return null;
                          return (
                            <span key={tagId} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${tagInfo.color}`}>
                              {tagInfo.label}
                            </span>
                          );
                        })}
                        {ticket.tags.length > 2 && (
                          <span className="text-[10px] text-[#64748B]">+{ticket.tags.length - 2}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-[#94A3B8]">-</span>
                    )}
                  </div>
                  <div className="sm:col-span-1 flex items-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      ticket.status === 'Open' ? 'bg-[#FEF3C7] text-[#92400E]' :
                      ticket.status === 'Processing' ? 'bg-[#DBEAFE] text-[#1E40AF]' :
                      'bg-[#D1FAE5] text-[#065F46]'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="sm:col-span-2 flex items-center">
                    <span className={`text-sm ${
                      ticket.priority === 'High' ? 'text-[#EF4444]' :
                      ticket.priority === 'Medium' ? 'text-[#F59E0B]' :
                      'text-[#64748B]'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <div className="sm:col-span-2 text-sm text-[#64748B]">
                    {new Date(ticket.created_at).toLocaleDateString('en-CA')}
                  </div>
                  <div className="sm:col-span-1 text-sm text-[#64748B] truncate">
                    {ticket.user_name || ticket.user_email?.split('@')[0] || 'Unknown'}
                  </div>
                </button>
              ))}
            </div>
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
        onEdit={onEditTicket}
      />
    </div>
  );
}