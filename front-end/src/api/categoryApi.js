import api from './axiosClient'

export const getCategories = () => api.get('/categories')

export default { getCategories }
