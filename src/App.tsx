import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { Ticket, TicketStatus, PriorityLevel } from './components/TicketCard';

// Mock data for demonstration
const mockTickets: Ticket[] = [
  {
    ticket_id: '1',
    user_id: 'john.doe',
    title: 'Lab PC #12 not booting',
    description: 'The computer in station 12 shows a black screen when powered on. Tried restarting multiple times but the issue persists.',
    status: 'Open',
    priority: 'High',
    created_at: '2025-12-05T10:30:00Z'
  },
  {
    ticket_id: '2',
    user_id: 'jane.smith',
    title: 'Printer out of toner',
    description: 'The main printer is running low on toner and prints are coming out very faint.',
    status: 'Processing',
    priority: 'Medium',
    created_at: '2025-12-04T14:20:00Z'
  },
  {
    ticket_id: '3',
    user_id: 'mike.chen',
    title: 'Network connection issue',
    description: 'Unable to connect to the lab network. Other students are experiencing the same problem.',
    status: 'Closed',
    priority: 'High',
    created_at: '2025-12-03T09:15:00Z'
  },
  {
    ticket_id: '4',
    user_id: 'sarah.williams',
    title: 'Software installation request',
    description: 'Need MATLAB R2024a installed on workstation 5 for upcoming project work.',
    status: 'Open',
    priority: 'Low',
    created_at: '2025-12-05T16:45:00Z'
  },
  {
    ticket_id: '5',
    user_id: 'david.lee',
    title: 'Mouse not working',
    description: 'The wireless mouse at station 8 is not responding. Checked batteries and they seem fine.',
    status: 'Processing',
    priority: 'Low',
    created_at: '2025-12-04T11:00:00Z'
  }
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);

  const handleLogin = (email: string, _password: string) => {
    // Mock login - in production this would call AWS Cognito
    console.log('Login attempt:', email);
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
  };

  const handleCreateTicket = (newTicket: { title: string; description: string; priority: string }) => {
    const ticket: Ticket = {
      ticket_id: Date.now().toString(),
      user_id: userEmail.split('@')[0],
      title: newTicket.title,
      description: newTicket.description,
      status: 'Open' as TicketStatus,
      priority: newTicket.priority as PriorityLevel,
      created_at: new Date().toISOString()
    };
    
    setTickets([ticket, ...tickets]);
  };

  const handleUpdateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(tickets.map(ticket => 
      ticket.ticket_id === ticketId ? { ...ticket, status: newStatus } : ticket
    ));
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Dashboard
      tickets={tickets}
      onCreateTicket={handleCreateTicket}
      onUpdateTicketStatus={handleUpdateTicketStatus}
      onLogout={handleLogout}
      userEmail={userEmail}
    />
  );
}

export default App;