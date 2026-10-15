// Mọi service backend đều trả về ApiResponse<T> với dữ liệu nằm trong `results`.
export interface ApiResponse<T> {
  code: number;
  message?: string;
  results?: T;
}

export interface PageResponse<T> {
  currentPage: number;
  totalPage: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}

export type ProductType = 'FOOD' | 'DRINK';

export interface Category {
  name: string;
  description?: string;
}

/** Dùng chung cho FoodResponse (product-service) và ProductDocument (search-service). */
export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  type: ProductType;
  position?: string;
  timeWork?: string;
  description?: string;
  categories?: Category[];
}

export interface AuthenticationResponse {
  token: string;
  authenticated: boolean;
}

export interface Profile {
  id: string;
  userId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  avatar?: string;
  dob?: string | null; // yyyy-MM-dd
}

export interface ProfileUpdateRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  avatar?: string;
  dob?: string | null;
}

export interface Role {
  name: string;
  description?: string;
}

export interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  birthday?: string | null;
  roles?: Role[];
}

export interface UserCreationRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  birthday?: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface Cart {
  /** cart-service trả giỏ rỗng chưa lưu (id = null) cho người dùng chưa từng thêm món. */
  id?: string | null;
  userId: string;
  items: CartItem[];
  totalPrice: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'PAYOS';
export type PaymentStatus = 'UNPAID' | 'PAID';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  subTotal: number;
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  receiverName: string;
  phone: string;
  address: string;
  note?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  checkoutUrl?: string;
}

export interface CreateOrderRequest {
  receiverName: string;
  phone: string;
  address: string;
  note?: string;
  paymentMethod: PaymentMethod;
}

/** post-service: GET /banner/getAll. `url` là ảnh do file-service phục vụ (cần Bearer token). */
export interface Banner {
  id: string;
  url: string;
}
