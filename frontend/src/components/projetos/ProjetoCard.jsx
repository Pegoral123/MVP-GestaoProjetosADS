import { Edit, Trash2, ToggleLeft, ToggleRight, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"

const MVP_COLORS = {
    Frontend: "bg-blue-50 text-blue-700 border border-blue-200",
    Backend: "bg-green-50 text-green-700 border border-green-200",
    Mobile: "bg-purple-50 text-purple-700 border border-purple-200",
}

function ProjetoCard({ projeto, onDetalhes, onEdit, onDelete, onAlternarStatus }) {
    return (
        <div
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
        >
            <div className={`absolute top-0 left-0 w-1 h-full group-hover:w-2 transition-all ${projeto.mvp === 'Frontend' ? 'bg-blue-400' : projeto.mvp === 'Backend' ? 'bg-green-500' : 'bg-purple-500'}`}></div>

            <div className="pl-2">
                <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${projeto.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {projeto.status}
                    </span>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                        {projeto.ano}
                    </span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{projeto.nome}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-4 leading-relaxed">{projeto.descricao}</p>
                <span className={`text-[11px] font-semibold px-2 py-1 rounded ${MVP_COLORS[projeto.mvp] || 'bg-gray-100 text-gray-600'}`}>
                    {projeto.mvp}
                </span>
            </div>

            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100 pl-2">
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(projeto.id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                        title="Editar"
                    >
                        <Edit size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(projeto.id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                        title="Excluir"
                    >
                        <Trash2 size={16} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAlternarStatus(projeto.id)}
                        className={`h-8 w-8 p-0 ${projeto.status === 'Ativo' ? 'text-green-500 hover:text-gray-400' : 'text-gray-400 hover:text-green-500'}`}
                        title={projeto.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                    >
                        {projeto.status === 'Ativo'
                            ? <ToggleRight size={18} />
                            : <ToggleLeft size={18} />}
                    </Button>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDetalhes(projeto)}
                    className="text-[#006b64] hover:bg-[#006b64]/10 font-semibold text-xs gap-1"
                >
                    Detalhes <ChevronRight size={14} />
                </Button>
            </div>
        </div>
    )
}

export default ProjetoCard
