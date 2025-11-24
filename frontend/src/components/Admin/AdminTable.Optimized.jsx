import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  IconButton,
  Box,
  Typography,
  TablePagination,
  TextField,
  Stack,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

/**
 * 🚀 Optimized Admin Table
 * Performance: React.memo, useCallback, useMemo
 * Eliminates unnecessary re-renders of table rows
 */

// Memoized table row component to prevent re-renders
const AdminTableRow = React.memo(({ row, columns, onView, onEdit, onDelete }) => (
  <TableRow hover>
    {columns.map((col) => (
      <TableCell key={`${row.id || row._id}-${col.field}`}>
        {row[col.field]}
      </TableCell>
    ))}
    <TableCell align="center">
      <Stack direction="row" spacing={0.5} justifyContent="center">
        {onView && (
          <IconButton
            size="small"
            onClick={() => onView(row)}
            title="Voir"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        )}
        {onEdit && (
          <IconButton
            size="small"
            onClick={() => onEdit(row)}
            title="Modifier"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}
        {onDelete && (
          <IconButton
            size="small"
            onClick={() => onDelete(row)}
            title="Supprimer"
            sx={{ color: '#d32f2f' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
    </TableCell>
  </TableRow>
), (prevProps, nextProps) => {
  return (
    prevProps.row === nextProps.row &&
    prevProps.columns === nextProps.columns &&
    prevProps.onView === nextProps.onView &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  );
});

AdminTableRow.displayName = 'AdminTableRow';

// Memoized header component
const AdminTableHeader = React.memo(({ columns, sortable, sortBy, sortOrder, onSort }) => (
  <TableHead>
    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
      {columns.map((col) => (
        <TableCell
          key={col.field}
          onClick={() => sortable && onSort(col.field)}
          sx={{
            fontWeight: 600,
            cursor: sortable ? 'pointer' : 'default',
            userSelect: 'none',
          }}
        >
          {col.label}
          {sortable && sortBy === col.field && (
            <span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>
          )}
        </TableCell>
      ))}
      <TableCell align="center">Actions</TableCell>
    </TableRow>
  </TableHead>
), (prevProps, nextProps) => {
  return (
    prevProps.columns === nextProps.columns &&
    prevProps.sortBy === nextProps.sortBy &&
    prevProps.sortOrder === nextProps.sortOrder
  );
});

AdminTableHeader.displayName = 'AdminTableHeader';

export default function AdminTableOptimized({
  columns = [],
  rows = [],
  onEdit = () => {},
  onDelete = () => {},
  onView = () => {},
  loading = false,
  searchable = true,
  sortable = true,
  emptyMessage = 'Aucun élément',
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // Memoized filter and sort logic
  const filteredRows = useMemo(() => {
    let filtered = [...rows];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((row) =>
        columns.some(
          (col) =>
            String(row[col.field])
              .toLowerCase()
              .includes(searchLower)
        )
      );
    }

    if (sortBy && sortable) {
      filtered.sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [rows, search, sortBy, sortOrder, columns, sortable]);

  const paginatedRows = useMemo(() => 
    filteredRows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    ),
    [filteredRows, page, rowsPerPage]
  );

  const handleSort = useCallback((field) => {
    setSortOrder(sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc');
    setSortBy(field);
  }, [sortBy, sortOrder]);

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const memoizedOnEdit = useCallback(onEdit, [onEdit]);
  const memoizedOnDelete = useCallback(onDelete, [onDelete]);
  const memoizedOnView = useCallback(onView, [onView]);

  return (
    <Box>
      {searchable && (
        <TextField
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          size="small"
          sx={{ mb: 2, width: '100%' }}
        />
      )}

      <TableContainer component={Paper}>
        <Table>
          <AdminTableHeader
            columns={columns}
            sortable={sortable}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row) => (
                <AdminTableRow
                  key={row.id || row._id}
                  row={row}
                  columns={columns}
                  onView={memoizedOnView}
                  onEdit={memoizedOnEdit}
                  onDelete={memoizedOnDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredRows.length}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        labelRowsPerPage="Lignes par page:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} sur ${count}`
        }
      />
    </Box>
  );
}
