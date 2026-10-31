import axios from 'axios'

export const ISSUE_TYPES_API = 'http://localhost:3000/issuetypes'

/**
 * Fetch all complaints from the database
 * Returns an array of complaint objects  
 */
export const fetchIssueTypes = async () => {
  // First try the Vite proxy route
  try {
    const res = await axios.get('/issuetypes')
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data
    }
    if (Array.isArray(res.data)) {
      return res.data
    }
  } catch (proxyErr) {
    console.warn('Proxy fetch failed, trying direct backend URL:', proxyErr.message)
  }

  // Direct backend URL fallback
  try {
    const res = await axios.get(ISSUE_TYPES_API)
    if (res.data && Array.isArray(res.data.data)) {
      return res.data.data
    }
    if (Array.isArray(res.data)) {
      return res.data
    }
    return []
  } catch (err) {
    console.error('Failed to fetch complaints from backend:', err.message)
    return null
  }
}

/**
 * Post a new complaint to the database
 */
export const addIssueToDatabase = async (complaintData) => {
  // First try the Vite proxy route
  // try {
  //   const res = await axios.post('/issue_types', complaintData, {
  //     headers: { 'Content-Type': 'application/json' },
  //   })
  //   console.log('Successfully saved to database via proxy:', res.data)
  //   return { success: true, data: res.data.data || res.data }
  // } catch (proxyErr) {
  //   console.warn('Proxy POST failed, trying direct backend URL:', proxyErr.message)
  // }

  // Direct backend URL fallback
  try {  
    const res = await axios.post(ISSUE_TYPES_API, complaintData, {
      headers: { 'Content-Type': 'application/json' },
    })
    console.log('Successfully saved to database directly:', res.data)
    return { success: true, data: res.data.data || res.data }
  } catch (directErr) {
    console.error('Failed to POST complaint to database:', directErr)
    const message = directErr.response?.data?.message || directErr.message || 'Unknown network error'
    return { success: false, error: message }
  }
}

/**
 * Delete a complaint from the database by ID (supports _id or custom id)
 */
export const deleteIssueFromDatabase = async (id) => {
  // First try the Vite proxy route
  try {
    const res = await axios.delete(`/issuetypes/${id}`)
    console.log('Successfully deleted complaint via proxy:', res.data)
    return { success: true, data: res.data }
  } catch (proxyErr) {
    console.warn('Proxy DELETE failed, trying direct backend URL:', proxyErr.message)
  }

  // Direct backend URL fallback
  try {
    const res = await axios.delete(`${ISSUE_TYPES_API}/${id}`)
    console.log('Successfully deleted complaint directly:', res.data)
    return { success: true, data: res.data }
  } catch (directErr) {
    console.error('Failed to DELETE complaint from database:', directErr)
    const message = directErr.response?.data?.message || directErr.message || 'Unknown network error'
    return { success: false, error: message }
  }
}

