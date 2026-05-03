import { NavLink, useNavigate } from "react-router-dom"
import { 
    LayoutDashboard, 
    Users, 
    Layers, 
    LayoutGrid, 
    User, 
    LogOut, 
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../ui/button"

function Sidebar() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const username = localStorage.getItem('logged_username') || "Professor"

    const menuItems = [
        { path: "/dashboard", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
        { path: "/alunos", icon: <Users size={20} />, label: "Alunos" },
        { path: "/grupos", icon: <Layers size={20} />, label: "Grupos & Equipes" },
        { path: "/projetos", icon: <LayoutGrid size={20} />, label: "Projetos" },
        { path: "/perfil", icon: <User size={20} />, label: "Meu Perfil" },
    ]

    return (
        <aside 
            className={`bg-[#006b64] text-white h-screen sticky top-0 flex flex-col transition-all duration-300 shadow-xl z-40 ${
                isCollapsed ? "w-20" : "w-64"
            }`}
        >
            {/* Header / Logo */}
            <div className="p-6 flex items-center justify-between border-b border-white/10">
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="font-bold text-lg tracking-tight">MVP GESTÃO</span>
                        <span className="text-[10px] text-white/60 font-medium uppercase tracking-widest">Unifeso ADS</span>
                    </div>
                )}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors ml-auto"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                            ${isActive 
                                ? "bg-white text-[#006b64] shadow-lg font-bold" 
                                : "text-white/70 hover:text-white hover:bg-white/10"
                            }
                        `}
                    >
                        <div className="transition-transform group-hover:scale-110">
                            {item.icon}
                        </div>
                        {!isCollapsed && <span className="text-sm">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / User */}
            <div className="p-4 border-t border-white/10">
                <div className={`flex items-center gap-3 p-2 rounded-xl bg-white/5 mb-3 ${isCollapsed ? "justify-center" : ""}`}>
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold shrink-0">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold truncate">{username}</span>
                            <span className="text-[10px] text-white/50">Professor</span>
                        </div>
                    )}
                </div>
                
                <Button 
                    variant="ghost"
                    onClick={logout}
                    className={`w-full flex items-center gap-3 text-white/70 hover:text-white hover:bg-red-500/20 px-3 py-3 rounded-xl h-auto ${
                        isCollapsed ? "justify-center" : "justify-start"
                    }`}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="text-sm font-medium">Sair do Sistema</span>}
                </Button>
            </div>
        </aside>
    )
}

export default Sidebar
