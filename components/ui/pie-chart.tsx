"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart as RechartsChart } from "recharts"
import { Card, CardBody, CardHeader, CardFooter } from "@nextui-org/react"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface PieChartProps {
  title?: string
  description?: string
  data: Array<{
    label: string
    value: number
    fill: string
  }>
  config: ChartConfig
  trendingValue?: number
  subtitle?: string
}

export function PieChart({
  title,
  description,
  data,
  config,
  trendingValue,
  subtitle
}: PieChartProps) {
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0)
  }, [data])

  return (
    <Card className="flex flex-col shadow-none">
      <CardHeader className="flex flex-col items-center gap-1">
        {title && <h4 className="text-large font-semibold">{title}</h4>}
        {description && <p className="text-small text-default-500">{description}</p>}
      </CardHeader>
      <CardBody className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square w-full h-full"
        >
          <RechartsChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={80}
              strokeWidth={2}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalValue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-default-500"
                        >
                          Total
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
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