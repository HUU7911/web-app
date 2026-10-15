import { Box, Button, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface Props {
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  icon?: ReactNode;
}

export default function EmptyState({ title, description, actionLabel, actionTo, icon }: Props) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
      {icon}
      <Typography variant="h6" color="text.primary" sx={{ mt: 1 }}>
        {title}
      </Typography>
      {description && <Typography variant="body2">{description}</Typography>}
      {actionLabel && actionTo && (
        <Button component={RouterLink} to={actionTo} variant="contained" sx={{ mt: 2 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
