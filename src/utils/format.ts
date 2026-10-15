import type { OrderStatus, PaymentMethod, ProductType } from '../api/types';

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
export const formatPrice = (value?: number | null) => vnd.format(Number(value ?? 0));

export const formatDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang chuẩn bị',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

// Phải khớp OrderStatus.canTransitionTo ở order-service
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  COD: 'Thanh toán khi nhận hàng',
  PAYOS: 'Chuyển khoản QR (PayOS)',
};

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = { FOOD: 'Món ăn', DRINK: 'Đồ uống' };

// product-service tạo sẵn 4 danh mục này khi khởi động; danh mục do admin thêm hiển thị theo đúng tên.
export const CATEGORY_LABEL: Record<string, string> = {
  CAFE: 'Cà phê',
  NOODLE: 'Mì, bún, phở',
  RICE: 'Cơm',
  MILK_TEA: 'Trà sữa',
};
export const categoryLabel = (name: string) => CATEGORY_LABEL[name] ?? name;
