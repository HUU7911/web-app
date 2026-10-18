import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getErrorCode, getErrorMessage } from '../api/client';
import { cartApi } from '../api/services';
import type { Cart } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { useNotify } from './NotifyContext';

interface CartValue {
	cart: Cart | null;
	loading: boolean;
	count: number;
	refresh: () => Promise<void>;
	add: (productId: string) => Promise<boolean>;
	increase: (itemId: string) => Promise<void>;
	decrease: (itemId: string) => Promise<void>;
	remove: (itemId: string) => Promise<void>;
	/** Làm mới giỏ sau khi đặt hàng và xoá nốt các món còn sót (xem ghi chú ở CartContext). */
	clearAfterOrder: () => Promise<void>;
}

const CartContext = createContext<CartValue | null>(null);

// Set<CartItem> ở backend không có thứ tự ổn định -> sắp xếp theo tên để giao diện không nhảy
const normalize = (cart: Cart): Cart => ({
	...cart,
	items: [...(cart.items ?? [])].sort((a, b) => a.productName.localeCompare(b.productName, 'vi')),
});

const CART_NOT_FOUND = 1009;

export function CartProvider({ children }: { children: ReactNode }) {
	const { isAuthenticated } = useAuth();
	const notify = useNotify();
	const [cart, setCart] = useState<Cart | null>(null);
	const [loading, setLoading] = useState(false);

	const refresh = useCallback(async () => {
		if (!isAuthenticated) {
			setCart(null);
			return;
		}
		setLoading(true);
		try {
			setCart(normalize(await cartApi.get()));
		} catch (e) {
			// Người dùng chưa có giỏ hàng = giỏ trống
			if (getErrorCode(e) === CART_NOT_FOUND) setCart(null);
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated]);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const run = useCallback(
		async (action: () => Promise<Cart>): Promise<boolean> => {
			try {
				setCart(normalize(await action()));
				return true;
			} catch (e) {
				notify(getErrorMessage(e), 'error');
				return false;
			}
		},
		[notify],
	);

	// order-service gọi DELETE /cart/clear-my-cart sau khi tạo đơn. Nếu cart-service lỗi (lỗi bị order-service nuốt)
	// thì giỏ vẫn còn món, nên ở đây xoá nốt từng món để đơn không bị đặt lặp lại.
	// Khi backend đã tự xoá giỏ, danh sách còn lại rỗng và không có request thừa nào.
	const clearAfterOrder = useCallback(async () => {
		if (!isAuthenticated) return;
		try {
			let current = normalize(await cartApi.get());
			for (const item of current.items) {
				try {
					current = normalize(await cartApi.remove(item.id));
				} catch {
					/* món đã bị xoá hoặc lỗi mạng: bỏ qua */
				}
			}
			setCart(current.items.length ? current : null);
		} catch (e) {
			if (getErrorCode(e) === CART_NOT_FOUND) setCart(null);
		}
	}, [isAuthenticated]);

	const value = useMemo<CartValue>(
		() => ({
			cart,
			loading,
			count: cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
			refresh,
			add: (id) => run(() => cartApi.add(id)),
			increase: async (id) => void (await run(() => cartApi.increase(id))),
			decrease: async (id) => void (await run(() => cartApi.decrease(id))),
			remove: async (id) => void (await run(() => cartApi.remove(id))),
			clearAfterOrder,
		}),
		[cart, loading, refresh, run, clearAfterOrder],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
	const ctx = useContext(CartContext);
	if (!ctx) throw new Error('useCart must be used inside CartProvider');
	return ctx;
}
