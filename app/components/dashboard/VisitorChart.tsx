"use client";

import {
    LineChart,
    Line,
    XAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { day: "Mon", visitors: 12 },
    { day: "Tue", visitors: 18 },
    { day: "Wed", visitors: 15 },
    { day: "Thu", visitors: 22 },
    { day: "Fri", visitors: 30 },
    { day: "Sat", visitors: 17 },
    { day: "Sun", visitors: 10 },
];

export default function VisitorChart() {
    return (
        <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold mb-6">
                Visitor Check-ins
            </h2>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <XAxis dataKey="day" />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="visitors"
                        stroke="#2563eb"
                        strokeWidth={3}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}