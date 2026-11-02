
import { Navigate, Outlet } from 'react-router-dom'

import AdminNavbar from './AdminNavbar.jsx'
import AdminSidebar from './AdminSidebar.jsx'

function AdminLayout({ user, onLogout }) {

    // Check admin authentication
    if (user?.role !== 'admin') {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="min-vh-100 bg-black text-light">
            <AdminNavbar
                user={user}
                onLogout={onLogout}
            />

            <div className="row g-0 align-items-start">
                <AdminSidebar />

                <main className="col-12 col-lg-10 px-3 px-lg-5 py-4">
                    <Outlet />
                </main>
            </div>

        </div>
    )
}

export default AdminLayout
