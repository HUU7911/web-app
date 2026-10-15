import EmptyState from '../components/EmptyState';

export default function NotFoundPage() {
  return <EmptyState title="Không tìm thấy trang" description="Đường dẫn này không tồn tại." actionLabel="Về thực đơn" actionTo="/" />;
}
