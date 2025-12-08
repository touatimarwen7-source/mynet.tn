/**
 * Sidebar menu definitions for all user roles
 * Organized by role: buyer, supplier, admin, super_admin
 */

import DashboardIcon from '@mui/icons-material/Dashboard';
import GavelIcon from '@mui/icons-material/Gavel';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SecurityIcon from '@mui/icons-material/Security';
import BarChartIcon from '@mui/icons-material/BarChart';
import FolderIcon from '@mui/icons-material/Folder';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ArticleIcon from '@mui/icons-material/Article';
import CodeIcon from '@mui/icons-material/Code';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';

// النظام الموحد - القوائم الديناميكية حسب الدور
export const getMenuByRole = (role, permissions = null) => {
  const menus = {
    buyer: [
      { text: 'لوحة التحكم', icon: DashboardIcon, path: '/buyer-dashboard' },
      { text: 'المناقصات', icon: GavelIcon, path: '/tenders' },
      { text: 'إنشاء مناقصة', icon: GavelIcon, path: '/create-tender' },
      { text: 'العروض', icon: LocalOfferIcon, path: '/buyer-active-tenders' },
      { text: 'التقارير', icon: AssessmentIcon, path: '/financial-reports' },
      { text: 'الملف الشخصي', icon: PersonIcon, path: '/profile' },
      { text: 'الإعدادات', icon: SettingsIcon, path: '/settings' },
    ],
    supplier: [
      { text: 'لوحة التحكم', icon: DashboardIcon, path: '/supplier-dashboard' },
      { text: 'المناقصات المتاحة', icon: GavelIcon, path: '/tenders' },
      { text: 'عروضي', icon: LocalOfferIcon, path: '/my-offers' },
      { text: 'الفواتير', icon: ShoppingCartIcon, path: '/supplier-invoices' },
      { text: 'الملف الشخصي', icon: PersonIcon, path: '/profile' },
      { text: 'الإعدادات', icon: SettingsIcon, path: '/settings' },
    ],
    admin: buildAdminMenu(permissions),
    super_admin: [
      { text: 'لوحة التحكم', icon: DashboardIcon, path: '/super-admin' },
      { text: 'مركز التحكم الكامل', icon: AdminPanelSettingsIcon, path: '/super-admin' },
      { text: 'إدارة المستخدمين', icon: PeopleIcon, path: '/super-admin/users' },
      { text: 'الأدوار والصلاحيات', icon: SecurityIcon, path: '/super-admin/roles' },
      { text: 'المساعدون الإداريون', icon: SupervisedUserCircleIcon, path: '/super-admin/assistants' },
      { text: 'التحليلات المتقدمة', icon: BarChartIcon, path: '/super-admin/analytics' },
      { text: 'إدارة الملفات', icon: FolderIcon, path: '/super-admin/files' },
      { text: 'الإشعارات', icon: NotificationsIcon, path: '/super-admin/notifications' },
      { text: 'إدارة المحتوى', icon: ArticleIcon, path: '/super-admin/content' },
      { text: 'محرر الصفحات', icon: CodeIcon, path: '/super-admin/page-editor' },
      { text: 'التحكم بالميزات', icon: SettingsIcon, path: '/super-admin/features' },
    ],
  };

  return menus[role] || menus.buyer;
};

// بناء قائمة المساعد الإداري حسب صلاحياته
function buildAdminMenu(permissions) {
  const baseMenu = [{ text: 'لوحة التحكم', icon: DashboardIcon, path: '/admin-dashboard' }];

  const permissionMap = {
    manage_users: { text: 'إدارة المستخدمين', icon: PeopleIcon, path: '/admin/users' },
    view_users: { text: 'عرض المستخدمين', icon: PeopleIcon, path: '/admin/users' },
    manage_tenders: { text: 'إدارة المناقصات', icon: GavelIcon, path: '/admin/tenders' },
    view_reports: { text: 'التقارير', icon: AssessmentIcon, path: '/admin/reports' },
    manage_settings: { text: 'الإعدادات', icon: SettingsIcon, path: '/admin/settings' },
  };

  if (permissions && Array.isArray(permissions)) {
    permissions.forEach((perm) => {
      if (permissionMap[perm] && !baseMenu.find((m) => m.path === permissionMap[perm].path)) {
        baseMenu.push(permissionMap[perm]);
      }
    });
  } else {
    // الصلاحيات الافتراضية للمساعد الإداري
    baseMenu.push(
      { text: 'إدارة المستخدمين', icon: PeopleIcon, path: '/admin/users' },
      { text: 'التقارير', icon: AssessmentIcon, path: '/admin/reports' },
      { text: 'الإعدادات', icon: SettingsIcon, path: '/admin/settings' }
    );
  }

  return baseMenu;
}

// للتوافق مع الكود القديم - تصدير القوائم
export const buyerMenu = getMenuByRole('buyer');
export const supplierMenu = getMenuByRole('supplier');
export const superAdminMenu = getMenuByRole('super_admin');
export const adminMenu = buildAdminMenu(null);

/**
 * Get menu items based on user role
 * @param {string} role - User role (buyer, supplier, admin, super_admin)
 * @returns {Array} Menu configuration for the role
 */
export const getMenuByRole = (role) => {
  if (!role || typeof role !== 'string') {
    console.warn('Invalid role provided to getMenuByRole:', role);
    return buyerMenu;
  }

  const normalizedRole = role.toLowerCase().trim();

  switch (normalizedRole) {
    case 'buyer':
      return buyerMenu;
    case 'supplier':
      return supplierMenu;
    case 'admin':
      return adminMenu;
    case 'super_admin':
    case 'superadmin':
      return superAdminMenu;
    default:
      console.warn('Unknown role, using buyer menu as fallback:', role);
      return buyerMenu;
  }
};