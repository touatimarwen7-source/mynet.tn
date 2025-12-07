import { Grid } from '@mui/material';
import PremiumStatsCard from './PremiumStatsCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudDoneIcon from '@mui/icons-material/CloudDone';

export default function HomePageStats() {
  const stats = [
    {
      number: '250M+',
      label: 'Dinars',
      description: 'Volumes de transactions annuels traités en toute sécurité',
    },
    {
      number: '2,500+',
      label: 'Organisations',
      description: 'Acheteurs, fournisseurs et entreprises partenaires actifs',
    },
    {
      number: '45,000+',
      label: "Appels d'Offres",
      description: 'Gérés avec transparence et conformité réglementaire',
    },
    {
      number: '99.9%',
      label: 'Disponibilité',
      description: 'Infrastructure cloud sécurisée et certifiée ISO',
    },
  ];

  const icons = [AttachMoneyIcon, BusinessIcon, DescriptionIcon, CloudDoneIcon];
  const colors = ['primary', 'success', 'warning', 'info'];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, idx) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
          <PremiumStatsCard
            number={stat.number}
            label={stat.label}
            description={stat.description}
            icon={icons[idx]}
            color={colors[idx]}
            trend={idx === 0 ? '+12% ce mois' : undefined}
          />
        </Grid>
      ))}
    </Grid>
  );
}
