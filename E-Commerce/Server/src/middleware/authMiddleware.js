import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET || 'shop-ease-development-secret'

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) return res.status(401).json({ message: 'Authentication required.' })

  try {
    req.user = jwt.verify(token, secret)
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session.' })
  }
}

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' })
  return next()
}

export { requireAdmin, requireAuth }
