import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import type { ApiResponse } from './types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8888/api/v1';

const TOKEN_KEY = 'shopmeal.token';

export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};


export const AUTH_LOGOUT_EVENT = 'shopmeal:auth-logout';
export const AUTH_TOKEN_EVENT = 'shopmeal:auth-token';

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

// ---- Tự refresh token khi gateway trả 401 ----
// identity-service: POST /auth/refresh {token} -> token mới (token cũ bị vô hiệu hoá).
let refreshing: Promise<string> | null = null;

function refreshToken(): Promise<string> {
  if (!refreshing) {
    const current = tokenStore.get();
    refreshing = axios
      .post<ApiResponse<{ token: string }>>(`${API_BASE_URL}/identity/auth/refresh`, { token: current })
      .then((res) => {
        const token = res.data.results?.token;
        if (!token) throw new Error('No token');
        tokenStore.set(token);
        window.dispatchEvent(new CustomEvent(AUTH_TOKEN_EVENT, { detail: token }));
        return token;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const hadToken = !!tokenStore.get();
    const isAuthCall = original?.url?.includes('/identity/auth/');

    if (error.response?.status === 401 && original && hadToken && !original._retried && !isAuthCall) {
      original._retried = true;
      try {
        const token = await refreshToken();
        original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${token}` } as never;
        return api.request(original);
      } catch {
        tokenStore.clear();
        window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
      }
    }
    return Promise.reject(error);
  },
);

/** Gọi API và lấy `results` từ ApiResponse. */
export async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await request;
  return res.data.results as T;
}

// Backend trả message tiếng Anh (ErrorCode.message của từng service). Dịch các lỗi người dùng có thể gặp.
const MESSAGE_VI: Record<string, string> = {
  Unauthenticated: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
  unauthenticated: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
  'Access denied': 'Bạn không có quyền thực hiện thao tác này.',
  'access denied': 'Bạn không có quyền thực hiện thao tác này.',
  'User not found': 'Không tìm thấy tài khoản.',
  'Invalid OTP': 'Mã OTP không đúng.',
  'OTP expired': 'Mã OTP đã hết hạn, hãy yêu cầu mã mới.',
  'Invalid reset token': 'Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
  'Cart is empty': 'Giỏ hàng đang trống.',
  'A product in your cart is no longer available': 'Có món trong giỏ không còn được bán. Hãy xoá món đó rồi thử lại.',
  'Order not found': 'Không tìm thấy đơn hàng.',
  'Invalid order status transition': 'Không thể chuyển đơn sang trạng thái này.',
  'Order can no longer be cancelled': 'Đơn hàng không thể huỷ nữa (đã được xác nhận hoặc đã thanh toán).',
  'Invalid payment operation for this order': 'Không thể xác nhận thanh toán cho đơn này.',
  'Cart service is unavailable': 'Dịch vụ giỏ hàng đang không khả dụng.',
  'Product service is unavailable': 'Dịch vụ món ăn đang không khả dụng.',
  'Payment service is unavailable': 'Không tạo được liên kết thanh toán PayOS. Hãy thử lại hoặc chọn thanh toán khi nhận hàng.',
  'Quantity exceeds the allowed maximum per item': 'Số lượng vượt quá mức tối đa cho mỗi món.',
  'Cart item not found': 'Món này không còn trong giỏ hàng.',
  'Product not found': 'Món ăn không còn tồn tại.',
  'Note must be at most 255 characters': 'Ghi chú tối đa 255 ký tự.',
  'phone is invalid': 'Số điện thoại không hợp lệ.',
  'search unavailable': 'Dịch vụ tìm kiếm đang không khả dụng.',
};

export function getErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra, vui lòng thử lại.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; code?: number } | undefined;
    if (data?.message) return MESSAGE_VI[data.message] ?? data.message;
    if (error.response?.status === 401) return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.';
    if (error.response?.status === 403) return 'Bạn không có quyền thực hiện thao tác này.';
    if (!error.response) return 'Không kết nối được tới máy chủ. Hãy kiểm tra API Gateway (cổng 8888).';
  }
  return fallback;
}

export function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export function getErrorCode(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) return (error.response?.data as { code?: number } | undefined)?.code;
  return undefined;
}
