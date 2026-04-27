import { useRef, useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { ArrowLeft, Users, X, Hash, Save, Eraser, Calendar, Layers, Search } from "lucide-react"

function CadastroGrupo() {
    const navigate = useNavigate()
    const { id } = useParams()

    const codigoRef = useRef(null)
    const nomeRef = useRef(null)
    const dataRef = useRef(null)
    const anoRef = useRef(null)
    const periodoRef = useRef(null)
    const mvpRef = useRef(null)

    const [alunos, setAlunos] = useState([])
    const [selectedAlunos, setSelectedAlunos] = useState([])
    const [buscaAluno, setBuscaAluno] = useState("")
    const [errors, setErrors] = useState({})
    const [successMsg, setSuccessMsg] = useState("")

    useEffect(() => {
        const storedAlunos = localStorage.getItem("alunos_mock")
        if (storedAlunos) setAlunos(JSON.parse(storedAlunos))

        if (id) {
            const storedGrupos = localStorage.getItem("grupos_mock")
            if (storedGrupos) {
                const gruposMock = JSON.parse(storedGrupos)
                const grupoEdit = gruposMock.find((g) => g.id.toString() === id)
                if (grupoEdit) {
                    if (codigoRef.current) codigoRef.current.value = grupoEdit.codigo || ""
                    if (nomeRef.current) nomeRef.current.value = grupoEdit.nome || ""
                    if (dataRef.current) dataRef.current.value = grupoEdit.data || ""
                    if (anoRef.current) anoRef.current.value = grupoEdit.ano || ""
                    if (periodoRef.current) periodoRef.current.value = grupoEdit.periodo || ""
                    if (mvpRef.current) mvpRef.current.value = grupoEdit.mvp || ""
                    setSelectedAlunos(grupoEdit.alunos || [])
                }
            }
        }
    }, [id])

    const handleAlunoToggle = (alunoId) => {
        setSelectedAlunos(prev =>
            prev.includes(alunoId)
                ? prev.filter(id => id !== alunoId)
                : [...prev, alunoId]
        )
    }

    const alunosFiltrados = alunos.filter(a =>
        a.nome.toLowerCase().includes(buscaAluno.toLowerCase()) ||
        a.matricula.includes(buscaAluno)
    )

    const validate = () => {
        const newErrors = {}
        const codigo = codigoRef.current?.value.trim()
        const nome = nomeRef.current?.value.trim()
        const data = dataRef.current?.value
        const ano = anoRef.current?.value
        const periodo = periodoRef.current?.value
        const mvp = mvpRef.current?.value

        if (!codigo) newErrors.codigo = "Código é obrigatório."
        if (!nome) newErrors.nome = "Nome é obrigatório."
        if (!data) newErrors.data = "Data é obrigatória."
        if (!ano) newErrors.ano = "Ano é obrigatório."
        if (!periodo) newErrors.periodo = "Período é obrigatório."
        if (!mvp) newErrors.mvp = "MVP é obrigatório."
        if (selectedAlunos.length === 0) newErrors.alunos = "Selecione ao menos um aluno."

        const storedGrupos = localStorage.getItem("grupos_mock")
        let gruposMock = storedGrupos ? JSON.parse(storedGrupos) : []
        const isDuplicate = gruposMock.some(g => g.codigo === codigo && g.id.toString() !== id)

        if (codigo && isDuplicate) {
            newErrors.codigo = "Código da equipe já está em uso."
        }

        return newErrors
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const validationErrors = validate()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }
        setErrors({})

        const payload = {
            id: id ? parseInt(id) : Date.now(),
            codigo: codigoRef.current.value.trim(),
            nome: nomeRef.current.value.trim(),
            data: dataRef.current.value,
            ano: anoRef.current.value,
            periodo: periodoRef.current.value,
            mvp: mvpRef.current.value,
            alunos: selectedAlunos,
        }

        const storedGrupos = localStorage.getItem("grupos_mock")
        let gruposMock = storedGrupos ? JSON.parse(storedGrupos) : []

        if (id) {
            const index = gruposMock.findIndex((g) => g.id.toString() === id)
            if (index !== -1) gruposMock[index] = payload
            setSuccessMsg(`Equipe atualizada com sucesso!`)
        } else {
            gruposMock.push(payload)
            setSuccessMsg(`Equipe cadastrada com sucesso!`)
        }

        localStorage.setItem("grupos_mock", JSON.stringify(gruposMock))

        setTimeout(() => {
            navigate("/grupos")
        }, 1500)
    }

    const handleLimpar = () => {
        if (codigoRef.current) codigoRef.current.value = ""
        if (nomeRef.current) nomeRef.current.value = ""
        if (dataRef.current) dataRef.current.value = ""
        if (anoRef.current) anoRef.current.value = ""
        if (periodoRef.current) periodoRef.current.value = ""
        if (mvpRef.current) mvpRef.current.value = ""
        setSelectedAlunos([])
        setErrors({})
        setSuccessMsg("")
    }

    return (
        <section className="min-h-screen bg-gray-50 flex flex-col ">
            <header className="bg-[#006b64] text-white px-6 py-4 shadow-md">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/grupos")}
                        className="text-white/80 hover:text-white hover:bg-white/20 px-2"
                        type="button"
                    >
                        <ArrowLeft size={18} className="mr-1" />
                        Voltar
                    </Button>
                    <div className="h-5 w-px bg-white/30 mx-1" />
                    <h1 className="text-lg font-semibold tracking-wide">
                        {id ? "Editar Grupo" : "Cadastro de Grupo"}
                    </h1>
                </div>
            </header>

            <main className="flex-1 flex items-start justify-center px-4 py-10">
                <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">

                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-[#006b64] p-2 rounded-lg">
                            <Users className="text-white" size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{id ? "Editar Grupo" : "Novo Grupo"}</h2>
                            <p className="text-sm text-gray-500">Preencha os dados da equipe do MVP.</p>
                        </div>
                    </div>

                    {successMsg && (
                        <div className="mb-5 bg-green-50 border border-green-300 text-green-700 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
                            <span>{successMsg}</span>
                            <button onClick={() => setSuccessMsg("")} type="button">
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* MVP */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de MVP <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30">
                                    <div className="bg-[#006b64] p-3"><Layers className="text-white" size={18} /></div>
                                    <select ref={mvpRef} className="flex-1 p-2 border-0 focus:ring-0 text-sm outline-none bg-white">
                                        <option value="">Selecione...</option>
                                        <option value="Frontend">MVP Frontend</option>
                                        <option value="Backend">MVP Backend</option>
                                        <option value="Mobile">MVP Mobile</option>
                                    </select>
                                </div>
                                {errors.mvp && <p className="text-red-500 text-xs mt-1">{errors.mvp}</p>}
                            </div>

                            {/* Data */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de Criação <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30">
                                    <div className="bg-[#006b64] p-3"><Calendar className="text-white" size={18} /></div>
                                    <Input type="date" ref={dataRef} className="flex-1 border-0 shadow-none focus:ring-0" />
                                </div>
                                {errors.data && <p className="text-red-500 text-xs mt-1">{errors.data}</p>}
                            </div>

                            {/* Ano */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ano <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30">
                                    <div className="bg-[#006b64] p-3"><Calendar className="text-white" size={18} /></div>
                                    <select ref={anoRef} className="flex-1 p-2 border-0 focus:ring-0 text-sm outline-none bg-white">
                                        <option value="">Selecione...</option>
                                        <option value="2024">2024</option>
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                    </select>
                                </div>
                                {errors.ano && <p className="text-red-500 text-xs mt-1">{errors.ano}</p>}
                            </div>

                            {/* Período */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Período <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30">
                                    <div className="bg-[#006b64] p-3"><Calendar className="text-white" size={18} /></div>
                                    <select ref={periodoRef} className="flex-1 p-2 border-0 focus:ring-0 text-sm outline-none bg-white">
                                        <option value="">Selecione...</option>
                                        <option value="1º Semestre">1º Semestre</option>
                                        <option value="2º Semestre">2º Semestre</option>
                                        <option value="1º Trimestre">1º Trimestre</option>
                                        <option value="2º Trimestre">2º Trimestre</option>
                                        <option value="3º Trimestre">3º Trimestre</option>
                                        <option value="4º Trimestre">4º Trimestre</option>
                                    </select>
                                </div>
                                {errors.periodo && <p className="text-red-500 text-xs mt-1">{errors.periodo}</p>}
                            </div>
                        </div>

                        {/* Código */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Código da Equipe <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30">
                                <div className="bg-[#006b64] p-3"><Hash className="text-white" size={18} /></div>
                                <Input type="text" placeholder="Ex: TIA-2024" ref={codigoRef} className="flex-1 border-0 shadow-none focus:ring-0" />
                            </div>
                            {errors.codigo && <p className="text-red-500 text-xs mt-1">{errors.codigo}</p>}
                        </div>

                        {/* Nome da Equipe */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome da Equipe <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30">
                                <div className="bg-[#006b64] p-3"><Users className="text-white" size={18} /></div>
                                <Input type="text" placeholder="Ex: Alpha Team" ref={nomeRef} className="flex-1 border-0 shadow-none focus:ring-0" />
                            </div>
                            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                        </div>

                        {/* Seleção de Alunos */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Alunos da Equipe <span className="text-red-500">*</span>
                            </label>

                            {/* Campo de Busca */}
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#006b64]/30 mb-2">
                                <div className="bg-[#006b64] p-3">
                                    <Search className="text-white" size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar aluno por nome ou matrícula..."
                                    value={buscaAluno}
                                    onChange={(e) => setBuscaAluno(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border-0 outline-none focus:ring-0 bg-white w-full"
                                />
                            </div>

                            <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto p-2 bg-gray-50 focus-within:ring-2 focus-within:ring-[#006b64]/30">
                                {alunos.length === 0 ? (
                                    <p className="text-sm text-gray-500 p-2 text-center">Nenhum aluno cadastrado no portal.</p>
                                ) : alunosFiltrados.length === 0 ? (
                                    <p className="text-sm text-gray-500 p-2 text-center">Nenhum aluno encontrado para a busca.</p>
                                ) : (
                                    alunosFiltrados.map(aluno => (
                                        <label key={aluno.id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-[#006b64] focus:ring-[#006b64]"
                                                checked={selectedAlunos.includes(aluno.id)}
                                                onChange={() => handleAlunoToggle(aluno.id)}
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{aluno.nome}</p>
                                                <p className="text-xs text-gray-500">{aluno.matricula}</p>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                            {errors.alunos && <p className="text-red-500 text-xs mt-1">{errors.alunos}</p>}
                        </div>

                        {/* Botões */}
                        <div className="flex gap-3 mt-4">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/grupos")}>
                                <ArrowLeft size={16} className="mr-1" /> Voltar
                            </Button>
                            <Button type="button" variant="outline" className="flex-1" onClick={handleLimpar}>
                                <Eraser size={16} className="mr-1" /> Limpar
                            </Button>
                            <Button type="submit" className="flex-1 bg-[#006b64] hover:bg-[#015c55] text-white">
                                <Save size={16} className="mr-1" /> Salvar
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </section>
    )
}

export default CadastroGrupo
