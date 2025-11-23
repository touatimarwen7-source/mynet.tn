import { createContext, useState, useCallback } from 'react';
import superAdminService from '../services/superAdminService';

/**
 * 🎯 SUPER ADMIN CONTEXT
 * Global state management for super admin operations
 */

export const SuperAdminContext = createContext();

export function SuperAdminProvider({ children }) {
  const [pages, setPages] = useState([]);
  const [files, setFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [emails, setEmails] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [backups, setBackups] = useState([]);
  const [plans, setPlans] = useState([]);
  const [features, setFeatures] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ===== PAGES =====
  const fetchPages = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.pages.list(params);
      setPages(response.data?.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPage = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.pages.create(data);
      setPages([...pages, response.data.data]);
      setSuccess('Page created successfully');
      setTimeout(() => setSuccess(null), 3000);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [pages]);

  const updatePage = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.pages.update(id, data);
      setPages(pages.map(p => p.id === id ? response.data.data : p));
      setSuccess('Page updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [pages]);

  const deletePage = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await superAdminService.pages.delete(id);
      setPages(pages.filter(p => p.id !== id));
      setSuccess('Page deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [pages]);

  // ===== FILES =====
  const fetchFiles = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.files.list(params);
      setFiles(response.data?.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadFile = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.files.upload(data);
      setFiles([...files, response.data.data]);
      setSuccess('File uploaded successfully');
      setTimeout(() => setSuccess(null), 3000);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [files]);

  const deleteFile = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await superAdminService.files.delete(id);
      setFiles(files.filter(f => f.id !== id));
      setSuccess('File deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [files]);

  // ===== DOCUMENTS =====
  const fetchDocuments = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.documents.list(params);
      setDocuments(response.data?.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDocument = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.documents.create(data);
      setDocuments([...documents, response.data.data]);
      setSuccess('Document created successfully');
      setTimeout(() => setSuccess(null), 3000);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [documents]);

  const deleteDocument = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await superAdminService.documents.delete(id);
      setDocuments(documents.filter(d => d.id !== id));
      setSuccess('Document deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [documents]);

  // ===== USERS =====
  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.users.list(params);
      setUsers(response.data?.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserRole = useCallback(async (id, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.users.updateRole(id, { role });
      setUsers(users.map(u => u.id === id ? { ...u, role } : u));
      setSuccess('User role updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [users]);

  const blockUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await superAdminService.users.block(id);
      setUsers(users.map(u => u.id === id ? { ...u, is_active: false } : u));
      setSuccess('User blocked successfully');
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [users]);

  const unblockUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await superAdminService.users.unblock(id);
      setUsers(users.map(u => u.id === id ? { ...u, is_active: true } : u));
      setSuccess('User unblocked successfully');
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [users]);

  // ===== EMAILS =====
  const fetchEmails = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.emails.list(params);
      setEmails(response.data?.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendEmail = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.emails.send(data);
      setEmails([response.data.data, ...emails]);
      setSuccess('Email sent successfully');
      setTimeout(() => setSuccess(null), 3000);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [emails]);

  // ===== AUDIT LOGS =====
  const fetchAuditLogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.auditLogs.list(params);
      setAuditLogs(response.data?.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== BACKUP =====
  const fetchBackups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.backup.list();
      setBackups(response.data?.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBackup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.backup.create();
      setBackups([response.data.data, ...backups]);
      setSuccess('Backup created successfully');
      setTimeout(() => setSuccess(null), 3000);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [backups]);

  const restoreBackup = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await superAdminService.backup.restore(id);
      setSuccess('Backup restored successfully');
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== SUBSCRIPTION PLANS =====
  const fetchSubscriptionPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.subscriptionPlans.list();
      setPlans(response.data?.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSubscriptionPlan = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.subscriptionPlans.create(data);
      setPlans([...plans, response.data.data]);
      setSuccess('Plan created successfully');
      setTimeout(() => setSuccess(null), 3000);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [plans]);

  const updateSubscriptionPlan = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.subscriptionPlans.update(id, data);
      setPlans(plans.map(p => p.id === id ? response.data.data : p));
      setSuccess('Plan updated successfully');
      setTimeout(() => setSuccess(null), 3000);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [plans]);

  const deleteSubscriptionPlan = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await superAdminService.subscriptionPlans.delete(id);
      setPlans(plans.filter(p => p.id !== id));
      setSuccess('Plan deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [plans]);

  // ===== FEATURES =====
  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.features.list();
      setFeatures(response.data?.data || []);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFeature = useCallback(async (id, enabled) => {
    setLoading(true);
    setError(null);
    try {
      const response = await superAdminService.features.toggle(id, { enabled });
      setFeatures(features.map(f => f.id === id ? response.data.data : f));
      setSuccess(`Feature ${enabled ? 'enabled' : 'disabled'} successfully`);
      setTimeout(() => setSuccess(null), 3000);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [features]);

  const value = {
    // State
    pages,
    files,
    documents,
    users,
    emails,
    auditLogs,
    backups,
    plans,
    features,
    loading,
    error,
    success,

    // Pages
    fetchPages,
    createPage,
    updatePage,
    deletePage,

    // Files
    fetchFiles,
    uploadFile,
    deleteFile,

    // Documents
    fetchDocuments,
    createDocument,
    deleteDocument,

    // Users
    fetchUsers,
    updateUserRole,
    blockUser,
    unblockUser,

    // Emails
    fetchEmails,
    sendEmail,

    // Audit Logs
    fetchAuditLogs,

    // Backup
    fetchBackups,
    createBackup,
    restoreBackup,

    // Subscription Plans
    fetchSubscriptionPlans,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,

    // Features
    fetchFeatures,
    toggleFeature
  };

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  );
}
