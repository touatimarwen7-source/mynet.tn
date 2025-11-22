import { useState, useMemo } from 'react';
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function EnhancedTable({
  data = [],
  columns = [],
  sortable = true,
  groupBy = null,
  onRowClick = null,
  striped = true,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [expandedGroups, setExpandedGroups] = useState({});

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortConfig]);

  const groupedData = useMemo(() => {
    if (!groupBy) return { default: sortedData };
    return sortedData.reduce((groups, row) => {
      const key = row[groupBy] || 'غير محدد';
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
      return groups;
    }, {});
  }, [sortedData, groupBy]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E0E0E0', borderRadius: '4px' }}>
      <Table sx={{ backgroundColor: '#FFFFFF' }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#F9F9F9' }}>
            {groupBy && (
              <TableCell sx={{ padding: '12px', backgroundColor: '#F9F9F9', width: '40px' }} />
            )}
            {columns.map((col) => (
              <TableCell
                key={col.key}
                onClick={() => sortable && handleSort(col.key)}
                sx={{
                  padding: '12px',
                  backgroundColor: '#F9F9F9',
                  fontWeight: 600,
                  color: '#212121',
                  fontSize: '14px',
                  cursor: sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  '&:hover': sortable ? { backgroundColor: '#f5f5f5' } : {},
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{col.label}</span>
                  {sortable && sortConfig.key === col.key && (
                    <span sx={{ fontSize: '12px' }}>
                      {sortConfig.direction === 'asc' ? '▼' : '▲'}
                    </span>
                  )}
                  {col.tooltip && (
                    <Tooltip title={col.tooltip} arrow>
                      <HelpOutlineIcon sx={{ fontSize: '16px', color: '#616161' }} />
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {groupBy ? (
            Object.entries(groupedData).map(([groupName, groupRows]) => (
              <Box key={groupName}>
                <TableRow
                  onClick={() => toggleGroup(groupName)}
                  sx={{
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#eeeeee' },
                  }}
                >
                  <TableCell colSpan={columns.length + 1} sx={{ padding: '12px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {expandedGroups[groupName] ? (
                        <KeyboardArrowDownIcon sx={{ fontSize: '20px' }} />
                      ) : (
                        <KeyboardArrowUpIcon sx={{ fontSize: '20px' }} />
                      )}
                      <Typography sx={{ fontWeight: 600, color: '#212121' }}>
                        {groupName}
                      </Typography>
                      <Typography sx={{ color: '#616161', fontSize: '14px' }}>
                        ({groupRows.length})
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
                {expandedGroups[groupName] &&
                  groupRows.map((row, idx) => (
                    <TableRow
                      key={idx}
                      onClick={() => onRowClick?.(row)}
                      sx={{
                        backgroundColor: striped && idx % 2 === 0 ? '#FFFFFF' : '#fafafa',
                        cursor: onRowClick ? 'pointer' : 'default',
                        '&:hover': { backgroundColor: '#f5f5f5' },
                      }}
                    >
                      <TableCell sx={{ padding: '12px', width: '40px' }} />
                      {columns.map((col) => (
                        <TableCell
                          key={col.key}
                          sx={{
                            padding: '12px',
                            color: '#212121',
                            fontSize: '14px',
                          }}
                        >
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              </Box>
            ))
          ) : (
            sortedData.map((row, idx) => (
              <TableRow
                key={idx}
                onClick={() => onRowClick?.(row)}
                sx={{
                  backgroundColor: striped && idx % 2 === 0 ? '#FFFFFF' : '#fafafa',
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      padding: '12px',
                      color: '#212121',
                      fontSize: '14px',
                    }}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
