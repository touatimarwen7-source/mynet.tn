import React from 'react';
import institutionalTheme from '../theme/theme';
import {
  Container, Box, Card, CardContent, Button, Typography, Alert,
  CircularProgress, Stack, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import StepSeven from './TenderSteps/StepSeven';
import { autosaveDraft } from '../utils/draftStorageHelper';

const STAGES = [
  { name: 'Informations', description: 'Détails généraux' },
  { name: 'Lots', description: 'Division en lots' },
  { name: 'Exigences', description: 'Critères obligatoires' },
  { name: 'Évaluation', description: 'Critères d\'évaluation' },
  { name: 'Spécifications', description: 'Cahier des charges et documents' },
  { name: 'Finalisation', description: 'Révision finale' },
];

/**
 * Layout component for the multi-step tender creation form.
 * It handles the overall structure, header, progress, and navigation.
 * @param {object} props
 * @param {React.ReactNode} props.children - The content of the current step.
 * @param {number} props.currentStep - The current active step index.
 * @param {string} props.error - The current error message.
 * @param {boolean} props.loading - The loading state.
 * @param {Function} props.handlePrevious - Function to go to the previous step.
 * @param {Function} props.handleNext - Function to go to the next step.
 * @param {Function} props.handleSubmit - Function to submit the form.
 * @param {boolean} props.showPreview - State for the preview dialog.
 * @param {Function} props.setShowPreview - Function to toggle the preview dialog.
 * @param {boolean} props.showExit - State for the exit dialog.
 * @param {Function} props.setShowExit - Function to toggle the exit dialog.
 * @param {object} props.formData - The form data for preview.
 * @param {number} props.totalCriteria - The total of evaluation criteria.
 * @param {Function} props.navigate - The navigate function from react-router-dom.
 * @returns {JSX.Element}
 */
const TenderFormLayout = ({
  children, currentStep, error, loading, handlePrevious, handleNext, handleSubmit,
  showPreview, setShowPreview, showExit, setShowExit, formData, totalCriteria, navigate
}) => {
  const progress = ((currentStep + 1) / STAGES.length) * 100;

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', paddingY: '40px', minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Card sx={{ border: '1px solid #E0E0E0', borderRadius: '4px', boxShadow: 'none' }}>
          <CardContent sx={{ padding: '40px' }}>
            {/* Header */}
            <Box sx={{ marginBottom: '32px' }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#999999', textTransform: 'uppercase', mb: '8px' }}>
                Étape {currentStep + 1} sur {STAGES.length}
              </Typography>
              <Typography variant="h2" sx={{ fontSize: '28px', fontWeight: 500, color: institutionalTheme.palette.primary.main, mb: '8px' }}>
                {STAGES[currentStep].name}
              </Typography>
              <Typography sx={{ fontSize: '14px', color: '#616161' }}>
                {STAGES[currentStep].description}
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ height: '4px', backgroundColor: '#E0E0E0', borderRadius: '2px', mb: '32px' }}>
              <Box sx={{ height: '100%', backgroundColor: institutionalTheme.palette.primary.main, width: `${progress}%`, transition: 'width 0.3s ease', borderRadius: '2px' }} />
            </Box>

            {error && <Alert severity="error" sx={{ marginBottom: '24px' }}>{error}</Alert>}

            <Box sx={{ minHeight: '300px', marginBottom: '32px' }}>{children}</Box>

            {/* Navigation */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="outlined" onClick={handlePrevious} disabled={currentStep === 0 || loading} sx={{ color: institutionalTheme.palette.primary.main, borderColor: '#0056B3', textTransform: 'none', fontWeight: 600, minHeight: '44px' }}>
                Précédent
              </Button>

              {currentStep === STAGES.length - 1 ? (
                <>
                  <Button variant="outlined" onClick={() => setShowPreview(true)} disabled={loading || totalCriteria !== 100} sx={{ flex: 1, color: institutionalTheme.palette.primary.main, borderColor: institutionalTheme.palette.primary.main, textTransform: 'none', fontWeight: 600, minHeight: '44px' }}>
                    📋 Aperçu
                  </Button>
                  <Button variant="contained" onClick={handleSubmit} disabled={loading || totalCriteria !== 100} startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />} sx={{ flex: 1, backgroundColor: institutionalTheme.palette.primary.main, color: '#ffffff', textTransform: 'none', fontWeight: 600, minHeight: '44px', '&:hover': { backgroundColor: '#0d47a1' }, '&:disabled': { backgroundColor: '#bdbdbd' } }}>
                    {loading ? 'Création...' : 'Créer l\'Appel d\'Offres'}
                  </Button>
                </>
              ) : (
                <Button variant="contained" onClick={handleNext} disabled={loading} sx={{ flex: 1, backgroundColor: institutionalTheme.palette.primary.main, color: '#ffffff', textTransform: 'none', fontWeight: 600, minHeight: '44px' }}>
                  Suivant
                </Button>
              )}

              <Button variant="outlined" onClick={() => setShowExit(true)} disabled={loading} startIcon={<CancelIcon />} sx={{ color: '#d32f2f', borderColor: '#d32f2f', textTransform: 'none', fontWeight: 600, minHeight: '44px' }}>
                Annuler
              </Button>
            </Stack>

            <Button variant="text" size="small" onClick={() => autosaveDraft('tender_draft', formData, true)} startIcon={<SaveIcon />} sx={{ marginTop: '16px', color: '#616161', textTransform: 'none' }}>
              Enregistrer le brouillon
            </Button>
          </CardContent>
        </Card>
      </Container>

      {/* Dialogs */}
      <Dialog open={showPreview} onClose={() => setShowPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: institutionalTheme.palette.primary.main, color: '#fff' }}>📋 Aperçu de votre Appel d'Offres</DialogTitle>
        <DialogContent sx={{ paddingY: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          <StepSeven formData={formData} handleChange={() => {}} loading={loading} />
        </DialogContent>
        <DialogActions sx={{ padding: '16px', borderTop: '1px solid #E0E0E0' }}>
          <Button onClick={() => setShowPreview(false)} sx={{ color: '#666' }}>Revenir</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading || totalCriteria !== 100} startIcon={loading ? <CircularProgress size={18} /> : <CheckCircleIcon />} sx={{ backgroundColor: institutionalTheme.palette.primary.main, color: '#fff' }}>
            {loading ? 'Création...' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showExit} onClose={() => setShowExit(false)}>
        <DialogTitle>Quitter l'Assistante?</DialogTitle>
        <DialogContent><Typography>Votre brouillon a été automatiquement sauvegardé. Vous pouvez le reprendre plus tard.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExit(false)} sx={{ color: institutionalTheme.palette.primary.main }}>Continuer</Button>
          <Button onClick={() => { setShowExit(false); navigate('/tenders'); }} sx={{ color: '#d32f2f' }}>Quitter</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenderFormLayout;