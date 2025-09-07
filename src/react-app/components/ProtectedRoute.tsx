import { useAuth } from "@getmocha/users-service/react";
import { Navigate } from "react-router";
import { Leaf } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="animate-spin">
          <Leaf className="w-10 h-10 text-green-600" />
        </div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
