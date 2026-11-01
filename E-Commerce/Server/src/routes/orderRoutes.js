import express from 'express'
import { createOrder, getMyOrders } from '../controllers/orderController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = express.Router()
router.use(requireAuth)
router.post('/', createOrder)
router.get('/', getMyOrders)

export default router
