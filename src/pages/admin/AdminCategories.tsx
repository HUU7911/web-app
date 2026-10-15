import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../../api/client';
import { productApi } from '../../api/services';
import type { Category } from '../../api/types';
import { useNotify } from '../../context/NotifyContext';

export default function AdminCategories() {
  const notify = useNotify();
  const [list, setList] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = useCallback(async () => {
    try {
      setList(await productApi.categories());
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await productApi.createCategory({ name: name.trim(), description: description.trim() });
      notify('Đã thêm danh mục.');
      setName('');
      setDescription('');
      await load();
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    }
  };

  const remove = async (c: Category) => {
    try {
      await productApi.deleteCategory(c.name);
      notify('Đã xoá danh mục.');
      await load();
    } catch (err) {
      notify(getErrorMessage(err), 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Danh mục</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack component="form" direction={{ xs: 'column', sm: 'row' }} spacing={2} onSubmit={create} sx={{ mb: 3 }}>
        <TextField label="Tên danh mục" value={name} onChange={(e) => setName(e.target.value)} required />
        <TextField label="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button type="submit" variant="contained" sx={{ flexShrink: 0 }}>Thêm danh mục</Button>
      </Stack>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow><TableCell>Tên</TableCell><TableCell>Mô tả</TableCell><TableCell /></TableRow>
          </TableHead>
          <TableBody>
            {list.map((c) => (
              <TableRow key={c.name} hover>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.description}</TableCell>
                <TableCell align="right">
                  <IconButton aria-label="Xoá danh mục" onClick={() => remove(c)}><DeleteOutlineIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {list.length === 0 && <TableRow><TableCell colSpan={3} align="center">Chưa có danh mục.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
