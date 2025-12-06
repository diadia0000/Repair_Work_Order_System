import { useState, useEffect } from 'react';
import { signIn, signUp, signOut, getCurrentUser, fetchAuthSession, fetchUserAttributes, confirmSignIn } from 'aws-amplify/auth';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { NewPasswordPage } from './components/NewPasswordPage';
import { Dashboard } from './components/Dashboard';
import { Ticket, TicketStatus, PriorityLevel } from './components/TicketCard';
import { ticketService } from './services/ticketService';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'new-password'>('login');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check auth state on load
  useEffect(() => {
    checkUser();
  }, []);

  // Load tickets when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadTickets();
    }
  }, [isLoggedIn]);

  const checkUser = async () => {
    try {
      await getCurrentUser();
      const attributes = await fetchUserAttributes();
      const session = await fetchAuthSession();
      
      setUserEmail(attributes.email || '');
      setUserName(attributes.name || attributes.email || 'User');
      
      // Check for Admin group
      const groups = (session.tokens?.accessToken.payload['cognito:groups'] as string[]) || [];
      console.log('Current User Groups:', groups); // Debug log
      const isAdminUser = groups.includes('Admin');
      console.log('Is Admin?', isAdminUser); // Debug log
      setIsAdmin(isAdminUser);
      
      setIsLoggedIn(true);
      setView('dashboard');
    } catch (err) {
      console.log('Not logged in');
      setIsLoggedIn(false);
      setView('login');
    }
  };

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching tickets...');
      const data = await ticketService.getAllTickets();
      console.log('Loaded tickets:', data);
      setTickets(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tickets';
      setError(errorMessage);
      console.error('Error loading tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      console.log('Login attempt:', email);
      
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      
      if (isSignedIn) {
        await checkUser();
      } else {
        console.log('Login next step:', nextStep);
        if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
           setView('new-password');
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
      alert('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (newPassword: string) => {
    try {
      setIsLoading(true);
      const { isSignedIn } = await confirmSignIn({ challengeResponse: newPassword });
      
      if (isSignedIn) {
        await checkUser();
      } else {
        // Handle other scenarios if needed
        setView('login');
      }
    } catch (err) {
      console.error('Failed to set new password:', err);
      alert('Failed to set new password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });
      alert('Registration successful! Please check your email for verification code (if configured) or login.');
      setView('login');
    } catch (err) {
      console.error('Registration failed:', err);
      alert(`Registration failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      setUserEmail('');
      setUserName('');
      setIsAdmin(false);
      setTickets([]);
      setView('login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleCreateTicket = async (newTicket: { title: string; description: string; priority: string }) => {
    try {
      setError(null);
      console.log('Creating ticket:', newTicket);
      const result = await ticketService.createTicket({
        ...newTicket,
        priority: newTicket.priority as PriorityLevel,
        user_email: userEmail,
        user_name: userName,
      });
      
      console.log('Ticket created successfully:', result);
      
      // 延遲一下再重新載入，確保 DynamoDB 已寫入
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadTickets();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create ticket';
      setError(errorMessage);
      console.error('Error creating ticket:', err);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      setError(null);
      await ticketService.updateTicket(ticketId, newStatus);
      
      // 更新本地狀態
      setTickets(tickets.map(ticket => 
        ticket.ticket_id === ticketId ? { ...ticket, status: newStatus } : ticket
      ));
      
      console.log(`Ticket ${ticketId} updated to ${newStatus}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update ticket';
      setError(errorMessage);
      console.error('Error updating ticket:', err);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      setError(null);
      await ticketService.deleteTicket(ticketId);
      
      // 更新本地狀態
      setTickets(tickets.filter(ticket => ticket.ticket_id !== ticketId));
      
      console.log(`Ticket ${ticketId} deleted`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete ticket';
      setError(errorMessage);
      console.error('Error deleting ticket:', err);
    }
  };

  if (!isLoggedIn) {
    if (view === 'register') {
      return <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setView('login')} />;
    }
    if (view === 'new-password') {
      return <NewPasswordPage onSubmit={handleNewPasswordSubmit} />;
    }
    return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 錯誤提示 */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-700 hover:text-red-900 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* 載入中狀態 */}
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tickets...</p>
          </div>
        </div>
      ) : (
        <Dashboard
          tickets={tickets}
          onCreateTicket={handleCreateTicket}
          onUpdateTicketStatus={handleUpdateTicketStatus}
          onDeleteTicket={handleDeleteTicket}
          onLogout={handleLogout}
          userEmail={userEmail}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

export default App;