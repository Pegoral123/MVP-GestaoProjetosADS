import { Mail, Phone, Hash } from "lucide-react"

function AlunoCard({ aluno, onClick }) {
    const iniciais = aluno.nome
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-[#006b64]/30 transition-all cursor-pointer select-none"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Info principal */}
                <div className="flex items-center gap-3">
                    <div className="bg-[#006b64]/10 rounded-full w-11 h-11 flex items-center justify-center shrink-0">
                        <span className="text-[#006b64] font-bold text-sm">{iniciais}</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">{aluno.nome}</h3>
                        <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                            <Hash size={12} />
                            <span>{aluno.matricula}</span>
                        </div>
                    </div>
                </div>

                {/* Contatos apenas o visual */}
                <div className="flex flex-col sm:flex-row gap-2 text-sm pointer-events-none">
                    <span className="flex items-center gap-1.5 text-gray-400">
                        <Mail size={14} />
                        <span className="truncate max-w-[200px]">{aluno.email}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-400">
                        <Phone size={14} />
                        <span>{aluno.celular}</span>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default AlunoCard
