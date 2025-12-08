import { Box, Typography, TextField, Stack, Paper, Alert } from '@mui/material';
import { CATEGORIES } from './constants';
import { THEME_COLORS } from './themeHelpers';

export default function StepSeven({ formData, handleChange, loading }) {
  const awardLevelLabel = {
    lot: 'Par Lot',
    article: 'Par Article',
    tender: "Global (Toute l'appel d'offres)",
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Alert severity="success" sx={THEME_STYLES.alertSuccess}>
        ✅ Vous êtes prêt pour soumettre votre appel d'offres
      </Alert>

      <Paper sx={{ p: '20px', backgroundColor: THEME_COLORS.bgDefault, borderRadius: '4px' }}>
        <Typography
          sx={{ fontSize: '14px', fontWeight: 600, color: THEME_COLORS.primary, mb: '16px' }}
        >
          📋 Résumé de l'Appel d'Offres
        </Typography>

        <Stack spacing={2} sx={{ fontSize: '13px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: THEME_COLORS.textSecondary }}>Titre:</Typography>
            <Typography sx={{ fontWeight: 600, color: THEME_COLORS.textPrimary }}>
              {formData.title || 'Non défini'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: THEME_COLORS.textSecondary }}>Catégorie:</Typography>
            <Typography sx={{ fontWeight: 600, color: THEME_COLORS.textPrimary }}>
              {CATEGORIES.find((c) => c.value === formData.category)?.label || 'Non définie'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: THEME_COLORS.textSecondary }}>Budget:</Typography>
            <Typography sx={{ fontWeight: 600, color: THEME_COLORS.textPrimary }}>
              {formData.budget_min} - {formData.budget_max} {formData.currency}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: THEME_COLORS.textSecondary }}>
              🎯 Niveau d'Attribution:
            </Typography>
            <Typography sx={{ fontWeight: 600, color: THEME_COLORS.primary }}>
              {awardLevelLabel[formData.awardLevel] || 'Non défini'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: THEME_COLORS.textSecondary }}>Lots:</Typography>
            <Typography sx={{ fontWeight: 600, color: THEME_COLORS.textPrimary }}>
              {(formData.lots || []).length}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: THEME_COLORS.textSecondary }}>Exigences:</Typography>
            <Typography sx={{ fontWeight: 600, color: THEME_COLORS.textPrimary }}>
              {(formData.requirements || []).length}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ color: THEME_COLORS.textSecondary }}>Visibilité:</Typography>
            <Typography sx={{ fontWeight: 600, color: THEME_COLORS.textPrimary }}>
              {formData.is_public ? 'Public' : 'Privé'}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Detailed Lots Section */}
      {(formData.lots || []).length > 0 && (
        <Paper sx={{ p: '20px', backgroundColor: THEME_COLORS.bgDefault, borderRadius: '4px' }}>
          <Typography
            sx={{ fontSize: '14px', fontWeight: 600, color: THEME_COLORS.primary, mb: '16px' }}
          >
            📦 Détail des Lots et Articles
          </Typography>

          <Stack spacing={2}>
            {formData.lots.map((lot, idx) => (
              <Box
                key={idx}
                sx={{
                  p: '12px',
                  backgroundColor: THEME_COLORS.bgPaper,
                  border: `1px solid ${THEME_COLORS.divider}`,
                  borderRadius: '4px',
                  borderLeft: `4px solid ${THEME_COLORS.primary}`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: THEME_COLORS.textPrimary,
                    mb: '8px',
                  }}
                >
                  Lot {lot.numero}: {lot.objet}
                </Typography>

                {(lot.articles || []).length > 0 && (
                  <Stack spacing={1} sx={{ ml: '12px' }}>
                    {lot.articles.map((article, aIdx) => (
                      <Box
                        key={aIdx}
                        sx={{
                          p: '6px',
                          backgroundColor: THEME_COLORS.bgDefault,
                          borderRadius: '2px',
                          fontSize: '11px',
                          color: THEME_COLORS.textSecondary,
                        }}
                      >
                        • <strong>{article.name}</strong> : {article.quantity} {article.unit}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Contact Info */}
      <Box>
        <Typography
          sx={{ fontSize: '13px', fontWeight: 600, color: THEME_COLORS.textPrimary, mb: '12px' }}
        >
          Informations de Contact
        </Typography>

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Personne de contact"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleChange}
            disabled={loading}
            size="small"
          />

          <TextField
            fullWidth
            label="Adresse e-mail"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            disabled={loading}
            size="small"
            type="email"
          />

          <TextField
            fullWidth
            label="Numéro de téléphone"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            disabled={loading}
            size="small"
          />
        </Stack>
      </Box>
    </Box>
  );
}