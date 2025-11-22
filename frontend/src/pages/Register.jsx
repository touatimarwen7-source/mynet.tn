import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { authAPI } from '../api';
import { setPageTitle } from '../utils/pageTitle';

export default function Register() {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') || 'supplier';
  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle('Inscription');
  }, []);

  const [roleSelected, setRoleSelected] = useState(!!searchParams.get('role'));
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: roleFromUrl,
    company_name: '',
    company_registration: '',
    company_type: '',
    product_range: '',
    subcategory: '',
    year_founded: new Date().getFullYear().toString(),
    num_employees: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelection = (selectedRole) => {
    setFormData(prev => ({ ...prev, role: selectedRole }));
    setRoleSelected(true);
  };

  // Company data
  const companyTypes = ['Négociant', 'Fabricant', 'Distributeur', 'Prestataire', 'Autre'];
  const productRanges = {
    'Négociant': ['Électronique', 'Fournitures de Bureau', 'Matériaux de Construction', 'Alimentaire'],
    'Fabricant': ['Électronique', 'Mécanique', 'Chimie', 'Textile', 'Agroalimentaire'],
    'Distributeur': ['Électronique', 'Électroménager', 'Quincaillerie', 'Logistique'],
    'Prestataire': ['Informatique', 'Consulting', 'Maintenance', 'Transport', 'Nettoyage'],
    'Autre': ['Autre']
  };
  const subcategories = {
    'Électronique': ['Composants', 'Équipements', 'Accessoires'],
    'Fournitures de Bureau': ['Papeterie', 'Mobilier', 'Équipements'],
    'Matériaux de Construction': ['Matériaux Bruts', 'Produits Finis', 'Outillage'],
    'Alimentaire': ['Produits Frais', 'Produits Secs', 'Boissons'],
    'Mécanique': ['Pièces', 'Assemblages', 'Usinage'],
    'Chimie': ['Produits Chimiques', 'Produits Pharmaceutiques'],
    'Textile': ['Tissus', 'Vêtements', 'Accessoires'],
    'Agroalimentaire': ['Fruits', 'Légumes', 'Produits Transformés'],
    'Électroménager': ['Petit Électroménager', 'Gros Électroménager'],
    'Quincaillerie': ['Outils', 'Quincaillerie Fine', 'Accessoires'],
    'Informatique': ['Développement', 'Infrastructure', 'Support'],
    'Consulting': ['Conseil Stratégique', 'Audit', 'Formation'],
    'Maintenance': ['Maintenance Préventive', 'Maintenance Corrective'],
    'Transport': ['Transport Routier', 'Transport Maritime', 'Logistique'],
    'Nettoyage': ['Nettoyage Général', 'Nettoyage Spécialisé'],
    'Autre': ['Autre']
  };

  const steps = ['Informations Générales', 'Informations de l\'Entreprise', 'Informations de l\'Activité'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    
    if (name === 'company_type') {
      updatedData.product_range = '';
      updatedData.subcategory = '';
    }
    
    if (name === 'product_range') {
      updatedData.subcategory = '';
    }
    
    setFormData(updatedData);
  };

  const validateStep = () => {
    setError('');
    
    if (currentStep === 0) {
      if (!formData.username.trim()) {
        setError('Le nom d\'utilisateur est requis');
        return false;
      }
      if (!formData.email.trim()) {
        setError('L\'e-mail est requis');
        return false;
      }
      if (!formData.password.trim()) {
        setError('Le mot de passe est requis');
        return false;
      }
      if (!formData.full_name.trim()) {
        setError('Le nom complet est requis');
        return false;
      }
      if (!formData.phone.trim()) {
        setError('Le téléphone est requis');
        return false;
      }
    }
    
    if (currentStep === 1) {
      if (!formData.company_name.trim()) {
        setError('Le nom de l\'entreprise est requis');
        return false;
      }
      if (!formData.company_registration.trim()) {
        setError('Le numéro d\'enregistrement est requis');
        return false;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.company_type) {
        setError('Le type d\'entreprise est requis');
        return false;
      }
      if (!formData.product_range) {
        setError('Le secteur d\'activité est requis');
        return false;
      }
      if (!formData.subcategory) {
        setError('La sous-catégorie est requise');
        return false;
      }
      if (!formData.year_founded) {
        setError('L\'année de fondation est requise');
        return false;
      }
      if (!formData.num_employees) {
        setError('Le nombre d\'employés est requis');
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    
    setError('');
    setLoading(true);

    try {
      await authAPI.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const getRoleContent = () => {
    if (formData.role === 'buyer') {
      return {
        icon: '🏢',
        title: 'Créer un Compte Acheteur',
        subtitle: 'Publiez vos appels d\'offres et trouvez les meilleurs fournisseurs',
        benefits: [
          'Créer et gérer des appels d\'offres',
          'Recevoir et analyser les offres',
          'Utiliser l\'analyse IA pour décider',
          'Gestion complète de l\'équipe d\'achat'
        ]
      };
    } else {
      return {
        icon: '🏭',
        title: 'Créer un Compte Fournisseur',
        subtitle: 'Découvrez les opportunités et remportez des marchés',
        benefits: [
          'Parcourir les appels d\'offres',
          'Soumettre vos offres sécurisées',
          'Gérer votre catalogue de produits',
          'Suivre votre performance et revenus'
        ]
      };
    }
  };

  const roleContent = getRoleContent();

  // Role Selection Screen
  if (!roleSelected) {
    return (
      <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh', paddingY: '60px' }}>
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: '8px', boxShadow: 'none' }}>
            <CardContent sx={{ padding: '48px 40px' }}>
              {/* Header */}
              <Box sx={{ textAlign: 'center', marginBottom: '48px' }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: '28px',
                    fontWeight: 500,
                    color: '#0056B3',
                    marginBottom: '16px',
                  }}
                >
                  Sélectionner votre Rôle
                </Typography>
                <Typography sx={{ color: '#616161', fontSize: '14px' }}>
                  Choisissez le type de compte que vous souhaitez créer
                </Typography>
              </Box>

              {/* Role Selection Cards */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Buyer Option */}
                <Card
                  sx={{
                    cursor: 'pointer',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: '#0056B3',
                      boxShadow: '0 4px 12px rgba(0, 86, 179, 0.15)',
                    },
                    padding: '24px',
                  }}
                  onClick={() => handleRoleSelection('buyer')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <Typography sx={{ fontSize: '48px' }}>🏢</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: '18px',
                          fontWeight: 600,
                          color: '#212121',
                          marginBottom: '8px',
                        }}
                      >
                        Compte Acheteur
                      </Typography>
                      <Typography sx={{ fontSize: '14px', color: '#616161', marginBottom: '12px' }}>
                        Publiez vos appels d'offres et trouvez les meilleurs fournisseurs
                      </Typography>
                      <List sx={{ padding: 0 }}>
                        {['Créer et gérer des appels d\'offres', 'Recevoir et analyser les offres', 'Gestion complète de l\'équipe d\'achat'].map((benefit, idx) => (
                          <ListItem key={idx} sx={{ paddingLeft: 0, paddingTop: '4px', paddingBottom: '4px' }}>
                            <ListItemIcon sx={{ minWidth: 24, color: '#2e7d32' }}>
                              <CheckCircleIcon sx={{ fontSize: 16 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={benefit}
                              sx={{
                                '& .MuiTypography-root': {
                                  fontSize: '12px',
                                  color: '#212121',
                                },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                </Card>

                {/* Supplier Option */}
                <Card
                  sx={{
                    cursor: 'pointer',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: '#0056B3',
                      boxShadow: '0 4px 12px rgba(0, 86, 179, 0.15)',
                    },
                    padding: '24px',
                  }}
                  onClick={() => handleRoleSelection('supplier')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <Typography sx={{ fontSize: '48px' }}>🏭</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: '18px',
                          fontWeight: 600,
                          color: '#212121',
                          marginBottom: '8px',
                        }}
                      >
                        Compte Fournisseur
                      </Typography>
                      <Typography sx={{ fontSize: '14px', color: '#616161', marginBottom: '12px' }}>
                        Découvrez les opportunités et remportez des marchés
                      </Typography>
                      <List sx={{ padding: 0 }}>
                        {['Parcourir les appels d\'offres', 'Soumettre vos offres sécurisées', 'Gérer votre catalogue de produits'].map((benefit, idx) => (
                          <ListItem key={idx} sx={{ paddingLeft: 0, paddingTop: '4px', paddingBottom: '4px' }}>
                            <ListItemIcon sx={{ minWidth: 24, color: '#2e7d32' }}>
                              <CheckCircleIcon sx={{ fontSize: 16 }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={benefit}
                              sx={{
                                '& .MuiTypography-root': {
                                  fontSize: '12px',
                                  color: '#212121',
                                },
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  </Box>
                </Card>
              </Box>

              <Typography sx={{ marginTop: '32px', textAlign: 'center', color: '#616161' }}>
                Déjà inscrit?{' '}
                <Link
                  href="/login"
                  sx={{
                    color: '#0056B3',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Se connecter
                </Link>
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  // Multi-step Registration Form
  return (
    <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh', paddingY: '60px' }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: '8px', boxShadow: 'none' }}>
          <CardContent sx={{ padding: '48px 40px' }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', marginBottom: '32px' }}>
              <Typography sx={{ fontSize: '48px', marginBottom: '16px' }}>
                {roleContent.icon}
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontSize: '28px',
                  fontWeight: 500,
                  color: '#0056B3',
                  marginBottom: '8px',
                }}
              >
                {roleContent.title}
              </Typography>
              <Typography sx={{ color: '#616161', fontSize: '14px' }}>
                {roleContent.subtitle}
              </Typography>
            </Box>

            {/* Benefits */}
            <Box sx={{ marginBottom: '32px', backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '4px' }}>
              <List sx={{ padding: 0 }}>
                {roleContent.benefits.map((benefit, idx) => (
                  <ListItem key={idx} sx={{ paddingLeft: 0, paddingTop: '8px', paddingBottom: '8px' }}>
                    <ListItemIcon sx={{ minWidth: 32, color: '#2e7d32' }}>
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={benefit}
                      sx={{
                        '& .MuiTypography-root': {
                          fontSize: '14px',
                          color: '#212121',
                          fontWeight: 400,
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Stepper */}
            <Box sx={{ marginBottom: '32px' }}>
              <Stepper activeStep={currentStep}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {error && (
              <Alert severity="error" sx={{ marginBottom: '24px' }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Step 0: Informations Générales */}
              {currentStep === 0 && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, color: '#212121', mb: 2 }}>
                      Informations Générales
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Box>

                  <TextField
                    fullWidth
                    label="Nom d'utilisateur"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Entrez votre nom d'utilisateur"
                    required
                    disabled={loading}
                  />

                  <TextField
                    fullWidth
                    label="E-mail"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Entrez votre adresse e-mail"
                    required
                    disabled={loading}
                  />

                  <TextField
                    fullWidth
                    label="Mot de passe"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Entrez un mot de passe sécurisé"
                    required
                    disabled={loading}
                  />

                  <TextField
                    fullWidth
                    label="Nom complet"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Votre nom complet"
                    disabled={loading}
                  />

                  <TextField
                    fullWidth
                    label="Téléphone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Votre numéro de téléphone"
                    disabled={loading}
                  />
                </>
              )}

              {/* Step 1: Informations de l'Entreprise */}
              {currentStep === 1 && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, color: '#212121', mb: 2 }}>
                      Informations de l'Entreprise
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Box>

                  <TextField
                    fullWidth
                    label="Nom de l'entreprise"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Nom de votre entreprise"
                    disabled={loading}
                  />

                  <TextField
                    fullWidth
                    label="Numéro d'enregistrement"
                    name="company_registration"
                    value={formData.company_registration}
                    onChange={handleChange}
                    placeholder="Numéro d'enregistrement commercial"
                    disabled={loading}
                  />
                </>
              )}

              {/* Step 2: Informations de l'Activité */}
              {currentStep === 2 && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600, color: '#212121', mb: 2 }}>
                      Informations de l'Activité
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Box>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Type d'Entreprise</InputLabel>
                    <Select
                      name="company_type"
                      value={formData.company_type}
                      onChange={handleChange}
                      label="Type d'Entreprise"
                      disabled={loading}
                    >
                      <MenuItem value="">Sélectionner un type</MenuItem>
                      {companyTypes.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {formData.company_type && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Secteur d'Activité</InputLabel>
                      <Select
                        name="product_range"
                        value={formData.product_range}
                        onChange={handleChange}
                        label="Secteur d'Activité"
                        disabled={loading}
                      >
                        <MenuItem value="">Sélectionner un secteur</MenuItem>
                        {productRanges[formData.company_type]?.map(range => (
                          <MenuItem key={range} value={range}>{range}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {formData.product_range && (
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Sous-Catégorie</InputLabel>
                      <Select
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        label="Sous-Catégorie"
                        disabled={loading}
                      >
                        <MenuItem value="">Sélectionner une sous-catégorie</MenuItem>
                        {subcategories[formData.product_range]?.map(sub => (
                          <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                    <TextField
                      label="Année de Fondation"
                      type="number"
                      name="year_founded"
                      value={formData.year_founded}
                      onChange={handleChange}
                      disabled={loading}
                      inputProps={{ min: 1900, max: new Date().getFullYear() }}
                    />

                    <TextField
                      label="Nombre d'Employés"
                      type="number"
                      name="num_employees"
                      value={formData.num_employees}
                      onChange={handleChange}
                      placeholder="Ex: 50"
                      disabled={loading}
                      inputProps={{ min: 1 }}
                    />
                  </Box>
                </>
              )}

              {/* Navigation Buttons */}
              <Box sx={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  disabled={currentStep === 0 || loading}
                  onClick={handleBack}
                  sx={{
                    minHeight: '44px',
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '16px',
                    color: '#0056B3',
                    borderColor: '#0056B3',
                    '&:hover': { 
                      backgroundColor: '#f0f7ff',
                      borderColor: '#0056B3'
                    },
                  }}
                >
                  Précédent
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading}
                    sx={{
                      minHeight: '44px',
                      backgroundColor: '#0056B3',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '16px',
                      '&:hover': { backgroundColor: '#0d47a1' },
                    }}
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    sx={{
                      minHeight: '44px',
                      backgroundColor: '#0056B3',
                      textTransform: 'none',
                      fontWeight: 500,
                      fontSize: '16px',
                      '&:hover': { backgroundColor: '#0d47a1' },
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CircularProgress size={20} sx={{ color: '#fff' }} />
                        Inscription en cours...
                      </Box>
                    ) : (
                      'S\'inscrire'
                    )}
                  </Button>
                )}
              </Box>
            </Box>

            <Typography sx={{ marginTop: '24px', textAlign: 'center', color: '#616161' }}>
              Déjà inscrit?{' '}
              <Link
                href="/login"
                sx={{
                  color: '#0056B3',
                  textDecoration: 'none',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Se connecter
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
