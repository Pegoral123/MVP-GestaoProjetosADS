import { 
    Users, 
    Layers, 
    LayoutGrid, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    TrendingUp
} from "lucide-react"

function Dashboard() {
    const stats = [
        { label: "Total de Alunos", value: "124", icon: <Users size={24} />, color: "bg-blue-500" },
        { label: "Equipes Ativas", value: "32", icon: <Layers size={24} />, color: "bg-[#006b64]" },
        { label: "Projetos em Uso", value: "12", icon: <LayoutGrid size={24} />, color: "bg-amber-500" },
        { label: "MVPs Entregues", value: "85%", icon: <CheckCircle2 size={24} />, color: "bg-green-500" },
    ]

    const recentActivities = [
        { id: 1, text: "Nova equipe 'Alpha Team' cadastrada.", time: "há 2 horas", icon: <Layers size={16} /> },
        { id: 2, text: "Projeto 'Sistema Acadêmico' atualizado.", time: "há 5 horas", icon: <LayoutGrid size={16} /> },
        { id: 3, text: "5 novos alunos importados.", time: "há 1 dia", icon: <Users size={16} /> },
    ]

    return (
        <div className="flex flex-col gap-8">
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <LayoutDashboard size={28} className="text-[#006b64]" />
                    Dashboard
                </h1>
                <p className="text-gray-500 text-sm">Bem-vindo ao portal de gestão de projetos MVP.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`${stat.color} p-3 rounded-xl text-white`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Atividades Recentes */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Clock size={20} className="text-[#006b64]" />
                        Atividades Recentes
                    </h2>
                    <div className="space-y-6">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="bg-gray-100 p-2 rounded-lg text-gray-500 mt-0.5">
                                    {activity.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800 font-medium">{activity.text}</p>
                                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Próximos Prazos */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-[#006b64]" />
                        Status dos MVPs
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-gray-600">
                                <span>FRONTEND</span>
                                <span>90%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[90%]"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-gray-600">
                                <span>BACKEND</span>
                                <span>75%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#006b64] w-[75%]"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-gray-600">
                                <span>MOBILE</span>
                                <span>40%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-[40%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

import { LayoutDashboard } from "lucide-react"
export default Dashboard
