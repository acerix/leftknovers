import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router';
import { useAuth } from '@getmocha/users-service/react';
import { CheckCircle, XCircle, Users, Leaf } from 'lucide-react';

export default function AcceptFriendPage() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'invalid'>('loading');
  const [senderEmail, setSenderEmail] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    const acceptInvitation = async () => {
      try {
        const response = await fetch(`/api/friend-invitations/${token}/accept`, {
          method: 'POST',
        });

        if (response.ok) {
          const data = await response.json();
          setSenderEmail(data.sender_email || '');
          setStatus('success');
        } else {
          const errorData = await response.json();
          if (response.status === 410) {
            setStatus('expired');
          } else if (response.status === 404) {
            setStatus('invalid');
          } else {
            setStatus('error');
            setError(errorData.error || 'Failed to accept invitation');
          }
        }
      } catch (err) {
        setStatus('error');
        setError('Network error occurred');
      }
    };

    acceptInvitation();
  }, [token]);

  // If user is not logged in, redirect to login
  if (!user && status !== 'loading') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin mx-auto mb-4">
                <Leaf className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing invitation...</h2>
              <p className="text-gray-600">Please wait while we connect you with your friend</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Friend request accepted!</h2>
              <p className="text-gray-600 mb-6">
                You're now connected with {senderEmail || 'your friend'} on leftknovers.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Go to App
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-500 justify-center">
                  <Users className="w-4 h-4" />
                  <span>Start tracking food together!</span>
                </div>
              </div>
            </>
          )}

          {status === 'expired' && (
            <>
              <XCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Invitation expired</h2>
              <p className="text-gray-600 mb-6">
                This friend invitation has expired. Please ask your friend to send a new invitation.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go to App
              </button>
            </>
          )}

          {status === 'invalid' && (
            <>
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid invitation</h2>
              <p className="text-gray-600 mb-6">
                This invitation link is not valid or may have already been used.
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go to App
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error accepting invitation</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Go to App
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
