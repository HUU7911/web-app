import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ClearIcon from '@mui/icons-material/Clear';
import EmojiFoodBeverageIcon from '@mui/icons-material/EmojiFoodBeverage';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import RamenDiningIcon from '@mui/icons-material/RamenDining';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RiceBowlIcon from '@mui/icons-material/RiceBowl';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import {
	AppBar,
	Avatar,
	Badge,
	Box,
	Button,
	ButtonBase,
	Container,
	Divider,
	IconButton,
	InputAdornment,
	ListItemIcon,
	Menu,
	MenuItem,
	Paper,
	TextField,
	Toolbar,
	Typography,
	useMediaQuery,
} from '@mui/material';
import { ElementType, FormEvent, useEffect, useState } from 'react';
import { Link as RouterLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { bannerApi, productApi } from '../api/services';
import type { Banner } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import { categoryLabel } from '../utils/format';
import AuthImage from './AuthImage';
import Footer from './Footer';

/* ------------------------------------------------------------------ */
/* Icon cho các danh mục mà product-service tạo sẵn khi khởi động      */
/* (CAFE, NOODLE, RICE, MILK_TEA). Danh mục khác dùng icon mặc định.     */
/* ------------------------------------------------------------------ */

const CATEGORY_ICON: Record<string, ElementType> = {
	CAFE: LocalCafeIcon,
	NOODLE: RamenDiningIcon,
	RICE: RiceBowlIcon,
	MILK_TEA: EmojiFoodBeverageIcon,
};

// GET /product/category yêu cầu đăng nhập; khách xem danh mục mặc định của hệ thống.
const DEFAULT_CATEGORIES = ['CAFE', 'NOODLE', 'RICE', 'MILK_TEA'];

/* ------------------------------------------------------------------ */
/* Thanh tìm kiếm                                                      */
/* ------------------------------------------------------------------ */

function SearchBox() {
	const navigate = useNavigate();
	const [params] = useSearchParams();
	const urlQ = params.get('q') ?? '';
	const [q, setQ] = useState(urlQ);

	useEffect(() => setQ(urlQ), [urlQ]);

	const submit = (e: FormEvent) => {
		e.preventDefault();
		navigate(q.trim() ? `/?q=${encodeURIComponent(q.trim())}` : '/');
	};

	return (
		<Box component="form" onSubmit={submit} sx={{ width: '100%' }}>
			<TextField
				fullWidth
				value={q}
				onChange={(e) => setQ(e.target.value)}
				placeholder="Tìm phở, bún, trà sữa…"
				inputProps={{ 'aria-label': 'Tìm món ăn' }}
				slotProps={{
					input: {
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon fontSize="small" />
							</InputAdornment>
						),
						endAdornment: q ? (
							<InputAdornment position="end">
								<IconButton
									size="small"
									aria-label="Xoá từ khoá"
									onClick={() => {
										setQ('');
										navigate('/');
									}}
								>
									<ClearIcon fontSize="small" />
								</IconButton>
							</InputAdornment>
						) : null,
						sx: {
							height: 44,
							borderRadius: 6,
							bgcolor: 'action.hover',
							transition: 'background-color .2s, box-shadow .2s',
							'& fieldset': { borderColor: 'transparent' },
							'&:hover fieldset': { borderColor: 'divider' },
							'&.Mui-focused': {
								bgcolor: 'background.paper',
								boxShadow: (t) => `0 0 0 3px ${t.palette.primary.main}22`,
							},
							'&.Mui-focused fieldset': { borderColor: 'primary.main' },
						},
					},
				}}
			/>
		</Box>
	);
}

/* ------------------------------------------------------------------ */
/* Danh mục: sidebar bên trái slide (desktop)                          */
/* ------------------------------------------------------------------ */

function CategorySidebar() {
	const navigate = useNavigate();
	const [params] = useSearchParams();
	const active = params.get('category') ?? '';
	const [names, setNames] = useState<string[]>(DEFAULT_CATEGORIES);

	useEffect(() => {
		let live = true;
		productApi
			.categories()
			.then((list) => live && list.length > 0 && setNames(list.map((c) => c.name)))
			.catch(() => undefined);
		return () => {
			live = false;
		};
	}, []);

	return (
		<Paper
			variant="outlined"
			component="nav"
			aria-label="Danh mục món ăn"
			sx={{
				display: { xs: 'none', md: 'flex' },
				flexDirection: 'column',
				justifyContent: 'flex-start',
				borderRadius: 2,
				py: 1,
				px: 0.5,
				overflowY: 'auto',
				maxHeight: 320,
			}}
		>
			{names.map((name) => {
				const Icon = CATEGORY_ICON[name] ?? FastfoodIcon;
				const selected = active === name;
				return (
					<ButtonBase
						key={name}
						onClick={() => navigate(selected ? '/' : `/?category=${encodeURIComponent(name)}`)}
						sx={{
							display: 'flex',
							alignItems: 'center',
							gap: 1.5,
							width: '100%',
							px: 1.5,
							py: 1.1,
							borderRadius: 2.5,
							justifyContent: 'flex-start',
							textAlign: 'left',
							color: selected ? 'primary.main' : 'text.primary',
							bgcolor: selected ? 'action.selected' : 'transparent',
							'&:hover': { bgcolor: 'action.hover', color: 'primary.main' },
						}}
					>
						<Icon fontSize="small" color="primary" />
						<Typography variant="body2" fontWeight={selected ? 700 : 500} sx={{ flexGrow: 1 }}>
							{categoryLabel(name)}
						</Typography>
						<ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
					</ButtonBase>
				);
			})}
		</Paper>
	);
}

/* ------------------------------------------------------------------ */
/* Slide banner lấy từ post-service (GET /post/banner/getAll)           */
/* ------------------------------------------------------------------ */

const slideHeight = { xs: 170, sm: 240, md: 320 };

function PromoSlider() {
	const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
	const [banners, setBanners] = useState<Banner[]>([]);
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const total = banners.length;

	// Gateway yêu cầu token cho /post/** nên chỉ tải banner khi đã đăng nhập.
	useEffect(() => {
		setIndex(0);
		let live = true;
		bannerApi
			.list()
			.then((list) => live && setBanners(list))
			.catch(() => live && setBanners([]));
		return () => {
			live = false;
		};
	}, []);

	useEffect(() => {
		if (paused || reduceMotion || total < 2) return;
		const id = setInterval(() => setIndex((i) => (i + 1) % total), 5000);
		return () => clearInterval(id);
	}, [paused, reduceMotion, total]);

	const prev = () => setIndex((i) => (i - 1 + total) % total);
	const next = () => setIndex((i) => (i + 1) % total);

	const arrowSx = {
		position: 'absolute',
		top: '50%',
		transform: 'translateY(-50%)',
		bgcolor: 'rgba(255,255,255,.85)',
		'&:hover': { bgcolor: '#fff' },
		display: { xs: 'none', sm: 'flex' },
		zIndex: 2,
	} as const;

	return (
		<Paper
			variant="outlined"
			role="region"
			aria-roledescription="carousel"
			aria-label="Banner"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2, height: slideHeight }}
		>
			<Box
				sx={{
					display: 'flex',
					height: '100%',
					transform: `translateX(-${index * 100}%)`,
					transition: reduceMotion ? 'none' : 'transform .6s cubic-bezier(.4,0,.2,1)',
				}}
			>
				{banners.map((b, i) => (
					<Box key={b.id} aria-hidden={i !== index} sx={{ flex: '0 0 100%', height: '100%' }}>
						<AuthImage src={b.url} alt={`Banner ${i + 1}`} sx={{ width: '100%', height: '100%' }} />
					</Box>
				))}
			</Box>

			{total > 1 && (
				<>
					<IconButton size="small" aria-label="Slide trước" onClick={prev} sx={{ ...arrowSx, left: 12 }}>
						<ChevronLeftIcon />
					</IconButton>
					<IconButton size="small" aria-label="Slide sau" onClick={next} sx={{ ...arrowSx, right: 12 }}>
						<ChevronRightIcon />
					</IconButton>
					<Box sx={{ display: 'flex', position: 'absolute', bottom: 10, left: 0, right: 0, justifyContent: 'center', gap: 1 }}>
						{banners.map((b, i) => (
							<Box
								key={b.id}
								component="button"
								type="button"
								aria-label={`Chuyển tới slide ${i + 1}`}
								aria-current={i === index}
								onClick={() => setIndex(i)}
								sx={{
									p: 0,
									border: 0,
									cursor: 'pointer',
									height: 8,
									width: i === index ? 26 : 8,
									borderRadius: 4,
									bgcolor: i === index ? '#fff' : 'rgba(255,255,255,.5)',
									transition: 'width .3s, background-color .3s',
								}}
							/>
						))}
					</Box>
				</>
			)}
		</Paper>
	);
}

/* Khu vực đầu trang chủ: [Sidebar danh mục | Slide banner] */
function HomeHero() {
	return (
		<Container maxWidth="lg" sx={{ pt: { xs: 2, md: 3 } }}>
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: { xs: '1fr', md: '240px minmax(0, 1fr)' },
					gap: 2,
					alignItems: 'stretch',
				}}
			>
				<CategorySidebar />
				<Box sx={{ minWidth: 0 }}>
					<PromoSlider />
				</Box>
			</Box>
		</Container>
	);
}

/* ------------------------------------------------------------------ */
/* Layout chính                                                        */
/* ------------------------------------------------------------------ */

export default function AppLayout() {
	const { isAuthenticated, isStaff, profile, info, logout } = useAuth();
	const { count } = useCart();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);

	const isHome = pathname === '/';
	const displayName = profile?.firstName || profile?.username || 'Tài khoản';
	const go = (path: string) => {
		setAnchor(null);
		navigate(path);
	};

	return (
		<Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
			<AppBar
				position="sticky"
				color="inherit"
				elevation={0}
				sx={{
					bgcolor: 'rgba(255,255,255,.92)',
					backdropFilter: 'blur(10px)',
					borderBottom: 1,
					borderColor: 'divider',
				}}
			>
				<Container maxWidth="lg" disableGutters sx={{ px: { xs: 1.5, sm: 3 } }}>
					<Toolbar disableGutters sx={{ gap: 1.5, minHeight: { xs: 56, md: 68 } }}>

						<Box
							component={RouterLink}
							to="/"
							aria-label="Shop Meal - Trang chủ"
							sx={{
								display: 'flex',
								alignItems: 'center',
								flexShrink: 0,
								mr: { md: 2 },
								textDecoration: 'none',
							}}
						>
							<Box
								component="img"
								src="/shop-meal-logo.png"
								alt="Shop Meal"
								sx={{
									display: 'block',
									width: { xs: 112, sm: 135, md: 155 },
									height: { xs: 42, md: 50 },
									objectFit: 'contain',
									objectPosition: 'left center',
								}}
							/>
						</Box>


						<Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1, justifyContent: 'center' }}>
							<Box sx={{ width: '100%', maxWidth: 560 }}>
								<SearchBox />
							</Box>
						</Box>
						<Box sx={{ display: { xs: 'block', md: 'none' }, flexGrow: 1 }} />

						<IconButton component={RouterLink} to="/cart" aria-label="Giỏ hàng">
							<Badge badgeContent={count} color="secondary">
								<ShoppingBagOutlinedIcon />
							</Badge>
						</IconButton>

						{isAuthenticated ? (
							<>
								<IconButton
									onClick={(e) => setAnchor(e.currentTarget)}
									aria-label="Tài khoản"
									aria-haspopup="menu"
									sx={{ p: 0.5 }}
								>
									<Avatar
										sx={{
											width: 38,
											height: 38,
											bgcolor: 'primary.main',
											overflow: 'hidden',
											border: 2,
											borderColor: 'primary.light',
											transition: 'box-shadow .2s',
											'&:hover': { boxShadow: (t) => `0 0 0 3px ${t.palette.primary.main}33` },
										}}
									>
										{profile?.avatar ? (
											<AuthImage
												src={profile.avatar}
												alt={displayName}
												sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
											/>
										) : (
											displayName.charAt(0).toUpperCase()
										)}
									</Avatar>
								</IconButton>
								<Menu
									anchorEl={anchor}
									open={!!anchor}
									onClose={() => setAnchor(null)}
									slotProps={{ paper: { sx: { mt: 1, minWidth: 220, borderRadius: 3 } } }}
								>
									<Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
										<Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', overflow: 'hidden' }}>
											{profile?.avatar ? (
												<AuthImage
													src={profile.avatar}
													alt={displayName}
													sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
												/>
											) : (
												displayName.charAt(0).toUpperCase()
											)}
										</Avatar>
										<Box sx={{ minWidth: 0 }}>
											<Typography fontWeight={600} noWrap>{displayName}</Typography>
											<Typography variant="caption" color="text.secondary" noWrap>
												{info?.roles.join(', ')}
											</Typography>
										</Box>
									</Box>
									<Divider />
									<MenuItem onClick={() => go('/profile')}>
										<ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
										Hồ sơ
									</MenuItem>
									<MenuItem onClick={() => go('/orders')}>
										<ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
										Đơn hàng của tôi
									</MenuItem>
									{isStaff && (
										<MenuItem onClick={() => go('/admin')}>
											<ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
											Quản trị
										</MenuItem>
									)}
									<Divider />
									<MenuItem
										onClick={async () => {
											setAnchor(null);
											await logout();
											navigate('/');
										}}
									>
										<ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
										Đăng xuất
									</MenuItem>
								</Menu>
							</>
						) : (
							<>
								<Button
									component={RouterLink}
									to="/login"
									variant="contained"
									disableElevation
									sx={{ borderRadius: 6, px: 2.5, fontWeight: 600 }}
								>
									Đăng nhập
								</Button>
							</>
						)}
					</Toolbar>

					{/* Mobile: thanh tìm kiếm */}
					<Box sx={{ display: { xs: 'block', md: 'none' }, pb: 1.25 }}>
						<SearchBox />
					</Box>
				</Container>
			</AppBar>

			{/* Slide + danh mục + banner nhỏ, chỉ ở trang chủ */}
			{isHome && <HomeHero />}

			{/* Nội dung trang: danh sách card sản phẩm nằm ở đây */}
			<Container component="main" maxWidth="lg" sx={{ py: 3, flexGrow: 1 }}>
				<Outlet />
			</Container>

			<Footer />
		</Box>
	);
}