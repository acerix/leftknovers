import { useAuth } from "@getmocha/users-service/react";
import { Navigate } from "react-router";
import { useEffect, useState } from "react";
import { Leaf, CheckCircle, XCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const { exchangeCodeForSessionToken, user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleAuth = async () => {
      try {
        await exchangeCodeForSessionToken();
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleAuth();
  }, [exchangeCodeForSessionToken]);

  // If user is authenticated, redirect to home
  if (user && status === 'success') {
    return <Navigate to="/" replace />;
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
              <p className="text-gray-600">Please wait while we set up your account</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to leftknovers!</h2>
              <p className="text-gray-600">Successfully signed in. Redirecting...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in failed</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.href = '/login'}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Try again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
