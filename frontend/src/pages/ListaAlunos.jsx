import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, UserPlus, Search, Users } from "lucide-react"
import { Button } from "../components/ui/button"
import AlunoCard from "../components/alunos/AlunoCard"
import AlunoModal from "../components/alunos/AlunoModal"

// Dados mock
const ALUNOS_MOCK = [
    {
        id: 1,
        matricula: "2024001001",
        nome: "Ana Beatriz Carvalho",
        email: "ana.carvalho@unifeso.edu.br",
        celular: "(22) 99821-0011",
    },
    {
        id: 2,
        matricula: "2024001002",
        nome: "Carlos Eduardo Lima",
        email: "carlos.lima@unifeso.edu.br",
        celular: "(22) 98752-3344",
    },
    {
        id: 3,
        matricula: "2024001003",
        nome: "Fernanda Oliveira Santos",
        email: "fernanda.santos@unifeso.edu.br",
        celular: "(21) 97654-5566",
    },
]

function ListaAlunos() {
    const navigate = useNavigate()
    const [busca, setBusca] = useState("")
    const [alunoSelecionado, setAlunoSelecionado] = useState(null)
    const [alunos, setAlunos] = useState([])

    useEffect(() => {
        const stored = localStorage.getItem("alunos_mock")
        if (stored) {
            setAlunos(JSON.parse(stored))
        } else {
            localStorage.setItem("alunos_mock", JSON.stringify(ALUNOS_MOCK))
            setAlunos(ALUNOS_MOCK)
        }
    }, [])

    const handleDeleteAluno = (id) => {
        const novosAlunos = alunos.filter((a) => a.id !== id)
        setAlunos(novosAlunos)
        localStorage.setItem("alunos_mock", JSON.stringify(novosAlunos))
        setAlunoSelecionado(null)
    }

    const alunosFiltrados = alunos.filter((a) => {
        const q = busca.toLowerCase()
        return (
            a.nome.toLowerCase().includes(q) ||
            a.matricula.includes(q) ||
            a.email.toLowerCase().includes(q)
        )
    })

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col">

            {/* Header*/}
            <header className="bg-[#006b64] text-white px-6 py-4 shadow-md w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/dashboard")}
                            type="button"
                            className="text-white/80 hover:text-white hover:bg-white/20 px-2 cursor-pointer"
                        >
                            <ArrowLeft size={18} className="mr-1" />
                            Voltar
                        </Button>
                        <div className="h-5 w-px bg-white/30 mx-1" />
                        <div className="flex items-center gap-2">
                            <Users size={20} />
                            <h1 className="text-lg font-semibold tracking-wide">Alunos</h1>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate("/alunos/cadastro")}
                        className="bg-white text-[#006b64] hover:bg-white/90 font-semibold text-sm px-4 py-2 cursor-pointer"
                    >
                        <UserPlus size={16} className="mr-1" />
                        Novo Aluno
                    </Button>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 w-full px-6 py-8">

                {/* Stats + Busca */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-[#006b64] text-white text-sm font-bold px-3 py-1 rounded-full">
                            {alunosFiltrados.length}
                        </span>
                        <span className="text-gray-600 text-sm">
                            {alunosFiltrados.length === 1 ? "aluno encontrado" : "alunos encontrados"}
                        </span>
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
