import React from 'react';
import { TableRow, TableCell } from '@mui/material';

/**
 * 🚀 Optimized MUI Table Row Component
 * Prevents unnecessary re-renders with React.memo
 */
const MuiTableRowOptimized = React.memo(
  ({ data, cells, onClick }) => (
    <TableRow
      onClick={onClick}
      sx={{
        '&:hover': { backgroundColor: '#f8f8f8' },
      }}
    >
      {cells.map((cell) => (
        <TableCell
          key={cell.key || cell}
          align={cell.align || 'left'}
          sx={{
            fontSize: '14px',
            color: '#333333',
            padding: '16px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {data[cell.key || cell]}
        </TableCell>
      ))}
    </TableRow>
  ),
  (prevProps, nextProps) => {
    // Custom comparison to prevent re-renders
    return (
      prevProps.data === nextProps.data &&
      prevProps.cells === nextProps.cells &&
      prevProps.onClick === nextProps.onClick
    );
  }
);

MuiTableRowOptimized.displayName = 'MuiTableRowOptimized';

export default MuiTableRowOptimized;
