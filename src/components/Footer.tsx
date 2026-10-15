
import { Link } from "react-router-dom";
import "../index.css";

const quickLinks = [
  { label: "Trang chủ", path: "/" },
  { label: "Thực đơn", path: "/products" },
  { label: "Giỏ hàng", path: "/cart" },
  { label: "Đăng nhập", path: "/login" },
];

const supportLinks = [
  { label: "Hướng dẫn đặt món", path: "/guide" },
  { label: "Phương thức thanh toán", path: "/payment" },
  { label: "Chính sách bảo mật", path: "/privacy" },
  { label: "Liên hệ", path: "/contact" },
];

export default function Footer() {
  return (
    <footer className="shop-footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="footer-logo-icon">🍽</span>
              <span>Shop <strong>Meal</strong></span>
            </Link>

            <p className="footer-description">
              Khám phá những món ăn ngon mỗi ngày.
              Đặt món dễ dàng, giao hàng nhanh chóng
              và tận hưởng bữa ăn tuyệt vời cùng Shop Meal.
            </p>

            <div className="footer-socials">
              <a href="https://www.facebook.com/"
                 target="_blank" rel="noreferrer"
                 aria-label="Facebook">f</a>
              <a href="https://www.instagram.com/"
                 target="_blank" rel="noreferrer"
                 aria-label="Instagram">ig</a>
              <a href="https://www.youtube.com/"
                 target="_blank" rel="noreferrer"
                 aria-label="YouTube">▶</a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Liên kết nhanh</h3>
            <ul>
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h3>Hỗ trợ khách hàng</h3>
            <ul>
              {supportLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column footer-contact">
            <h3>Liên hệ với chúng tôi</h3>
            <p><span>✉</span> support@shopmeal.vn</p>
            <p><span>☎</span> 1900 0000</p>
            <p><span>⌖</span> Việt Nam</p>
            <p><span>◷</span> 08:00 - 22:00</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Shop Meal. All rights reserved.</p>
          <p>Made with <span className="footer-heart">♥</span> for food lovers</p>
        </div>
      </div>
    </footer>
  );
}
