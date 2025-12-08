import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { List, ListItemButton, ListItemText, Collapse, Box, Typography } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BuildIcon from '@mui/icons-material/Build';
import GroupIcon from '@mui/icons-material/Group';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from '@mui/icons-material/Settings';
import institutionalTheme from '../../theme/theme';
import { setPageTitle } from '../../utils/pageTitle';

// Icon mapping for menu items
const iconMap = {
  dashboard: DashboardIcon,
  tenders: ShoppingCartIcon,
  finances: AccountBalanceIcon,
  operations: BuildIcon,
  team: GroupIcon,
  notifications: NotificationsIcon,
  profile: PersonIcon,
  catalog: InventoryIcon,
  users: PeopleAltIcon,
  billing: PaymentIcon,
  system: SettingsIcon,
};

/**
 * Sidebar menu list component with collapsible submenu support
 */
export default function SidebarMenuList({ menu = [] }) {
  const theme = institutionalTheme;
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  // Safety check for menu
  if (!menu || !Array.isArray(menu) || menu.length === 0) {
    return (
      <Box sx={{ padding: '16px', textAlign: 'center', color: '#999' }}>
        <Typography variant="body2">Aucun menu disponible</Typography>
      </Box>
    );
  }

  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleNavigation = (path, label) => {
    setPageTitle(label);
    navigate(path);
  };

  const isMenuItemActive = (path) => {
    return location.pathname === path;
  };

  return (
    <List sx={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
      {menu.map((item) => {
        // Safety checks for menu item
        if (!item || !item.id) {
          console.warn('Invalid menu item:', item);
          return null;
        }

        const IconComponent = iconMap[item.id];
        const hasSubItems = Array.isArray(item.subItems) && item.subItems.length > 0;
        
        return (
          <Box key={item.id}>
            {hasSubItems ? (
              <>
                {/* Collapsible menu item */}
                <ListItemButton
                  onClick={() => toggleMenu(item.id)}
                  sx={{
                    padding: '12px 16px',
                    margin: '4px 8px',
                    borderRadius: '4px',
                    color: theme.palette.text.primary,
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  }}
                >
                  {IconComponent && (
                    <IconComponent
                      sx={{
                        marginRight: '12px',
                        fontSize: '20px',
                        color: theme.palette.primary.main,
                      }}
                    />
                  )}
                  <ListItemText
                    primary={item.label}
                    sx={{
                      margin: 0,
                      '& .MuiTypography-root': { fontSize: '14px', fontWeight: 500 },
                    }}
                  />
                  {expandedMenus[item.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>

                {/* Submenu items */}
                <Collapse in={expandedMenus[item.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem, idx) => (
                      <ListItemButton
                        key={idx}
                        onClick={() => handleNavigation(subItem.path, subItem.label)}
                        sx={{
                          paddingRight: '16px',
                          paddingTop: '8px',
                          paddingBottom: '8px',
                          marginRight: '8px',
                          marginLeft: '8px',
                          marginTop: '2px',
                          marginBottom: '2px',
                          borderRadius: '4px',
                          backgroundColor: isMenuItemActive(subItem.path)
                            ? '#e3f2fd'
                            : 'transparent',
                          borderLeft: isMenuItemActive(subItem.path) ? '4px solid #0056B3' : 'none',
                          paddingLeft: isMenuItemActive(subItem.path) ? '44px' : '48px',
                          color: isMenuItemActive(subItem.path)
                            ? theme.palette.primary.main
                            : '#616161',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            color: theme.palette.primary.main,
                          },
                        }}
                      >
                        <ListItemText
                          primary={subItem.label}
                          sx={{
                            margin: 0,
                            '& .MuiTypography-root': { fontSize: '13px', fontWeight: 400 },
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              /* Non-collapsible menu item */
              <ListItemButton
                onClick={() => handleNavigation(item.path, item.label)}
                sx={{
                  padding: '12px 16px',
                  margin: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: isMenuItemActive(item.path) ? '#e3f2fd' : 'transparent',
                  borderLeft: isMenuItemActive(item.path) ? '4px solid #0056B3' : 'none',
                  paddingLeft: isMenuItemActive(item.path) ? '12px' : '16px',
                  color: isMenuItemActive(item.path)
                    ? theme.palette.primary.main
                    : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    color: theme.palette.primary.main,
                  },
                }}
              >
                {IconComponent && (
                  <IconComponent
                    sx={{
                      marginRight: '12px',
                      fontSize: '20px',
                      color: theme.palette.primary.main,
                    }}
                  />
                )}
                <ListItemText
                  primary={item.label}
                  sx={{ margin: 0, '& .MuiTypography-root': { fontSize: '14px', fontWeight: 500 } }}
                />
              </ListItemButton>
            )}
          </Box>
        );
      })}
    </List>
  );
}