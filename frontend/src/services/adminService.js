import api from './api'

export const adminService = {
  /**
   * 1. Dashboard Statistics
   * GET /api/admin/dashboard (also /api/admin/stats)
   */
  async getDashboardStats() {
    try {
      const response = await api.get('/api/admin/dashboard')
      return response.data
    } catch (err) {
      // Fallback endpoint if /dashboard redirects
      const fallback = await api.get('/api/admin/stats')
      return fallback.data
    }
  },

  /**
   * 2. All Complaints with Filtering, Search, Pagination
   * GET /api/admin/complaints
   */
  async getAllComplaints(params = {}) {
    const cleanParams = {}
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        cleanParams[key] = params[key]
      }
    })
    const response = await api.get('/api/admin/complaints', { params: cleanParams })
    return response.data
  },

  /**
   * 3. Single Complaint Details
   * GET /api/admin/complaints/:id
   */
  async getComplaintById(id) {
    const response = await api.get(`/api/admin/complaints/${id}`)
    return response.data
  },

  /**
   * 4. Complaint Status History Timeline
   * GET /api/admin/complaints/:id/history
   */
  async getComplaintHistory(id) {
    const response = await api.get(`/api/admin/complaints/${id}/history`)
    return response.data
  },

  /**
   * 5. Complaint AI Analysis Recommendations
   * GET /api/admin/complaints/:id/ai-analysis
   */
  async getComplaintAIAnalysis(id) {
    const response = await api.get(`/api/admin/complaints/${id}/ai-analysis`)
    return response.data
  },

  /**
   * 6. Update Complaint Status
   * PATCH /api/admin/complaints/:id/status
   */
  async updateComplaintStatus(id, { status, remarks, authorityId, evidenceImages }) {
    const payload = {
      status,
      remarks: remarks || '',
      authorityId: authorityId || undefined,
      evidenceImages: evidenceImages || undefined,
    }
    const response = await api.patch(`/api/admin/complaints/${id}/status`, payload)
    return response.data
  },

  /**
   * 7. Update Complaint Priority
   * PATCH /api/admin/complaints/:id/priority
   */
  async updateComplaintPriority(id, { priority, reason }) {
    const payload = {
      priority,
      reason: reason || `Priority changed to ${priority}`,
    }
    const response = await api.patch(`/api/admin/complaints/${id}/priority`, payload)
    return response.data
  },

  /**
   * 8. Citizen Management: Get all citizens
   * GET /api/admin/users
   */
  async getAllCitizens(params = {}) {
    const cleanParams = {}
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        cleanParams[key] = params[key]
      }
    })
    const response = await api.get('/api/admin/users', { params: cleanParams })
    return response.data
  },

  /**
   * 9. Citizen Management: Get citizen details by ID
   * GET /api/admin/users/:id
   */
  async getCitizenById(id) {
    const response = await api.get(`/api/admin/users/${id}`)
    return response.data
  },

  /**
   * 10. Citizen Management: Get citizen complaints
   * GET /api/admin/users/:id/complaints
   */
  async getCitizenComplaints(id) {
    const response = await api.get(`/api/admin/users/${id}/complaints`)
    return response.data
  },

  /**
   * 11. Create Invitation for New Administrator
   * POST /api/admin/invitations
   */
  async createInvitation({ email, role = 'ADMIN' }) {
    const response = await api.post('/api/admin/invitations', { email, role })
    return response.data
  },

  /**
   * 12. List Admin Invitations
   * GET /api/admin/invitations
   */
  async getInvitations() {
    const response = await api.get('/api/admin/invitations')
    return response.data
  },
}

export default adminService
