"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const checkIns = [
  { day: "Mon", visitors: 12 },
  { day: "Tue", visitors: 18 },
  { day: "Wed", visitors: 15 },
  { day: "Thu", visitors: 22 },
  { day: "Fri", visitors: 30 },
  { day: "Sat", visitors: 17 },
  { day: "Sun", visitors: 10 },
];

const checkOuts = [
  { day: "Mon", visitors: 8 },
  { day: "Tue", visitors: 14 },
  { day: "Wed", visitors: 11 },
  { day: "Thu", visitors: 18 },
  { day: "Fri", visitors: 24 },
  { day: "Sat", visitors: 15 },
  { day: "Sun", visitors: 7 },
];

export default function VisitorChart() {
  const [type, setType] = useState("checkins");

  const data = type === "checkins" ? checkIns : checkOuts;

  return (
    <div className="w-full h-full">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-xl font-semibold">
            Visitor Activity
          </h2>

          <p className="text-sm text-muted-foreground">
            Last 7 Days
          </p>
        </div>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-input bg-background px-4 py-2 text-foreground"
        >
          <option value="checkins">
            Check-ins
          </option>

          <option value="checkouts">
            Check-outs
          </option>
        </select>

      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="visitors"
            stroke="var(--primary)"
            strokeWidth={4}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />

        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-4 gap-4 mt-8">

        <div className="rounded-lg bg-secondary p-4">

          <p className="text-sm text-muted-foreground">
            Today&apos;s Visitors
          </p>

          <h3 className="text-2xl font-bold">
            18
          </h3>

        </div>

        <div className="rounded-lg bg-secondary p-4">

          <p className="text-sm text-muted-foreground">
            This Week
          </p>

          <h3 className="text-2xl font-bold">
            124
          </h3>

        </div>

        <div className="rounded-lg bg-secondary p-4">

          <p className="text-sm text-muted-foreground">
            Average / Day
          </p>

          <h3 className="text-2xl font-bold">
            18
          </h3>

        </div>

        <div className="rounded-lg bg-secondary p-4">

          <p className="text-sm text-muted-foreground">
            Peak Day
          </p>

          <h3 className="text-2xl font-bold">
            Friday
          </h3>

        </div>

      </div>

    </div>
  );
}
