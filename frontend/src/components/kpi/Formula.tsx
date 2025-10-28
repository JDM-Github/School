
export function Formula({ name, formula }: { name: string; formula: string }) {
    return (
        <div className="border-l-4 border-blue-500 pl-3">
            <h3 className="text-sm font-semibold text-gray-700">{name}</h3>
            <p className="text-xs text-gray-500">{formula}</p>
        </div>
    );
}
