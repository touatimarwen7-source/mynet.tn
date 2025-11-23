import { Box, Paper, Table, TableHead, TableBody, TableRow, TableCell, TextField, Button } from '@mui/material';
import institutionalTheme from '../theme/theme';

export default function CreateOfferLineItems({ items, onLineItemChange, onOpenCatalog, isDeadlinePassed, getTotalBidAmount }) {
  const theme = institutionalTheme;
  return (
    <Box>
      <Paper sx={{ overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="right">Qty</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="right">Prix Unitaire</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="right">Total</TableCell>
              <TableCell sx={{ fontWeight: 600, color: theme.palette.primary.main }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow key={idx} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <TableCell sx={{ color: theme.palette.text.primary }}>{item.description}</TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.primary }}>{item.quantity}</TableCell>
                <TableCell align="right">
                  <TextField size="small" type="number" value={item.unit_price} onChange={(e) => onLineItemChange(idx, 'unit_price', e.target.value)} disabled={isDeadlinePassed} sx={{ width: '100px' }} />
                </TableCell>
                <TableCell align="right" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                  {item.total_price.toFixed(2)} TND
                </TableCell>
                <TableCell align="center">
                  <Button size="small" onClick={() => onOpenCatalog(idx)} disabled={isDeadlinePassed} sx={{ color: theme.palette.primary.main, textTransform: 'none' }}>
                    Catalogue
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Box sx={{ padding: '16px', backgroundColor: '#f5f5f5', marginTop: '16px', borderRadius: '4px' }}>
        <span style={{ fontSize: '16px', fontWeight: 600, color: theme.palette.primary.main }}>
          Total: {getTotalBidAmount()} TND
        </span>
      </Box>
    </Box>
  );
}
