import { NextRequest, NextResponse } from "next/server";

import { connectToDB } from "@/lib/db/mongoose";
import { getAuthUser } from "@/lib/auth/jwt";
import Visitor from "@/lib/models/visitor.model";

/**
 * Visitor analytics — peak hours, busiest days, average visit duration.
 */
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const { searchParams } = request.nextUrl;
    const days = parseInt(searchParams.get("days") || "30", 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const visitors = await Visitor.find({
      organizationId: authUser.organizationId,
      checkIn: { $gte: startDate },
    })
      .select("checkIn checkOut status purpose staff")
      .lean();

    // Total counts
    const total = visitors.length;
    const checkedIn = visitors.filter((v) => v.status === "Checked In").length;
    const signedOut = visitors.filter(
      (v) => v.status === "Signed Out" || v.status === "Checked Out"
    ).length;

    // Average duration (for visitors that checked out)
    const durations = visitors
      .filter((v) => v.checkIn && v.checkOut)
      .map((v) => {
        const checkIn = new Date(v.checkIn!).getTime();
        const checkOut = new Date(v.checkOut!).getTime();
        return (checkOut - checkIn) / (1000 * 60); // minutes
      })
      .filter((d) => d > 0 && d < 1440); // exclude outliers > 24h

    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : 0;

    // Peak hours
    const hourCounts: Record<number, number> = {};
    visitors.forEach((v) => {
      if (v.checkIn) {
        const hour = new Date(v.checkIn).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Busiest days of week
    const dayCounts: Record<number, number> = {};
    visitors.forEach((v) => {
      if (v.checkIn) {
        const day = new Date(v.checkIn).getDay();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    });

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const busiestDays = Object.entries(dayCounts)
      .map(([day, count]) => ({ day: dayNames[parseInt(day)], count }))
      .sort((a, b) => b.count - a.count);

    // Purpose breakdown
    const purposeCounts: Record<string, number> = {};
    visitors.forEach((v) => {
      if (v.purpose) {
        purposeCounts[v.purpose] = (purposeCounts[v.purpose] || 0) + 1;
      }
    });

    const purposeBreakdown = Object.entries(purposeCounts)
      .map(([purpose, count]) => ({ purpose, count }))
      .sort((a, b) => b.count - a.count);

    // Daily trend
    const dailyCounts: Record<string, number> = {};
    visitors.forEach((v) => {
      if (v.checkIn) {
        const dateKey = new Date(v.checkIn).toISOString().split("T")[0];
        dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
      }
    });

    const dailyTrend = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Most visited staff
    const staffCounts: Record<string, number> = {};
    visitors.forEach((v) => {
      if (v.staff) {
        staffCounts[v.staff] = (staffCounts[v.staff] || 0) + 1;
      }
    });

    const topHosts = Object.entries(staffCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      ok: true,
      period: { days, startDate, endDate: new Date() },
      summary: {
        total,
        checkedIn,
        signedOut,
        avgDurationMinutes: avgDuration,
        avgPerDay: Math.round(total / days),
      },
      peakHours,
      busiestDays,
      purposeBreakdown,
      dailyTrend,
      topHosts,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics." },
      { status: 500 }
    );
  }
}
