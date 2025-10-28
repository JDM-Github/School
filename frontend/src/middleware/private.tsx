import React from "react";
import { Route, Routes } from "react-router-dom";
import { useAuth } from "../context/auth.tsx";
import Login from "../routes/login.tsx";

interface PrivateRouteProps {
	children: React.ReactNode;
}
export default function PrivateRoute({ children }: PrivateRouteProps) {
    const { isLoggedIn, isLoading } = useAuth();
    if (isLoading) {
		return <div className="p-4">Loading...</div>;
	}
	if (!isLoggedIn)
		return (
			<Routes>
				<Route path="/" element={<Login />} />
			</Routes>
		);
	return children;
}
