interface StatCardProps {
    title: string;
    value: number;
}

export default function StatCard({
    title,
    value,
}: StatCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 boarder border-gray-200">

            <p className="text-gray-500 text-sm">
                {title}
            </p>

            <h2 className="text-4xl font-bold text-slate-800 mt-3">
                {value}
            </h2>

        </div>
    );
}