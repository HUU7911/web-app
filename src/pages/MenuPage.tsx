import {
  Alert,
  Box,
  Pagination,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productApi, searchApi } from '../api/services';
import type { Product } from '../api/types';
import EmptyState from '../components/EmptyState';
import ProductCard from '../components/ProductCard';
import ProductDialog from '../components/ProductDialog';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotify } from '../context/NotifyContext';
import { getErrorMessage } from '../api/client';
import { categoryLabel } from '../utils/format';

const PAGE_SIZE = 12;

const fold = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();

export default function MenuPage() {
  const { isAuthenticated } = useAuth();
  const { add } = useCart();
  const notify = useNotify();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  // Từ khoá do thanh tìm kiếm / danh mục ở AppLayout đặt qua ?q=
  const q = params.get('q') ?? '';
  // Danh mục (tên chính xác, vd. CAFE) do thanh danh mục đặt qua ?category=; search-service lọc theo categories.name.
  const category = params.get('category') ?? '';
  const page = Math.max(1, Number(params.get('page') ?? 1));

  const changePage = (value: number) => {
    const next = new URLSearchParams(params);
    if (value === 1) next.delete('page');
    else next.set('page', String(value));
    setParams(next);
  };

  // Đổi từ khoá hoặc danh mục thì về trang 1
  useEffect(() => {
    if (params.has('page') && params.get('page') !== '1') {
      const next = new URLSearchParams(params);
      next.delete('page');
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category]);

  const [items, setItems] = useState<Product[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const loadList = async () => {
      // Danh sách công khai: chỉ lọc được trên trang hiện tại.
      const res = await productApi.list(page, PAGE_SIZE);
      let data = res.data;
      const kw = fold(q.trim());
      if (kw) data = data.filter((p) => fold(p.name).includes(kw));
      if (category) data = data.filter((p) => p.categories?.some((c) => c.name === category));
      return { data, totalPage: res.totalPage };
    };

    (async () => {
      try {
        if (isAuthenticated) {
          try {
            const res = await searchApi.products({
              keyword: q || undefined,
              category: category || undefined,
              sort: 'RELEVANCE',
              page: page - 1,
              size: PAGE_SIZE,
            });
            if (!active) return;
            setFallback(false);
            setItems(res.data);
            setTotalPage(Math.max(1, res.totalPage));
            return;
          } catch {
            /* search-service lỗi/chưa chạy -> dùng danh sách từ product-service */
          }
        }
        const res = await loadList();
        if (!active) return;
        setFallback(true);
        setItems(res.data);
        setTotalPage(Math.max(1, res.totalPage));
      } catch (e) {
        if (active) setError(getErrorMessage(e));
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthenticated, q, category, page]);

  const handleAdd = async (p: Product) => {
    if (!isAuthenticated) {
      notify('Hãy đăng nhập để thêm món vào giỏ hàng.', 'info');
      navigate('/login', { state: { from: '/' } });
      return;
    }
    if (await add(p.id)) notify(`Đã thêm "${p.name}" vào giỏ hàng.`);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        {q ? `Kết quả cho “${q}”` : category ? categoryLabel(category) : 'Thực đơn hôm nay'}
      </Typography>

      {fallback && (q || category) && !isAuthenticated && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Tìm kiếm đang áp dụng cho trang hiện tại. Đăng nhập để tìm kiếm trên toàn bộ thực đơn.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={290} />
          ))}
        </Box>
      ) : items.length === 0 ? (
        <EmptyState
          title="Chưa có món phù hợp"
          description={q || category ? 'Thử đổi từ khoá hoặc danh mục khác.' : 'Thực đơn đang được cập nhật.'}
        />
      ) : (
        <>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {items.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={setSelected} onAdd={handleAdd} />
            ))}
          </Box>
          {totalPage > 1 && (
            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Pagination count={totalPage} page={page} color="primary" onChange={(_, v) => changePage(v)} />
            </Stack>
          )}
        </>
      )}

      <ProductDialog product={selected} onClose={() => setSelected(null)} onAdd={handleAdd} />
    </Box>
  );
}