import { useState, useMemo, useEffect } from "react"
import {
    Users,
    Layers,
    LayoutGrid,
    CheckCircle2,
    Download,
    Filter,
    BarChart3,
    PieChart as PieChartIcon,
    LayoutDashboard,
    AlertCircle,
    Loader2,
    GraduationCap,
    PackageCheck
} from "lucide-react"
import { Button } from "../components/ui/button"
import * as XLSX from 'xlsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { listarGrupos } from "../services/grupoService"
import { listarAlunos } from "../services/alunoService"
import { listarEntregas } from "../services/entregaService"

const MVP_COLORS = {
    Frontend: '#3b82f6',
    Backend: '#10b981',
    Mobile: '#8b5cf6'
};

const COLORS = ['#006b64', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

function StatCard({ icon, label, value, color, subtitle }) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`${color} p-3 rounded-xl text-white shrink-0`}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">{label}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
        </div>
    )
}

function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
            <Loader2 size={36} className="animate-spin text-[#006b64]" />
            <p className="text-sm font-medium">Carregando dados do dashboard...</p>
        </div>
    )
}

function ErrorMessage({ message, onRetry }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-red-500">
            <AlertCircle size={36} />
            <div className="text-center">
                <p className="font-semibold">Erro ao carregar dados</p>
                <p className="text-sm text-gray-500 mt-1">{message}</p>
            </div>
            <Button onClick={onRetry} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                Tentar novamente
            </Button>
        </div>
    )
}

function EmptyChart({ message = "Nenhum dado disponivel." }) {
    return (
        <div className="flex items-center justify-center h-full min-h-[200px] text-gray-400 text-sm">
            {message}
        </div>
    )
}

function Dashboard() {
    const [grupos, setGrupos] = useState([])
    const [alunos, setAlunos] = useState([])
    const [entregas, setEntregas] = useState([])
    const [loading, setLoading] = useState(true)
    const [erro, setErro] = useState(null)

    const [filtroAno, setFiltroAno] = useState("")
    const [filtroPeriodo, setFiltroPeriodo] = useState("")
    const [filtroMvp, setFiltroMvp] = useState("")

    const carregarDados = async () => {
        setLoading(true)
        setErro(null)
        try {
            const [gruposData, alunosData, entregasData] = await Promise.all([
                listarGrupos(),
                listarAlunos(),
                listarEntregas(),
            ])
            setGrupos(gruposData)
            setAlunos(alunosData)
            setEntregas(entregasData)
        } catch (e) {
            console.error("Erro ao carregar dashboard:", e)
            setErro(e?.response?.data?.detail || e?.message || "Nao foi possivel conectar ao servidor.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        carregarDados()
    }, [])

    const anosDisponiveis = useMemo(() => {
        const anos = grupos
            .map(g => g.ano || (g.data ? new Date(g.data).getFullYear().toString() : null))
            .filter(Boolean)
        return [...new Set(anos)].sort((a, b) => b - a)
    }, [grupos])

    const periodosDisponiveis = useMemo(() => {
        const periodos = grupos.map(g => g.periodo).filter(Boolean)
        return [...new Set(periodos)]
    }, [grupos])

    const gruposFiltrados = useMemo(() => grupos.filter(g => {
        const anoGrupo = g.ano || (g.data ? new Date(g.data).getFullYear().toString() : null)
        if (filtroAno && anoGrupo !== filtroAno) return false
        if (filtroPeriodo && g.periodo !== filtroPeriodo) return false
        if (filtroMvp && g.mvp !== filtroMvp) return false
        return true
    }), [grupos, filtroAno, filtroPeriodo, filtroMvp])

    const gruposFiltradosIds = useMemo(() => new Set(gruposFiltrados.map(g => g.id)), [gruposFiltrados])
    const entregasFiltradas = useMemo(() =>
        entregas.filter(e => gruposFiltradosIds.has(e.grupo)),
        [entregas, gruposFiltradosIds]
    )

    const totalGrupos = gruposFiltrados.length
    const gruposConcluidos = gruposFiltrados.filter(g => g.status === "Concluído" || g.status === "Concluido").length
    const gruposEmAndamento = totalGrupos - gruposConcluidos
    const totalAlunos = alunos.length
    const totalEntregas = entregasFiltradas.length

    const mvpStatusData = useMemo(() => {
        const types = ["Frontend", "Backend", "Mobile"]
        return types.map(type => {
            const gruposMVP = gruposFiltrados.filter(g => g.mvp === type)
            const concluidos = gruposMVP.filter(g => g.status === "Concluído" || g.status === "Concluido").length
            const total = gruposMVP.length
            const percentual = total === 0 ? 0 : Math.round((concluidos / total) * 100)
            return { name: type, Concluido: percentual, total }
        })
    }, [gruposFiltrados])

    const gruposMVPData = useMemo(() => {
        const types = ["Frontend", "Backend", "Mobile"]
        return types.map(type => ({
            name: type,
            value: gruposFiltrados.filter(g => g.mvp === type).length
        })).filter(d => d.value > 0)
    }, [gruposFiltrados])

    const entregasPorGrupoData = useMemo(() => {
        return gruposFiltrados
            .map(g => ({
                name: g.nome,
                Entregas: entregasFiltradas.filter(e => e.grupo === g.id).length
            }))
            .filter(d => d.Entregas > 0)
            .slice(0, 15)
    }, [gruposFiltrados, entregasFiltradas])

    const handleExportExcel = () => {
        const dataToExport = gruposFiltrados.map(g => ({
            "Grupo": g.nome,
            "MVP": g.mvp,
            "Periodo": g.periodo,
            "Ano": g.ano || (g.data ? new Date(g.data).getFullYear() : ""),
            "Status": g.status,
            "Total Alunos": g.totalAlunos ?? g.total_alunos ?? "",
            "GitHub": g.githubUrl || g.github_url || "",
        }))
        const worksheet = XLSX.utils.json_to_sheet(dataToExport)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Grupos")
        XLSX.writeFile(workbook, "Relatorio_Grupos_Dashboard.xlsx")
    }

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <LayoutDashboard size={28} className="text-[#006b64]" />
                        Dashboard
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Acompanhe os indicadores, status dos grupos e entregas em tempo real.
                    </p>
                </div>
                {!loading && !erro && (
                    <Button
                        onClick={handleExportExcel}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm flex items-center gap-2"
                    >
                        <Download size={16} />
                        Exportar Relatorio (Excel)
                    </Button>
                )}
            </div>

            <main className="flex-1 w-full space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2 text-gray-700 font-semibold">
                        <Filter size={18} />
                        <span>Filtros Globais</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                            value={filtroAno}
                            onChange={(e) => setFiltroAno(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#006b64]/30 focus:border-[#006b64] transition-all bg-white text-gray-700"
                        >
                            <option value="">Ano Letivo (Todos)</option>
                            {anosDisponiveis.map(ano => (
                                <option key={ano} value={ano}>{ano}</option>
                            ))}
                        </select>
                        <select
                            value={filtroPeriodo}
                            onChange={(e) => setFiltroPeriodo(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#006b64]/30 focus:border-[#006b64] transition-all bg-white text-gray-700"
                        >
                            <option value="">Periodo (Todos)</option>
                            {periodosDisponiveis.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <select
                            value={filtroMvp}
                            onChange={(e) => setFiltroMvp(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#006b64]/30 focus:border-[#006b64] transition-all bg-white text-gray-700"
                        >
                            <option value="">Tipo de MVP (Todos)</option>
                            <option value="Frontend">Frontend</option>
                            <option value="Backend">Backend</option>
                            <option value="Mobile">Mobile</option>
                        </select>
                    </div>
                </div>

                {loading && <LoadingSpinner />}
                {!loading && erro && <ErrorMessage message={erro} onRetry={carregarDados} />}

                {!loading && !erro && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <StatCard
                                icon={<Layers size={24} />}
                                label="Total de Grupos"
                                value={totalGrupos}
                                color="bg-[#006b64]"
                            />
                            <StatCard
                                icon={<CheckCircle2 size={24} />}
                                label="Grupos Concluidos"
                                value={gruposConcluidos}
                                color="bg-green-500"
                                subtitle={totalGrupos > 0 ? `${Math.round((gruposConcluidos / totalGrupos) * 100)}% do total` : null}
                            />
                            <StatCard
                                icon={<LayoutGrid size={24} />}
                                label="Em Andamento"
                                value={gruposEmAndamento}
                                color="bg-amber-500"
                            />
                            <StatCard
                                icon={<GraduationCap size={24} />}
                                label="Total de Alunos"
                                value={totalAlunos}
                                color="bg-blue-500"
                            />
                            <StatCard
                                icon={<PackageCheck size={24} />}
                                label="Entregas Registradas"
                                value={totalEntregas}
                                color="bg-purple-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <BarChart3 size={20} className="text-[#006b64]" />
                                    Conclusao por Tipo de MVP (%)
                                </h2>
                                <div className="w-full h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={mvpStatusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                formatter={(value) => [`${value}%`, 'Concluido']}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="Concluido" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                                {mvpStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={MVP_COLORS[entry.name] || '#ccc'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <PieChartIcon size={20} className="text-[#006b64]" />
                                    Grupos por Tipo de MVP
                                </h2>
                                <div className="w-full h-[300px]">
                                    {gruposMVPData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={gruposMVPData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {gruposMVPData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={MVP_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <EmptyChart message="Nenhum grupo encontrado para os filtros selecionados." />
                                    )}
                                </div>
                            </div>
                        </div>

                        {entregasPorGrupoData.length > 0 && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <PackageCheck size={20} className="text-[#006b64]" />
                                    Entregas Registradas por Grupo
                                </h2>
                                <div className="w-full h-[320px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={entregasPorGrupoData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                angle={-40}
                                                textAnchor="end"
                                                height={60}
                                                interval={0}
                                                tick={{ fontSize: 11 }}
                                            />
                                            <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                                            <Tooltip
                                                cursor={{ fill: '#f3f4f6' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="Entregas" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Users size={20} className="text-[#006b64]" />
                                Visao Geral dos Grupos
                                <span className="ml-auto text-sm text-gray-400 font-normal">
                                    {gruposFiltrados.length} grupo{gruposFiltrados.length !== 1 ? 's' : ''}
                                </span>
                            </h2>
                            {gruposFiltrados.length === 0 ? (
                                <EmptyChart message="Nenhum grupo encontrado para os filtros selecionados." />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-gray-500 border-b border-gray-100">
                                                <th className="pb-3 font-semibold">Grupo</th>
                                                <th className="pb-3 font-semibold">MVP</th>
                                                <th className="pb-3 font-semibold">Periodo</th>
                                                <th className="pb-3 font-semibold">Status</th>
                                                <th className="pb-3 font-semibold text-right">Alunos</th>
                                                <th className="pb-3 font-semibold text-right">Entregas</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {gruposFiltrados.slice(0, 20).map(g => {
                                                const nEntregas = entregasFiltradas.filter(e => e.grupo === g.id).length
                                                return (
                                                    <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="py-3 font-medium text-gray-800">{g.nome}</td>
                                                        <td className="py-3">
                                                            <span
                                                                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                                                style={{
                                                                    backgroundColor: `${MVP_COLORS[g.mvp] || '#9ca3af'}20`,
                                                                    color: MVP_COLORS[g.mvp] || '#6b7280'
                                                                }}
                                                            >
                                                                {g.mvp || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-gray-500">{g.periodo || '-'}</td>
                                                        <td className="py-3">
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${g.status === 'Concluído' || g.status === 'Concluido'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                            }`}>
                                                                {g.status || '-'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 text-right text-gray-600">
                                                            {g.totalAlunos ?? g.total_alunos ?? '-'}
                                                        </td>
                                                        <td className="py-3 text-right text-gray-600">{nEntregas}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                    {gruposFiltrados.length > 20 && (
                                        <p className="text-center text-xs text-gray-400 mt-4">
                                            Mostrando 20 de {gruposFiltrados.length} grupos. Use os filtros para refinar.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </section>
    )
}

export default Dashboard
