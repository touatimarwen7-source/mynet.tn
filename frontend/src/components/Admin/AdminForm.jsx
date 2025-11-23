import React from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
} from '@mui/material';
import institutionalTheme from '../../theme/theme';

/**
 * Reusable form component
 * Handles common form field patterns
 */
export default function AdminForm({
  fields = [],
  values = {},
  onChange = () => {},
  onSubmit = () => {},
  loading = false,
  submitText = 'Enregistrer',
  cancelText = 'Annuler',
  onCancel = () => {},
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...values, [name]: value });
  };

  return (
    <Box component="form" onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }}>
      <Stack spacing={2}>
        {fields.map((field) => {
          if (field.type === 'select') {
            return (
              <FormControl key={field.name} fullWidth>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  name={field.name}
                  value={values[field.name] || ''}
                  onChange={handleChange}
                  label={field.label}
                  disabled={loading}
                >
                  {field.options?.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );
          }

          return (
            <TextField
              key={field.name}
              name={field.name}
              label={field.label}
              value={values[field.name] || ''}
              onChange={handleChange}
              disabled={loading}
              multiline={field.multiline}
              rows={field.rows || 1}
              fullWidth
              type={field.type || 'text'}
              placeholder={field.placeholder}
              required={field.required}
            />
          );
        })}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: 'none',
            backgroundColor: theme.palette.primary.main,
            '&:hover': { backgroundColor: '#004499' },
          }}
        >
          {submitText}
        </Button>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderColor: '#ddd',
            color: '#666',
            '&:hover': { borderColor: '#999' },
          }}
        >
          {cancelText}
        </Button>
      </Stack>
    </Box>
  );
}
