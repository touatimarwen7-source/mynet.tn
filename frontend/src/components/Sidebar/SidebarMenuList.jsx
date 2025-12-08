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

  // Comprehensive menu validation
  const validatedMenu = useMemo(() => {
    console.log('SidebarMenuList: Validating menu:', menu);
    
    if (!menu) {
      console.warn('SidebarMenuList: Menu is null/undefined');
      return [];
    }
    
    if (!Array.isArray(menu)) {
      console.error('SidebarMenuList: Menu is not an array:', typeof menu);
      return [];
    }
    
    if (menu.length === 0) {
      console.warn('SidebarMenuList: Menu array is empty');
      return [];
    }
    
    // Filter out invalid items
    const validItems = menu.filter(item => {
      if (!item) {
        console.warn('SidebarMenuList: Null/undefined menu item found');
        return false;
      }
      if (!item.id) {
        console.warn('SidebarMenuList: Menu item missing id:', item);
        return false;
      }
      if (!item.label && !item.text) {
        console.warn('SidebarMenuList: Menu item missing label:', item);
        return false;
      }
      return true;
    });
    
    console.log('SidebarMenuList: Validated', validItems.length, 'menu items');
    return validItems;
  }, [menu]);

  // Safety check for menu
  if (validatedMenu.length === 0) {
    console.warn('SidebarMenuList: No valid menu items to display');
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
      {validatedMenu.map((item) => {
        // Get icon and determine structure
        const IconComponent = iconMap[item.id];
        const hasSubItems = Array.isArray(item.subItems) && item.subItems.length > 0;
        const itemLabel = item.label || item.text;
        const itemPath = item.path || item.link;
        
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
                    primary={itemLabel}
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
                    {item.subItems.map((subItem, idx) => {
                      const subPath = subItem.path || subItem.link;
                      const subLabel = subItem.label || subItem.text;
                      return (
                      <ListItemButton
                        key={idx}
                        onClick={() => handleNavigation(subPath, subLabel)}
                        sx={{
                          paddingRight: '16px',
                          paddingTop: '8px',
                          paddingBottom: '8px',
                          marginRight: '8px',
                          marginLeft: '8px',
                          marginTop: '2px',
                          marginBottom: '2px',
                          borderRadius: '4px',
                          backgroundColor: isMenuItemActive(subPath)
                            ? '#e3f2fd'
                            : 'transparent',
                          borderLeft: isMenuItemActive(subPath) ? '4px solid #0056B3' : 'none',
                          paddingLeft: isMenuItemActive(subPath) ? '44px' : '48px',
                          color: isMenuItemActive(subPath)
                            ? theme.palette.primary.main
                            : '#616161',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            color: theme.palette.primary.main,
                          },
                        }}
                      >
                        <ListItemText
                          primary={subLabel}
                          sx={{
                            margin: 0,
                            '& .MuiTypography-root': { fontSize: '13px', fontWeight: 400 },
                          }}
                        />
                      </ListItemButton>
                    )})}
                  </List>
                </Collapse>
              </>
            ) : (
              /* Non-collapsible menu item */
              <ListItemButton
                onClick={() => handleNavigation(itemPath, itemLabel)}
                sx={{
                  padding: '12px 16px',
                  margin: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: isMenuItemActive(itemPath) ? '#e3f2fd' : 'transparent',
                  borderLeft: isMenuItemActive(itemPath) ? '4px solid #0056B3' : 'none',
                  paddingLeft: isMenuItemActive(itemPath) ? '12px' : '16px',
                  color: isMenuItemActive(itemPath)
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
                  primary={itemLabel}
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