import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import Cookies from "js-cookie";

interface AuthContextType {
	isLoggedIn: boolean;
	isLoading: boolean;
	role: "admin" | "teacher" | null;
	user: User | null;
	login: (token: string | null, user: any) => void;
	logout: () => void;
}

interface User {
	id: number;
	name: string;
	email: string;
	sex?: string;
	role: "admin" | "teacher";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [role, setRole] = useState<"admin" | "teacher" | null>(null);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const token = Cookies.get("token");
		const storedUser = localStorage.getItem("user");

		if (token && storedUser) {
			const parsedUser = JSON.parse(storedUser);
			setUser(parsedUser);
			setRole(parsedUser.role || null);
			setIsLoggedIn(true);
		}
		setIsLoading(false);
	}, []);

	const login = (token: string | null, user: any) => {
		localStorage.setItem("user", JSON.stringify(user));
		if (token) Cookies.set("token", token, { expires: 1 / 12 });
		setUser(user);
		setRole(user.role || null);
		setIsLoggedIn(true);
	};

	const logout = () => {
		Cookies.remove("token");
		localStorage.removeItem("user");
		setUser(null);
		setRole(null);
		setIsLoggedIn(false);
	};

	return (
		<AuthContext.Provider value={{ isLoggedIn, isLoading, role, user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within an AuthProvider");
	return context;
}
