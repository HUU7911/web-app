import { Box, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

/** Khối "hoá đơn": giấy trắng, viền nét đứt và mép răng cưa ở đáy. Dùng cho giỏ hàng, thanh toán, chi tiết đơn. */
export default function Receipt({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Box
      sx={[
        {
          position: 'relative',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderBottom: 0,
          borderColor: 'divider',
          borderRadius: '6px 6px 0 0',
          p: { xs: 2, sm: 3 },
          mb: '12px',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: -1,
            right: -1,
            bottom: -12,
            height: 12,
            background:
              'linear-gradient(135deg, #fff 6px, transparent 0) 0 0 / 12px 12px repeat-x, linear-gradient(225deg, #fff 6px, transparent 0) 0 0 / 12px 12px repeat-x',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

export function ReceiptRow({ label, value, bold }: { label: ReactNode; value: ReactNode; bold?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.5, fontWeight: bold ? 700 : 400 }}>
      <span>{label}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </Box>
  );
}

export const dashed = { borderTop: '1px dashed', borderColor: 'divider', my: 1.5 } as const;
