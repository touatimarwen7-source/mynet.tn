import { Tooltip as MuiTooltip } from '@mui/material';

export default function Tooltip({ children, content, position = 'top' }) {
  return (
    <MuiTooltip title={content} placement={position} arrow>
      {children}
    </MuiTooltip>
  );
}
