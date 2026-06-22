import GrupoCard from "./GrupoCard"

function SectionList({ title, items, icon, onCardClick, onStatusChange }) {
    return (
        <div className="mb-10">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
                {icon}
                <h2 className="text-xl font-bold text-gray-700">{title}</h2>
                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full ml-2">
                    {items.length}
                </span>
            </div>

            {items.length === 0 ? (
                <div className="text-gray-400 text-sm italic py-4">Nenhum grupo encontrado nesta categoria.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(g => (
                        <GrupoCard 
                            key={g.id} 
                            grupo={g} 
                            onClick={() => onCardClick(g)}
                            onStatusChange={onStatusChange}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default SectionList
