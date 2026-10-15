# Shop Meal – Web App

Frontend React + TypeScript + Vite + MUI cho backend Spring microservice `shop-meal`.
Mọi request đi qua **API Gateway** (`http://localhost:8888/api/v1`).

## Chạy

```bash
cd web-app
npm install
cp .env.example .env     # chỉnh nếu gateway không chạy ở cổng 8888
npm run dev              # http://localhost:5173
```

Cổng 5173 đã nằm trong CORS của gateway và là `return-url` / `cancel-url` của PayOS
(`/payment/success`, `/payment/cancel`).

Tài khoản quản trị mặc định do `ApplicationInitConfig` tạo: `admin` / `admin`.

## Trang

| Đường dẫn | Mô tả | Quyền |
|---|---|---|
| `/` | Thực đơn, tìm kiếm, lọc, sắp xếp | công khai |
| `/login`, `/register`, `/forgot-password`, `/authenticate` | Đăng nhập, đăng ký, quên mật khẩu (OTP), callback Google | công khai |
| `/cart`, `/checkout` | Giỏ hàng, đặt hàng (COD / PayOS) | đăng nhập |
| `/orders`, `/orders/:id` | Lịch sử và chi tiết đơn, huỷ đơn | đăng nhập |
| `/profile` | Hồ sơ, ảnh đại diện | đăng nhập |
| `/admin/orders` | Đổi trạng thái, xác nhận thanh toán | STAFF, ADMIN |
| `/admin/products`, `/admin/categories` | Quản lý món (thêm, sửa, xoá) và danh mục | STAFF, ADMIN |
| `/admin/banners` | Tải banner trang chủ lên (xoá: chỉ ADMIN) | STAFF, ADMIN |
| `/admin/users` | Danh sách người dùng, tạo nhân viên | ADMIN (chặn cả ở route) |

## Cấu trúc

```
src/
  api/        client.ts (axios, tự refresh token khi 401), services.ts (gọi từng service), types.ts
  auth/       AuthContext (token + roles đọc từ JWT claim `scope`), Guards, jwt.ts
  context/    CartContext, NotifyContext (snackbar)
  components/ layout, ProductCard, Receipt, AuthImage, ...
  pages/      các trang; pages/admin/ cho khu quản trị
```

## Ghi chú đối chiếu với backend `shop-meal`

Frontend đã khớp với code backend hiện tại ở các điểm sau:

- Phân trang: `product`, `order`, `post` dùng page **bắt đầu từ 1**; `search` dùng page **bắt đầu từ 0** (tối đa 50/trang).
- Danh mục mặc định do product-service tạo sẵn: `CAFE`, `NOODLE`, `RICE`, `MILK_TEA` (hiển thị tên tiếng Việt, lọc qua `?category=`).
- Banner lấy từ post-service (`/post/banner/getAll`), chỉ tải được khi đã đăng nhập.
- Sửa món (`PUT /product/food/update/{id}`) luôn gửi lại ảnh vì backend bắt buộc upload; nếu không chọn ảnh mới, app tải ảnh cũ rồi gửi lại.
- Huỷ đơn chỉ khi `PENDING` và `UNPAID`; "Xác nhận thanh toán" chỉ cho đơn `PAYOS` chưa trả.
- Ảnh do file-service phục vụ cần Bearer token nên hiển thị qua `AuthImage`.

## Lỗi / thiếu sót ở backend (frontend không tự sửa được)

1. **Quên mật khẩu**: gateway (`PUBLIC_ENDPOINT`) và `identity-service/SecurityConfig` chưa mở `/auth/forgot-password`, `/auth/verify-otp`, `/auth/reset-password` -> khách nhận 401.
2. **Refresh token**: `refreshToken()` tìm user bằng `findByUsername(sub)` nhưng `sub` là userId -> luôn lỗi. Tương tự `/users/myInfor`. Nên dùng `findById`.
3. **Đăng nhập Google**: `outboundIdentityClient` trả `access_token` của Google chứ không phải JWT của hệ thống.
4. **Dọn giỏ sau khi đặt**: order-service gọi `DELETE /cart/my-cart` nhưng cart-service chưa có endpoint đó (lỗi bị nuốt). Frontend tạm xoá từng món.
5. **Role STAFF** không được tạo trong `ApplicationInitConfig` -> "Tạo nhân viên" tạo user không có vai trò.
6. **Route payment-service** ở gateway khai báo nhầm `Path=/search/**`.
7. **Phân quyền thiếu**: `/food/update/{id}`, `/order/admin/**`, `/category/**` chỉ yêu cầu đăng nhập, chưa kiểm tra STAFF/ADMIN.
8. **order-service** `AppException` dùng `ResponseEntity.status(errorCode.getCode())` (vd. 2002) không phải mã HTTP hợp lệ.
9. **Không có API** xem lại link PayOS của đơn đã tạo, nên không thể "thanh toán lại".
10. Cập nhật món không phát event sang search-service nên kết quả tìm kiếm có thể cũ.
11. `UserResponse` trả cả trường `password` (hash).
