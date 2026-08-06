"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function AnalyticsChart({ data }: { data: Array<{ day: string; page_views: number; outbound_clicks: number }> }) {
  return <div className="chart-card"><ResponsiveContainer width="100%" height={320}><LineChart data={data}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="day"/><YAxis allowDecimals={false}/><Tooltip/><Line type="monotone" dataKey="page_views" name="Visualizações" stroke="var(--brand)" strokeWidth={3}/><Line type="monotone" dataKey="outbound_clicks" name="Cliques" stroke="var(--accent)" strokeWidth={3}/></LineChart></ResponsiveContainer></div>;
}
