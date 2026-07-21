interface StatCardProps {
    title: string;
    value: number;
}

export default function StatCard({
    title,
    value,
}: StatCardProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">

            <p className="text-sm text-muted-foreground">
                {title}
            </p>

            <h2 className="mt-3 text-4xl font-bold text-foreground">
                {value}
            </h2>

        </div>
    );
}
