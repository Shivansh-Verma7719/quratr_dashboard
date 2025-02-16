"use client";

import * as React from "react";
import { TrendingUp, ChevronsUpDown } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart as RechartsChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface HistoryLineChartProps {
  title?: string;
  description?: string;
  likesData: Array<{
    created_at: string;
    user_id: string;
    place_id: number;
  }>;
  dislikesData: Array<{
    created_at: string;
    user_id: string;
    place_id: number;
  }>;
  config: ChartConfig;
  trendingValue?: number;
  subtitle?: string;
  icon?: React.ReactNode;
}

// interface WeekData {
//   weekKey: string
//   startDate: string
//   endDate: string
//   likes: number
//   dislikes: number
// }

interface DataPoint {
  likes: number;
  dislikes: number;
  weekKey?: string;
  dateRange?: string;
  cumulativeLikes?: number;
  cumulativeDislikes?: number;
}

export function HistoryLineChart({
  title,
  description,
  likesData,
  dislikesData,
  config,
  trendingValue,
  subtitle,
  icon,
}: HistoryLineChartProps) {
  const [isMonthlyView, setIsMonthlyView] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const calculateCumulativeData = (data: DataPoint[]) => {
    return data.reduce((acc: DataPoint[], current, index) => {
      if (index === 0) {
        acc.push({
          ...current,
          cumulativeLikes: current.likes,
          cumulativeDislikes: current.dislikes
        });
      } else {
        const previous = acc[index - 1];
        acc.push({
          ...current,
          cumulativeLikes: (previous.cumulativeLikes || 0) + current.likes,
          cumulativeDislikes: (previous.cumulativeDislikes || 0) + current.dislikes
        });
      }
      return acc;
    }, []);
  };

  const processedData = React.useMemo(() => {
    if (isMonthlyView) {
      // Monthly view processing
      const monthMap = new Map<string, { likes: number; dislikes: number }>();

      likesData.forEach((like) => {
        const date = new Date(like.created_at);
        const monthKey = date.toLocaleString("default", { month: "short" });
        const current = monthMap.get(monthKey) || { likes: 0, dislikes: 0 };
        monthMap.set(monthKey, { ...current, likes: current.likes + 1 });
      });

      dislikesData.forEach((dislike) => {
        const date = new Date(dislike.created_at);
        const monthKey = date.toLocaleString("default", { month: "short" });
        const current = monthMap.get(monthKey) || { likes: 0, dislikes: 0 };
        monthMap.set(monthKey, { ...current, dislikes: current.dislikes + 1 });
      });

      const monthlyData = Array.from(monthMap.entries())
        .map(([monthKey, data]) => ({
          weekKey: monthKey,
          dateRange: monthKey,
          ...data,
        }))
        .sort((a, b) => {
          return new Date(`${a.weekKey} 1 2024`).getTime() - 
                 new Date(`${b.weekKey} 1 2024`).getTime();
        });

      return calculateCumulativeData(monthlyData);
    }

    // Existing weekly view processing
    // Create a map of week-based dates to count likes and dislikes
    const weekMap = new Map<
      string,
      {
        likes: number;
        dislikes: number;
        startDate: Date;
        endDate: Date;
      }
    >();

    // Helper function to get week info
    const getWeekInfo = (date: Date) => {
      const month = date.toLocaleString("default", { month: "short" });

      // Get the first day of the month
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

      // Calculate the week number based on the actual date
      const dayOfMonth = date.getDate();
      const startDate = new Date(date);

      // Set to Monday of the current week
      startDate.setDate(dayOfMonth - startDate.getDay() + 1);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      // Calculate week number (1-4 only)
      const weekNum = Math.ceil((dayOfMonth + firstDay.getDay() - 1) / 7);

      // If we're beyond week 4, roll over to next month
      if (weekNum > 4) {
        return {
          weekKey: `Week 1 ${endDate.toLocaleString("default", {
            month: "short",
          })}`,
          startDate,
          endDate,
        };
      }

      // If the week spans two months, decide which month to attribute it to
      const weekKey =
        endDate.getMonth() !== startDate.getMonth()
          ? dayOfMonth > 15
            ? `Week ${weekNum} ${month}`
            : `Week 1 ${endDate.toLocaleString("default", { month: "short" })}`
          : `Week ${weekNum} ${month}`;

      return { weekKey, startDate, endDate };
    };

    // Process likes
    likesData.forEach((like) => {
      const date = new Date(like.created_at);
      const { weekKey, startDate, endDate } = getWeekInfo(date);
      const current = weekMap.get(weekKey) || {
        likes: 0,
        dislikes: 0,
        startDate,
        endDate,
      };
      weekMap.set(weekKey, {
        ...current,
        likes: current.likes + 1,
      });
    });

    // Process dislikes
    dislikesData.forEach((dislike) => {
      const date = new Date(dislike.created_at);
      const { weekKey, startDate, endDate } = getWeekInfo(date);
      const current = weekMap.get(weekKey) || {
        likes: 0,
        dislikes: 0,
        startDate,
        endDate,
      };
      weekMap.set(weekKey, {
        ...current,
        dislikes: current.dislikes + 1,
      });
    });

    // Convert map to array and sort by date
    const weeklyData = Array.from(weekMap.entries())
      .map(([weekKey, data]) => ({
        weekKey,
        dateRange: `${data.startDate.getDate()} - ${data.endDate.getDate()}`,
        likes: data.likes,
        dislikes: data.dislikes,
      }))
      .sort((a, b) => {
        const [aWeek, aMonth] = a.weekKey.split(" ").slice(1);
        const [bWeek, bMonth] = b.weekKey.split(" ").slice(1);
        const monthOrder = new Date(`${aMonth} 1 2024`).getTime() - 
                          new Date(`${bMonth} 1 2024`).getTime();
        if (monthOrder !== 0) return monthOrder;
        return parseInt(aWeek) - parseInt(bWeek);
      });

    return calculateCumulativeData(weeklyData);
  }, [likesData, dislikesData, isMonthlyView]);

  return (
    <Card 
      className={`flex flex-col shadow-none transition-all duration-200 ${
        isDropdownOpen ? "blur-md" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-center justify-between gap-1">
        <div className="flex flex-col">
          {title && <h4 className="text-large font-semibold">{title}</h4>}
          {description && (
            <p className="text-small text-default-500">{description}</p>
          )}
        </div>
        <Dropdown 
          onOpenChange={(open) => setIsDropdownOpen(open)}
        >
          <DropdownTrigger>
            <Button
              variant="bordered"
              size="sm"
              endContent={<ChevronsUpDown className="w-4 h-4" />}
            >
              {isMonthlyView ? "Monthly View" : "Weekly View"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            className="text-sm"
            aria-label="View selection"
            onAction={(key) => setIsMonthlyView(key === "monthly")}
            selectedKeys={[isMonthlyView ? "monthly" : "weekly"]}
            selectionMode="single"
          >
            <DropdownItem key="weekly" className="text-sm">
              Weekly View
            </DropdownItem>
            <DropdownItem key="monthly" className="text-sm">
              Monthly View
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
      <CardBody className="flex-1 pb-0 h-full">
        <ChartContainer config={config} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsChart
              data={processedData}
              margin={{
                top: 5,
                right: 40,
                left: 5,
                bottom: 25, // Increased bottom margin for date range
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="weekKey"
                axisLine={true}
                tickLine={true}
                interval={0}
                tick={({ x, y, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={8}
                      textAnchor="middle"
                      fill="#666"
                      fontSize={12}
                    >
                      {payload.value}
                    </text>
                    <text
                      x={0}
                      y={0}
                      dy={25}
                      textAnchor="middle"
                      fill="#666"
                      fontSize={10}
                    >
                      {processedData[payload.index]?.dateRange}
                    </text>
                  </g>
                )}
              />
              <YAxis />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                name="Likes"
                dataKey="cumulativeLikes"
                stroke={config.likes.color}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                name="Dislikes"
                dataKey="cumulativeDislikes"
                stroke={config.dislikes.color}
                strokeWidth={2}
                dot={false}
              />
            </RechartsChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardBody>
      <CardFooter className="flex flex-col gap-2">
        {trendingValue && (
          <div className="flex items-center gap-2 text-small font-medium">
            Trending {trendingValue > 0 ? "up" : "down"} by{" "}
            {Math.abs(trendingValue)}% this month
            <TrendingUp className="h-4 w-4" />
          </div>
        )}
        {subtitle && (
          <div className="flex text-default-500 items-center gap-2 text-small font-medium">
            {icon}
            <div className="text-small text-default-500">{subtitle}</div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
