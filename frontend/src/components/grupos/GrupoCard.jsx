import { Hash, FolderX, Calendar, Layers, Users, CheckCircle, Clock } from "lucide-react"

function GrupoCard({ grupo, onClick, onStatusChange }) {
    return (
        <div
            onClick={onClick}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-3 group relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-[#006b64] group-hover:w-2 transition-all"></div>

            <div className="flex justify-between items-start pl-2">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        {grupo.nome}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Hash size={14} />
                        <span>{grupo.id}</span>
                    </div>
                </div>
                {!grupo.projeto && (
                    <div className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-700 flex items-center gap-1">
                        <FolderX size={12} />
                        Sem projeto
                    </div>
                )}
            </div>

            <div className="pl-2 flex flex-wrap gap-2 text-xs mt-2">
                <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded flex items-center gap-1">
                    <Calendar size={12} /> {grupo.ano || (grupo.data ? new Date(grupo.data).getFullYear() : '')} - {grupo.periodo}
                </span>
                <span className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded flex items-center gap-1">
                    <Layers size={12} /> {grupo.data}
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded text-gray-600 font-semibold flex items-center gap-1">
                    <Users size={12} />
                    {grupo.totalAlunos ?? grupo.total_alunos ?? 0} alunos
                </span>
            </div>

            {grupo.projeto && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between pl-2">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                        {grupo.status === 'Concluído' ? (
                            <div className="bg-green-100 p-1 rounded-full text-green-600">
                                <CheckCircle size={12} />
                            </div>
                        ) : (
                            <div className="bg-blue-100 p-1 rounded-full text-blue-600 animate-pulse">
                                <Clock size={12} />
                            </div>
                        )}
                        Status:
                    </div>
                    <select
                        value={grupo.status || "Em andamento"}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onStatusChange(grupo.id, e.target.value)}
                        className={`text-xs font-bold py-1.5 px-3 rounded-lg border outline-none transition-all cursor-pointer shadow-sm ${grupo.status === "Concluído"
                            ? "bg-green-50 border-green-200 text-green-700 focus:ring-2 focus:ring-green-500/20"
                            : "bg-blue-50 border-blue-200 text-blue-700 focus:ring-2 focus:ring-blue-500/20"
                            }`}
                    >
                        <option value="Em andamento">Em andamento</option>
                        <option value="Concluído">Concluído</option>
                    </select>
                </div>
            )}
        </div>
    )
}

export default GrupoCard
