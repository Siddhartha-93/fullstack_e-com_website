import api from './axiosClient.js'

export const fetchProducts = (params) => api.get('/products', { params })
export const fetchProductById = (id) => api.get(`/products/${id}`)
export const createProduct = (data) => {
	const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
	return api.post('/products', data, config)
}
export const updateProduct = (id, data) => {
	const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
	return api.put(`/products/${id}`, data, config)
}
export const deleteProduct = (id) => api.delete(`/products/${id}`)

export const fetchUsers = () => api.get('/users')
export const fetchUserById = (id) => api.get(`/users/${id}`)

export const fetchCategories = () => api.get('/categories')
export const createCategory = (data) => {
	const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
	return api.post('/categories', data, config)
}
export const updateCategory = (id, data) => {
	const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
	return api.put(`/categories/${id}`, data, config)
}
export const deleteCategory = (id) => api.delete(`/categories/${id}`)

export const fetchOrders = () => api.get('/orders')
export const fetchOrderById = (id) => api.get(`/orders/${id}`)
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status })
