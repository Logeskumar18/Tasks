import express from 'express'
import { createCategory, createProduct, deleteProduct, deleteUser, getCategories, getOrders, getProducts, getReports, getStats, getUsers, updateOrderStatus, updateProduct, updateUserRole } from '../controllers/adminController.js'
import { requireAdmin, requireAuth } from '../middleware/authMiddleware.js'

const router = express.Router()
router.use(requireAuth, requireAdmin)
router.get('/stats', getStats)
router.get('/dashboard', getStats)
router.get('/users', getUsers)
router.get('/customers', getUsers)
router.patch('/users/:id/role', updateUserRole)
router.delete('/users/:id', deleteUser)
router.get('/products', getProducts)
router.post('/products', createProduct)
router.put('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)
router.get('/orders', getOrders)
router.patch('/orders/:id/status', updateOrderStatus)
router.put('/orders/:id/status', updateOrderStatus)
router.get('/categories', getCategories)
router.post('/categories', createCategory)
router.get('/reports', getReports)

export default router
