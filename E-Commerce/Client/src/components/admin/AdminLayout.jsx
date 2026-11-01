
import { Navigate, Outlet } from 'react-router-dom'

import AdminNavbar from './AdminNavbar.jsx'

function AdminLayout({ user, onLogout }) {

    // Check admin authentication
    if (user?.role !== 'admin') {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="min-vh-100 bg-black text-light">

            {/* Admin Navbar */}
            <AdminNavbar
                user={user}
                onLogout={onLogout}
            />

            <main className="container-fluid px-3 px-lg-5 py-4">
                <Outlet />
            </main>

        </div>
    )
}

export default AdminLayout
