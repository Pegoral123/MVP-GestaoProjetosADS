import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, UserPlus, Search, Users, LogOut, User, LayoutGrid } from "lucide-react"
import { Button } from "../components/ui/button"
import AlunoCard from "../components/alunos/AlunoCard"
import AlunoModal from "../components/alunos/AlunoModal"
import { useAuth } from "../context/AuthContext"

import api from "../services/api"

function ListaAlunos() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [busca, setBusca] = useState("")
    const [alunoSelecionado, setAlunoSelecionado] = useState(null)
    const [alunos, setAlunos] = useState([])

    const [loading, setLoading] = useState(true);

    const carregarAlunos = async () => {
        try {
            const response = await api.get('/api/v1/alunos/');
            let data = [];
            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data && Array.isArray(response.data.results)) {
                data = response.data.results;
            } else if (response.data && Array.isArray(response.data.data)) {
                data = response.data.data;
            } else if (response.data && Array.isArray(response.data.alunos)) {
                data = response.data.alunos;
            }
            setAlunos(data);
        } catch (error) {
            console.error("Erro ao carregar alunos", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarAlunos();
    }, [])

    const handleDeleteAluno = async (id) => {
        try {
            await api.delete(`/api/v1/alunos/${id}/`);
            setAlunos(alunos.filter((a) => a.id !== id));
            setAlunoSelecionado(null);
        } catch (error) {
            console.error("Erro ao excluir aluno", error);
            alert("Não foi possível excluir o aluno.");
        }
    }

    const alunosFiltrados = alunos.filter((a) => {
        const q = String(busca).toLowerCase()
        return (
            String(a.nome || "").toLowerCase().includes(q) ||
            String(a.matricula || "").toLowerCase().includes(q) ||
            String(a.email || "").toLowerCase().includes(q)
        )
    })

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col">

            {/* Header*/}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Users size={28} className="text-[#006b64]" />
                    Gestão de Alunos
                </h1>
                <p className="text-gray-500 text-sm">Gerencie o cadastro de alunos matriculados no curso.</p>
            </div>

            {/* Main */}
            <main className="flex-1 w-full">

                {/* Stats + Busca */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="bg-[#006b64]/10 text-[#006b64] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {alunosFiltrados.length} {alunosFiltrados.length === 1 ? "aluno" : "alunos"}
                            </span>
                        </div>
                        <Button
                            onClick={() => navigate("/alunos/cadastro")}
                            className="bg-[#006b64] hover:bg-[#00524d] text-white font-semibold text-sm px-4 py-2 shadow-sm transition-transform hover:scale-105"
                        >
                            <UserPlus size={16} className="mr-1" />
                            Novo Aluno
                        </Button>
                    </div>

                    <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30 w-full sm:w-80">
                        <div className="bg-[#006b64] p-2.5">
                            <Search className="text-white" size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nome ou matrícula..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border-0 outline-none focus:ring-0 bg-white w-full"
                        />
                    </div>
                </div>

                {/* Lista */}
                {alunosFiltrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Users size={48} className="mb-3 opacity-40" />
                        <p className="text-base">Nenhum aluno encontrado.</p>
                        <button
                            onClick={() => navigate("/alunos/cadastro")}
                            className="mt-4 text-[#006b64] text-sm underline hover:opacity-80 cursor-pointer"
                            type="button"
                        >
                            Cadastrar o primeiro aluno
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {alunosFiltrados.map((aluno) => (
                            <AlunoCard
                                key={aluno.id}
                                aluno={aluno}
                                onClick={() => setAlunoSelecionado(aluno)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Modal de detalhes */}
            <AlunoModal
                aluno={alunoSelecionado}
                onClose={() => setAlunoSelecionado(null)}
                onDelete={handleDeleteAluno}
            />
        </section>
    )
}

export default ListaAlunos
