import api from './axiosClient.js'

export const getCart = () => api.get('/cart')
export const addToCart = (productId, quantity = 1) => api.post('/cart', { productId, quantity })
export const updateCartItem = (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity })
export const removeCartItem = (itemId) => api.delete(`/cart/${itemId}`)
