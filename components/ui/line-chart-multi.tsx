"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart as RechartsChart, XAxis } from "recharts"
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/react"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface LineChartProps {
  title?: string
  description?: string
  data: Array<{
    [key: string]: string | number
  }>
  config: ChartConfig
  trendingValue?: number
  subtitle?: string
  xAxisKey: string
}

export function LineChartMulti({
  title,
  description,
  data,
  config,
  trendingValue,
  subtitle,
  xAxisKey
}: LineChartProps) {
  const dataKeys = React.useMemo(() => {
    if (!data.length) return []
    return Object.keys(data[0]).filter(key => key !== xAxisKey)
  }, [data, xAxisKey])

  return (
    <Card className="flex flex-col shadow-none">
      <CardHeader className="flex flex-col items-center gap-1">
        {title && <h4 className="text-large font-semibold">{title}</h4>}
        {description && <p className="text-small text-default-500">{description}</p>}
      </CardHeader>
      <CardBody className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="w-full aspect-2/1"
        >
          <RechartsChart
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => typeof value === 'string' ? value.slice(0, 3) : value}
            />
            <ChartTooltip 
              cursor={false} 
              content={<ChartTooltipContent />} 
            />
            {dataKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </RechartsChart>
        </ChartContainer>
      </CardBody>
      <CardFooter className="flex flex-col gap-2">
        {trendingValue && (
          <div className="flex items-center gap-2 text-small font-medium">
            Trending up by {trendingValue}% this month
            <TrendingUp className="h-4 w-4" />
          </div>
        )}
        {subtitle && (
          <div className="text-small text-default-500">
            {subtitle}
          </div>
        )}
      </CardFooter>
    </Card>
  )
} 