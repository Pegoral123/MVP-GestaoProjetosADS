import { useState, useMemo } from "react"
import { 
    Users, 
    Layers, 
    LayoutGrid, 
    CheckCircle2, 
    Download,
    Filter,
    BarChart3,
    PieChart as PieChartIcon,
    LayoutDashboard
} from "lucide-react"
import { Button } from "../components/ui/button"
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Mocks de dados
const mockProjetos = [
    { id: 1, nome: "Sistema Acadêmico", status: "Concluído", ano: "2024", periodo: "1º Semestre" },
    { id: 2, nome: "App de Entregas", status: "Em andamento", ano: "2024", periodo: "1º Semestre" },
    { id: 3, nome: "Portal de Notícias", status: "Concluído", ano: "2024", periodo: "2º Semestre" },
    { id: 4, nome: "E-commerce", status: "Em andamento", ano: "2025", periodo: "1º Semestre" },
    { id: 5, nome: "Rede Social", status: "Concluído", ano: "2025", periodo: "1º Semestre" },
];

const mockGrupos = [
    { id: 1, nome: "Alpha Team", mvp: "Frontend", status: "Concluído", ano: "2024", periodo: "1º Semestre", alunos: [{ nome: "João Silva", nota: 6 }, { nome: "Maria Souza", nota: 5.5 }] },
    { id: 2, nome: "Beta Squad", mvp: "Backend", status: "Em andamento", ano: "2024", periodo: "1º Semestre", alunos: [{ nome: "Carlos Lima", nota: null }, { nome: "Ana Santos", nota: null }] },
    { id: 3, nome: "Gamma Group", mvp: "Mobile", status: "Concluído", ano: "2024", periodo: "2º Semestre", alunos: [{ nome: "Pedro Costa", nota: 4.5 }, { nome: "Lucas Mendes", nota: 6 }] },
    { id: 4, nome: "Delta Force", mvp: "Frontend", status: "Em andamento", ano: "2025", periodo: "1º Semestre", alunos: [{ nome: "Julia Alves", nota: null }, { nome: "Fernanda Dias", nota: null }] },
    { id: 5, nome: "Epsilon", mvp: "Backend", status: "Concluído", ano: "2025", periodo: "1º Semestre", alunos: [{ nome: "Bruno Gomes", nota: 5 }, { nome: "Clara Rocha", nota: 5 }] },
    { id: 6, nome: "Zeta Mobile", mvp: "Mobile", status: "Em andamento", ano: "2025", periodo: "1º Semestre", alunos: [{ nome: "Thiago Ramos", nota: null }, { nome: "Camila Ortiz", nota: null }] },
    { id: 7, nome: "Omega Front", mvp: "Frontend", status: "Concluído", ano: "2025", periodo: "1º Semestre", alunos: [{ nome: "Rafael Melo", nota: 6 }, { nome: "Amanda Pires", nota: 6 }] },
];

const MVP_COLORS = {
    Frontend: '#3b82f6', // blue-500
    Backend: '#10b981',  // emerald-500
    Mobile: '#8b5cf6'    // purple-500
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CF6', '#F778A1'];

function Dashboard() {
    const [filtroAno, setFiltroAno] = useState("");
    const [filtroPeriodo, setFiltroPeriodo] = useState("");
    const [filtroMvp, setFiltroMvp] = useState("");

    const projetosFiltrados = useMemo(() => mockProjetos.filter(p => {
        if (filtroAno && p.ano !== filtroAno) return false;
        if (filtroPeriodo && p.periodo !== filtroPeriodo) return false;
        return true;
    }), [filtroAno, filtroPeriodo]);

    const gruposFiltrados = useMemo(() => mockGrupos.filter(g => {
        if (filtroAno && g.ano !== filtroAno) return false;
        if (filtroPeriodo && g.periodo !== filtroPeriodo) return false;
        if (filtroMvp && g.mvp !== filtroMvp) return false;
        return true;
    }), [filtroAno, filtroPeriodo, filtroMvp]);

    // Métricas dos Cards
    const totalProjetos = projetosFiltrados.length;
    const projetosConcluidos = projetosFiltrados.filter(p => p.status === "Concluído").length;
    const projetosEmAndamento = totalProjetos - projetosConcluidos;
    const totalGrupos = gruposFiltrados.length;

    // Dados para Gráfico: Status dos MVPs (Percentual de conclusão)
    const mvpStatusData = useMemo(() => {
        const types = ["Frontend", "Backend", "Mobile"];
        return types.map(type => {
            const gruposMVP = gruposFiltrados.filter(g => g.mvp === type);
            const concluidos = gruposMVP.filter(g => g.status === "Concluído").length;
            const total = gruposMVP.length;
            const percentual = total === 0 ? 0 : Math.round((concluidos / total) * 100);
            return {
                name: type,
                Concluído: percentual,
                total: total
            };
        });
    }, [gruposFiltrados]);

    // Dados para Gráfico: Grupos por tipo de MVP
    const gruposMVPData = useMemo(() => {
        const types = ["Frontend", "Backend", "Mobile"];
        return types.map(type => ({
            name: type,
            value: gruposFiltrados.filter(g => g.mvp === type).length
        })).filter(d => d.value > 0);
    }, [gruposFiltrados]);

    // Dados para Gráfico: Média das notas por grupo
    const mediaNotasData = useMemo(() => {
        return gruposFiltrados.filter(g => g.status === "Concluído").map(g => {
            const notas = g.alunos.map(a => a.nota).filter(n => n !== null);
            const media = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;
            return {
                name: g.nome,
                Média: Number(media.toFixed(2))
            };
        });
    }, [gruposFiltrados]);

    const handleExportExcel = () => {
        const dataToExport = [];
        gruposFiltrados.forEach(g => {
            g.alunos.forEach(a => {
                dataToExport.push({
                    "Grupo": g.nome,
                    "MVP": g.mvp,
                    "Ano": g.ano,
                    "Período": g.periodo,
                    "Status": g.status,
                    "Aluno": a.nome,
                    "Nota": a.nota !== null ? a.nota : "Pendente"
                });
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Notas");
        XLSX.writeFile(workbook, "Relatorio_Notas_Grupos.xlsx");
    };

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <LayoutDashboard size={28} className="text-[#006b64]" />
                        Dashboard
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Acompanhe os indicadores, status de projetos e notas dos grupos.
                    </p>
                </div>
                <div>
                    <Button 
                        onClick={handleExportExcel}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-sm flex items-center gap-2"
                    >
                        <Download size={16} />
                        Exportar Relatório (Excel)
                    </Button>
                </div>
            </div>

            <main className="flex-1 w-full space-y-6">
                {/* Filtros */}
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
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>

                        <select
                            value={filtroPeriodo}
                            onChange={(e) => setFiltroPeriodo(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#006b64]/30 focus:border-[#006b64] transition-all bg-white text-gray-700"
                        >
                            <option value="">Período (Todos)</option>
                            <option value="1º Semestre">1º Semestre</option>
                            <option value="2º Semestre">2º Semestre</option>
                            <option value="1º Trimestre">1º Trimestre</option>
                            <option value="2º Trimestre">2º Trimestre</option>
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

                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-blue-500 p-3 rounded-xl text-white">
                            <LayoutGrid size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Projetos</p>
                            <p className="text-2xl font-bold text-gray-800">{totalProjetos}</p>
                        </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-green-500 p-3 rounded-xl text-white">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Proj. Concluídos</p>
                            <p className="text-2xl font-bold text-gray-800">{projetosConcluidos}</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-amber-500 p-3 rounded-xl text-white">
                            <Layers size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Proj. Em Andamento</p>
                            <p className="text-2xl font-bold text-gray-800">{projetosEmAndamento}</p>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="bg-[#006b64] p-3 rounded-xl text-white">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total de Grupos</p>
                            <p className="text-2xl font-bold text-gray-800">{totalGrupos}</p>
                        </div>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status dos MVPs */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <BarChart3 size={20} className="text-[#006b64]" />
                            Status de Conclusão por MVP (%)
                        </h2>
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mvpStatusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="Concluído" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                        {mvpStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={MVP_COLORS[entry.name] || '#ccc'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Distribuição de Grupos */}
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
                                            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    Nenhum dado para exibir.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Média de Notas */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <BarChart3 size={20} className="text-[#006b64]" />
                        Média de Notas por Grupo (Avaliados)
                    </h2>
                    <div className="w-full h-[350px]">
                        {mediaNotasData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={mediaNotasData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        angle={-45} 
                                        textAnchor="end" 
                                        height={60} 
                                        interval={0}
                                        tick={{fontSize: 12}}
                                    />
                                    <YAxis axisLine={false} tickLine={false} domain={[0, 6]} />
                                    <Tooltip 
                                        cursor={{fill: '#f3f4f6'}}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="Média" fill="#006b64" radius={[6, 6, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 min-h-[200px]">
                                <p>Nenhum grupo avaliado encontrado para os filtros atuais.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </section>
    )
}

export default Dashboard
