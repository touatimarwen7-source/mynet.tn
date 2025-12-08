
import api from './axiosConfig';

export const teamManagementApi = {
  // Get all team members
  getTeamMembers: async () => {
    const response = await api.get('/api/team-management');
    return response.data;
  },

  // Get team statistics
  getTeamStats: async () => {
    const response = await api.get('/api/team-management/stats');
    return response.data;
  },

  // Add new team member
  addTeamMember: async (memberData) => {
    const response = await api.post('/api/team-management', memberData);
    return response.data;
  },

  // Update team member
  updateTeamMember: async (memberId, updates) => {
    const response = await api.put(`/api/team-management/${memberId}`, updates);
    return response.data;
  },

  // Remove team member
  removeTeamMember: async (memberId) => {
    const response = await api.delete(`/api/team-management/${memberId}`);
    return response.data;
  },
};

export default teamManagementApi;
