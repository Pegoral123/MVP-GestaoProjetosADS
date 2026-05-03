import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, LayoutGrid, Plus, Search, Filter, Trash2, Edit, ChevronRight } from "lucide-react"
import { Button } from "../components/ui/button"
import ProjetoModal from "../components/projetos/ProjetoModal"
import { useAuth } from "../context/AuthContext"

function ListaProjetos() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [projetos, setProjetos] = useState([])
    const [projetoSelecionado, setProjetoSelecionado] = useState(null)
    const [busca, setBusca] = useState("")
    const [filtroMvp, setFiltroMvp] = useState("")
    const [filtroStatus, setFiltroStatus] = useState("")

    useEffect(() => {
        const stored = localStorage.getItem("projetos_mock")
        if (stored) {
            setProjetos(JSON.parse(stored))
        } else {
            const mockProjetos = [
                { id: 1, nome: "E-commerce Sustentável", descricao: "Desenvolver um e-commerce focado em produtos ecológicos.", mvp: "Frontend", ano: "2024", requisitos: "Usar React e Tailwind.", status: "Ativo" },
                { id: 2, nome: "API de Gestão de Frota", descricao: "Backend para gerenciar veículos de uma transportadora.", mvp: "Backend", ano: "2024", requisitos: "Node.js e PostgreSQL.", status: "Ativo" }
            ]
            localStorage.setItem("projetos_mock", JSON.stringify(mockProjetos))
            setProjetos(mockProjetos)
        }
    }, [])

    const handleDelete = (id) => {
        if (window.confirm("Tem certeza que deseja excluir este projeto?")) {
            const updated = projetos.filter(p => p.id !== id)
            setProjetos(updated)
            localStorage.setItem("projetos_mock", JSON.stringify(updated))
        }
    }

    const projetosFiltrados = projetos.filter(p => {
        const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase())
        const matchMvp = filtroMvp ? p.mvp === filtroMvp : true
        const matchStatus = filtroStatus ? p.status === filtroStatus : true
        return matchBusca && matchMvp && matchStatus
    })

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col">
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <LayoutGrid size={28} className="text-[#006b64]" />
                            Gestão de Projetos
                        </h1>
                        <p className="text-gray-500 text-sm">Cadastre e gerencie os projetos disponíveis para os alunos.</p>
                    </div>
                    <Button onClick={() => navigate("/projetos/cadastro")} className="bg-[#006b64] hover:bg-[#00524d] text-white font-semibold text-sm px-6 py-2 shadow-sm transition-transform hover:scale-105 w-fit">
                        <Plus size={16} className="mr-1" /> Novo Projeto
                    </Button>
                </div>
            </div>

            <main className="flex-1 w-full">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Buscar Projeto</label>
                        <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30">
                            <div className="bg-[#006b64] p-2.5"><Search className="text-white" size={16} /></div>
                            <input type="text" placeholder="Nome do projeto..." value={busca} onChange={(e) => setBusca(e.target.value)} className="flex-1 px-3 py-2 text-sm border-0 outline-none w-full" />
                        </div>
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Tipo MVP</label>
                        <select value={filtroMvp} onChange={(e) => setFiltroMvp(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none bg-white">
                            <option value="">Todos</option>
                            <option value="Front-end">Front-end</option>
                            <option value="Back-end">Back-end</option>
                            <option value="Mobile">Mobile</option>
                        </select>
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Status</label>
                        <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none bg-white">
                            <option value="">Todos</option>
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projetosFiltrados.map(projeto => (
                        <div key={projeto.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        projeto.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {projeto.status}
                                    </span>
                                    <span className="text-xs font-medium text-gray-400">{projeto.ano}</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{projeto.nome}</h3>
                                <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">{projeto.descricao}</p>
                                <div className="flex gap-2 mb-4">
                                    <span className="bg-blue-50 text-blue-700 text-[11px] font-semibold px-2 py-1 rounded border border-blue-100">{projeto.mvp}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/projetos/editar/${projeto.id}`)} className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600">
                                        <Edit size={16} />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(projeto.id)} className="h-8 w-8 p-0 text-gray-400 hover:text-red-600">
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setProjetoSelecionado(projeto)}
                                    className="text-[#006b64] hover:bg-[#006b64]/10 font-semibold text-xs gap-1"
                                >
                                    Detalhes <ChevronRight size={14} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {projetosFiltrados.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <LayoutGrid size={48} className="mb-3 opacity-20" />
                        <p className="text-base font-medium">Nenhum projeto encontrado.</p>
                    </div>
                )}
            </main>

            <ProjetoModal 
                projeto={projetoSelecionado} 
                onClose={() => setProjetoSelecionado(null)} 
                onEdit={(id) => navigate(`/projetos/editar/${id}`)}
            />
        </section>
    )
}

export default ListaProjetos
