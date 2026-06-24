import api from './axiosClient.js'

export const fetchProducts = (params) => api.get('/products', { params })
export const fetchAllProducts = () => api.get('/products')
export const fetchProductById = (id) => api.get(`/products/${id}`)
export const fetchCategories = () => api.get('/categories')
export const fetchTopSelling = (limit = 6) => api.get('/products/top-selling', { params: { limit } })
