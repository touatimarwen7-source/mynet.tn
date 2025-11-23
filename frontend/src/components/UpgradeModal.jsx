import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Stack, Chip } from '@mui/material';
import { getNextTierInfo, UPGRADE_VALUES, SERVICE_DESCRIPTIONS } from '../utils/subscriptionTiers';
import institutionalTheme from '../theme/theme';

export default function UpgradeModal({ isOpen, onClose, currentTier, featureKey }) {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const nextTierInfo = getNextTierInfo(currentTier?.id);
  const featureInfo = SERVICE_DESCRIPTIONS[featureKey] || {};
  const upgradeValue = UPGRADE_VALUES[currentTier?.id] || {};

  const handleUpgrade = () => {
    onClose();
    navigate('/subscription-tiers');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, fontSize: '18px', color: theme.palette.text.primary }}>
        Débloquez cette fonctionnalité
      </DialogTitle>

      <DialogContent sx={{ paddingY: '24px' }}>
        <Stack spacing={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ fontSize: '48px', marginBottom: '12px' }}>{featureInfo.icon}</Box>
            <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 600, color: theme.palette.text.primary, marginBottom: '8px' }}>
              {featureInfo.label}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '14px', color: '#616161' }}>
              {featureInfo.description}
            </Typography>
          </Box>

          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '14px', color: '#616161' }}>Plan actuel:</Typography>
              <Chip label={currentTier?.name} variant="outlined" />
            </Box>
            {nextTierInfo && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '14px', color: '#616161' }}>Plan requis:</Typography>
                <Chip label={nextTierInfo.name} color="primary" />
              </Box>
            )}
          </Stack>

          {nextTierInfo && (
            <Box>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: theme.palette.text.primary, marginBottom: '12px' }}>
                Avantages supplémentaires:
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ fontSize: '13px', color: '#616161' }}>
                  ✓ {upgradeValue.benefit1}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', color: '#616161' }}>
                  ✓ {upgradeValue.benefit2}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', color: '#616161' }}>
                  ✓ {upgradeValue.benefit3}
                </Typography>
              </Stack>
            </Box>
          )}

          {nextTierInfo && (
            <Box sx={{ backgroundColor: theme.palette.background.default, padding: '16px', borderRadius: '4px', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '12px', color: '#616161' }}>À partir de</Typography>
              <Typography sx={{ fontSize: '24px', fontWeight: 600, color: theme.palette.primary.main }}>
                {nextTierInfo.price} TND
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#616161' }}>/mois</Typography>
            </Box>
          )}

          {!nextTierInfo && (
            <Box sx={{ backgroundColor: '#e8f5e9', padding: '16px', borderRadius: '4px', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '14px', color: '#2e7d32', fontWeight: 600 }}>
                ✓ Vous avez accès à toutes les fonctionnalités
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#616161' }}>Merci de votre confiance!</Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ padding: '16px' }}>
        <Button onClick={onClose} variant="outlined">
          Annuler
        </Button>
        {nextTierInfo && (
          <Button onClick={handleUpgrade} variant="contained">
            Voir les Forfaits
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
