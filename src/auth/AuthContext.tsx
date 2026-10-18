import { connectSocket, disconnectSocket } from '../socket/socket';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AUTH_LOGOUT_EVENT, AUTH_TOKEN_EVENT, tokenStore } from '../api/client';
import { authApi, profileApi } from '../api/services';
import type { Profile } from '../api/types';
import { parseToken, TokenInfo } from './jwt';

interface AuthValue {
	token: string | null;
	info: TokenInfo | null;
	profile: Profile | null;
	isAuthenticated: boolean;
	isAdmin: boolean;
	isStaff: boolean; // STAFF hoặc ADMIN
	login: (username: string, password: string) => Promise<void>;
	loginWithToken: (token: string) => void;
	logout: () => Promise<void>;
	reloadProfile: () => Promise<void>;
	setProfile: (p: Profile) => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [token, setToken] = useState<string | null>(() => tokenStore.get());
	const [profile, setProfile] = useState<Profile | null>(null);

	const info = useMemo(() => parseToken(token), [token]);

	const applyToken = useCallback((t: string) => {
		tokenStore.set(t);
		setToken(t);
	}, []);

	const clear = useCallback(() => {
		tokenStore.clear();
		setToken(null);
		setProfile(null);
	}, []);

	const reloadProfile = useCallback(async () => {
		try {
			setProfile(await profileApi.me());
		} catch {
			/* profile chưa có hoặc lỗi mạng: bỏ qua */
		}
	}, []);

	useEffect(() => {
		const onLogout = () => clear();
		const onToken = (e: Event) => setToken((e as CustomEvent<string>).detail);
		window.addEventListener(AUTH_LOGOUT_EVENT, onLogout);
		window.addEventListener(AUTH_TOKEN_EVENT, onToken);
		return () => {
			window.removeEventListener(AUTH_LOGOUT_EVENT, onLogout);
			window.removeEventListener(AUTH_TOKEN_EVENT, onToken);
		};
	}, [clear]);

	// Có userId mới thì tải profile
	const userId = info?.userId;
	useEffect(() => {
		if (userId) void reloadProfile();
	}, [userId, reloadProfile]);

	useEffect(() => {
		if (!token) {
			disconnectSocket();
			return;
		}

		connectSocket(token);

		return () => {
			disconnectSocket();
		};
	}, [token]);

	const login = useCallback(
		async (username: string, password: string) => {
			const res = await authApi.login(username, password);
			applyToken(res.token);
		},
		[applyToken],
	);

	const logout = useCallback(async () => {
		const t = tokenStore.get();
		if (t) {
			try {
				await authApi.logout(t);
			} catch {
				/* token đã hết hạn: vẫn đăng xuất phía client */
			}
		}
		clear();
	}, [clear]);

	const value: AuthValue = {
		token,
		info,
		profile,
		isAuthenticated: !!token && !!info,
		isAdmin: !!info?.roles.includes('ADMIN'),
		isStaff: !!info && (info.roles.includes('ADMIN') || info.roles.includes('STAFF')),
		login,
		loginWithToken: applyToken,
		logout,
		reloadProfile,
		setProfile,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
	return ctx;
}
