import { createTheme } from '@mui/material/styles';

// Bảng màu: lá chuối (chủ đạo), nghệ (nhấn), giấy hoá đơn (nền)
export const palette = {
  leaf: '#14654A',
  leafDark: '#0E4A37',
  turmeric: '#E8A317',
  chili: '#C8372D',
  ground: '#F3F6F1',
  paper: '#FFFFFF',
  ink: '#17261F',
};

const heading = '"Bricolage Grotesque", "Be Vietnam Pro", system-ui, sans-serif';

export const theme = createTheme({
  palette: {
    primary: { main: palette.leaf, dark: palette.leafDark, contrastText: '#fff' },
    secondary: { main: palette.turmeric, contrastText: palette.ink },
    error: { main: palette.chili },
    background: { default: palette.ground, paper: palette.paper },
    text: { primary: palette.ink, secondary: '#52645B' },
    divider: '#D8E0D6',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
    h1: { fontFamily: heading, fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: heading, fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: heading, fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontFamily: heading, fontWeight: 700, letterSpacing: '-0.015em' },
    h5: { fontFamily: heading, fontWeight: 700 },
    h6: { fontFamily: heading, fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiPaper: { defaultProps: { elevation: 0 } },
    MuiCard: { defaultProps: { variant: 'outlined' } },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiAppBar: { defaultProps: { elevation: 0 } },
  },
});
