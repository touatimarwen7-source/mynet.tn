import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import ImageIcon from '@mui/icons-material/Image';
import StorageIcon from '@mui/icons-material/Storage';
import DescriptionIcon from '@mui/icons-material/Description';
import StaticPagesManager from './StaticPagesManager';

export default function ContentManager() {
  const [currentTab, setCurrentTab] = useState(0);

  const tabs = [
    {
      label: 'Pages Statiques',
      icon: <ArticleIcon />,
      component: <StaticPagesManager />
    },
    {
      label: 'Fichiers',
      icon: <StorageIcon />,
      component: <Box sx={{ p: 2, textAlign: 'center' }}>
        <StorageIcon sx={{ fontSize: 48, color: '#D9D9D9', mb: 1 }} />
        <Typography sx={{ color: '#999999', fontSize: '14px' }}>Gestion des fichiers - Disponible bientôt</Typography>
      </Box>
    },
    {
      label: 'Images',
      icon: <ImageIcon />,
      component: <Box sx={{ p: 2, textAlign: 'center' }}>
        <ImageIcon sx={{ fontSize: 48, color: '#D9D9D9', mb: 1 }} />
        <Typography sx={{ color: '#999999', fontSize: '14px' }}>Galerie d\'images - Disponible bientôt</Typography>
      </Box>
    },
    {
      label: 'Documents',
      icon: <DescriptionIcon />,
      component: <Box sx={{ p: 2, textAlign: 'center' }}>
        <DescriptionIcon sx={{ fontSize: 48, color: '#D9D9D9', mb: 1 }} />
        <Typography sx={{ color: '#999999', fontSize: '14px' }}>Gestion des documents - Disponible bientôt</Typography>
      </Box>
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E0E0E0' }}>
      <Tabs
        value={currentTab}
        onChange={(e, value) => setCurrentTab(value)}
        sx={{
          borderBottom: '1px solid #E0E0E0',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontSize: '13px',
            fontWeight: 500,
            color: '#616161',
            padding: '12px 16px',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
              backgroundColor: '#F0F4FF'
            }
          }
        }}
      >
        {tabs.map((tab, idx) => (
          <Tab
            key={idx}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            sx={{ minWidth: 'auto' }}
          />
        ))}
      </Tabs>

      <Box sx={{ p: 3 }}>
        {tabs[currentTab].component}
      </Box>
    </Box>
  );
}
