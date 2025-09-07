import { useState } from 'react';
import { X, Users, Mail, UserPlus, Send } from 'lucide-react';

interface Friend {
  id: number;
  email: string;
  name?: string;
  created_at: string;
}

interface FriendInvitation {
  id: number;
  recipient_email: string;
  is_accepted: boolean;
  is_expired: boolean;
  created_at: string;
}

interface FriendsModalProps {
  onClose: () => void;
}

export default function FriendsModal({ onClose }: FriendsModalProps) {
  const [activeTab, setActiveTab] = useState<'friends' | 'invitations' | 'invite'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [invitations, setInvitations] = useState<FriendInvitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/friends');
      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/friend-invitations');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setInviteLoading(true);
      const response = await fetch('/api/friend-invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_email: inviteEmail.trim() }),
      });

      if (response.ok) {
        setInviteEmail('');
        alert('Invitation sent successfully!');
        fetchInvitations();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Failed to send invitation:', error);
      alert('Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleTabChange = (tab: 'friends' | 'invitations' | 'invite') => {
    setActiveTab(tab);
    if (tab === 'friends') fetchFriends();
    if (tab === 'invitations') fetchInvitations();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Friends</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('friends')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'friends'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Friends ({friends.length})
          </button>
          <button
            onClick={() => handleTabChange('invitations')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'invitations'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Sent Invitations ({invitations.length})
          </button>
          <button
            onClick={() => handleTabChange('invite')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'invite'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Invite Friend
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Loading friends...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No friends yet</h3>
                  <p className="text-gray-600 mb-4">Invite friends to connect and share food tracking tips!</p>
                  <button
                    onClick={() => setActiveTab('invite')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Invite Your First Friend
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{friend.name || friend.email}</p>
                          {friend.name && (
                            <p className="text-sm text-gray-600">{friend.email}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Friends since {new Date(friend.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Invitations Tab */}
          {activeTab === 'invitations' && (
            <div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Loading invitations...</p>
                </div>
              ) : invitations.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations sent</h3>
                  <p className="text-gray-600 mb-4">Start building your food tracking community!</p>
                  <button
                    onClick={() => setActiveTab('invite')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Send Your First Invitation
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{invitation.recipient_email}</p>
                          <p className="text-xs text-gray-500">
                            Sent {new Date(invitation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invitation.is_accepted 
                            ? 'bg-green-100 text-green-800'
                            : invitation.is_expired
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invitation.is_accepted ? 'Accepted' : invitation.is_expired ? 'Expired' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Invite Tab */}
          {activeTab === 'invite' && (
            <div>
              <form onSubmit={sendInvitation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Friend's Email Address
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="friend@example.com"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={inviteLoading || !inviteEmail.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {inviteLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Send
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 mb-1">How it works</p>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• Your friend will receive an email invitation</p>
                        <p>• They can click the link to accept and join leftknovers</p>
                        <p>• You'll both be connected as friends</p>
                        <p>• Invitations expire after 7 days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
