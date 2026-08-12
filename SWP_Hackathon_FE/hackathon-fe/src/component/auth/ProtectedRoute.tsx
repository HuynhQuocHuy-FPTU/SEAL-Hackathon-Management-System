import type React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../hook/useAuthContext';

interface ProtectedRouteProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
    const { user } = useAuthContext();
    const location = useLocation();
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const normalizedRole = user.role ? user.role.toUpperCase() : '';

    if (normalizedRole && !allowedRoles.includes(normalizedRole)) {
        return <Navigate to="/unauthorized" replace />;
    }
    return <>{children}</>;
}
