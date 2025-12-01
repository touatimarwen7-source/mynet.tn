import { Box, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { FRENCH_LABELS } from '../../utils/consistencyHelper';

const LineItemsTable = ({ items, onPriceChange, calculateItemTotal, calculateTotalAmount, submitting, sx }) => (
  <Card sx={sx.card}>
    <CardContent>
      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0056B3', mb: '16px' }}>
        📦 {FRENCH_LABELS.lots_et_articles}
      </Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
            <TableRow>
              <TableCell sx={sx.tableHeader}>{FRENCH_LABELS.lot}</TableCell>
              <TableCell sx={sx.tableHeader}>{FRENCH_LABELS.article}</TableCell>
              <TableCell sx={{ ...sx.tableHeader, textAlign: 'center' }}>{FRENCH_LABELS.quantite}</TableCell>
              <TableCell sx={{ ...sx.tableHeader, textAlign: 'center' }}>{FRENCH_LABELS.unite}</TableCell>
              <TableCell sx={{ ...sx.tableHeader, textAlign: 'center' }}>{FRENCH_LABELS.prix_unitaire} (TND)</TableCell>
              <TableCell sx={{ ...sx.tableHeader, textAlign: 'center' }}>{FRENCH_LABELS.total} (TND)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow 
                key={idx} 
                sx={{ 
                  backgroundColor: idx % 2 === 0 ? '#fff' : '#F9F9F9',
                  '&:hover': { backgroundColor: '#E3F2FD' }
                }}
              >
                <TableCell sx={{ fontSize: '12px', fontWeight: 600 }}>
                  Lot {item.lot_id}
                  <br />
                  <span style={{ color: '#666666', fontSize: '11px', fontWeight: 'normal' }}>
                    {item.lot_objet}
                  </span>
                </TableCell>
                <TableCell sx={{ fontSize: '12px' }}>{item.article_name}</TableCell>
                <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>{item.quantity}</TableCell>
                <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>{item.unit}</TableCell>
                <TableCell sx={{ fontSize: '12px', textAlign: 'center' }}>
                  <TextField
                    type="number"
                    size="small"
                    value={item.unit_price}
                    onChange={(e) => onPriceChange(idx, e.target.value)}
                    disabled={submitting}
                    inputProps={{ step: '0.01', min: '0' }}
                    sx={{ width: '100px' }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: '12px', fontWeight: 600, color: '#0056B3', textAlign: 'center' }}>
                  {calculateItemTotal(idx)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: '#E3F2FD', borderTop: '2px solid #0056B3' }}>
              <TableCell colSpan={5} sx={{ fontWeight: 600, color: '#0056B3', textAlign: 'right', fontSize: '14px' }}>
                {FRENCH_LABELS.total_general}:
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#0056B3', textAlign: 'center', fontSize: '14px' }}>
                {calculateTotalAmount()} TND
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </CardContent>
  </Card>
);

export default LineItemsTable;