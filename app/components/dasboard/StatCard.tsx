interface StatCardProps {
    title: string;
    value: number;
}

export default function StatCard({
    title,
    value,
}: StatCardProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6">

            <p className="text-gray-500">
                {title}
            </p>

            <h2 className="text-4xl font-bold mt-3">
                {value}
            </h2>

        </div>
    );
}