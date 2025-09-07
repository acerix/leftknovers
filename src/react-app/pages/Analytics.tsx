import { useState, useEffect } from 'react';
import { useAuth } from '@getmocha/users-service/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Filter, TrendingUp, Edit3, Check, X, Save, Apple } from 'lucide-react';
import Navigation from '@/react-app/components/Navigation';

interface AnalyticsData {
  totalItems: number;
  eatenBeforeExpiry: number;
  expired: number;
  wastePercentage: number;
  monthlyData: Array<{
    month: string;
    eaten: number;
    expired: number;
  }>;
  categoryData: Array<{
    category: string;
    eaten: number;
    expired: number;
  }>;
}

interface FoodItemLog {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  storage_location: string | null;
  created_at: string;
  expiration_date: string;
  is_consumed: boolean;
  is_expired: boolean;
  notes: string | null;
}

export default function Analytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [foodLog, setFoodLog] = useState<FoodItemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState<string>('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const [analyticsResponse, logResponse] = await Promise.all([
        fetch(`/api/analytics?${params}`),
        fetch(`/api/food-items/log?${params}`)
      ]);
      
      if (analyticsResponse.ok && logResponse.ok) {
        const analytics = await analyticsResponse.json();
        const log = await logResponse.json();
        setAnalyticsData(analytics);
        setFoodLog(log);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, selectedMonth, selectedCategory]);

  const updateItemStatus = async (itemId: number, isConsumed: boolean, isExpired: boolean) => {
    try {
      const response = await fetch(`/api/food-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_consumed: isConsumed,
          is_expired: isExpired
        }),
      });
      
      if (response.ok) {
        fetchAnalytics(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to update item status:', error);
    }
  };

  const updateItemNotes = async (itemId: number, notes: string) => {
    try {
      const response = await fetch(`/api/food-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      
      if (response.ok) {
        setEditingItem(null);
        setEditNotes('');
        fetchAnalytics(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to update item notes:', error);
    }
  };

  const getStatusColor = (item: FoodItemLog) => {
    if (item.is_consumed) return 'text-green-600 bg-green-50';
    if (item.is_expired) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusText = (item: FoodItemLog) => {
    if (item.is_consumed) return 'Eaten';
    if (item.is_expired) return 'Expired';
    return 'Active';
  };

  const pieData = analyticsData ? [
    { name: 'Eaten Before Expiry', value: analyticsData.eatenBeforeExpiry, color: '#10b981' },
    { name: 'Expired', value: analyticsData.expired, color: '#ef4444' },
  ] : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="animate-spin">
          <TrendingUp className="w-10 h-10 text-green-600" />
        </div>
        <p className="mt-4 text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600">Track your food waste reduction progress</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Navigation />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All months</option>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const monthStr = date.toISOString().slice(0, 7);
                  return (
                    <option key={monthStr} value={monthStr}>
                      {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All categories</option>
                <option value="Leftovers">Leftovers</option>
                <option value="Dairy">Dairy</option>
                <option value="Meat">Meat</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Bread/Bakery">Bread/Bakery</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {(selectedMonth || selectedCategory) && (
              <button
                onClick={() => {
                  setSelectedMonth('');
                  setSelectedCategory('');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        {analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Apple className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.totalItems}</p>
                  <p className="text-gray-600 text-sm">Total Items</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-900">{analyticsData.eatenBeforeExpiry}</p>
                  <p className="text-green-700 text-sm">Eaten Before Expiry</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-900">{analyticsData.expired}</p>
                  <p className="text-red-700 text-sm">Expired</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-900">{analyticsData.wastePercentage.toFixed(1)}%</p>
                  <p className="text-purple-700 text-sm">Waste Rate</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        {analyticsData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Trend Chart */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="eaten" fill="#10b981" name="Eaten" />
                  <Bar dataKey="expired" fill="#ef4444" name="Expired" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Food Log */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Food Log</h3>
            <p className="text-gray-600 text-sm">Track and edit the status of your food items</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {foodLog.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500">{item.description}</div>
                        )}
                        {item.category && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.expiration_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item)}`}>
                        {getStatusText(item)}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      {editingItem === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Add notes..."
                          />
                          <button
                            onClick={() => updateItemNotes(item.id, editNotes)}
                            className="p-1 text-green-600 hover:text-green-800"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(null);
                              setEditNotes('');
                            }}
                            className="p-1 text-gray-600 hover:text-gray-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 truncate">
                            {item.notes || 'No notes'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingItem(item.id);
                              setEditNotes(item.notes || '');
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateItemStatus(item.id, true, false)}
                          disabled={item.is_consumed}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Mark Eaten
                        </button>
                        <button
                          onClick={() => updateItemStatus(item.id, false, true)}
                          disabled={item.is_expired}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Mark Expired
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {foodLog.length === 0 && (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No data available for the selected filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
