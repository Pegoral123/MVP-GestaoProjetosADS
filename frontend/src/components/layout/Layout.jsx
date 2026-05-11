import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

function Layout() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar fixa */}
            <Sidebar />

            {/* Área de Conteúdo */}
            <main className="flex-1 flex flex-col overflow-x-hidden">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default Layout
