"use client";

import { ChevronsUpDown } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import React from "react";
import { 
  Card, 
  CardBody, 
  CardHeader,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button 
} from "@nextui-org/react";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface RadialChartProps {
  title?: string;
  description?: string;
  data: { attribute: string; likesData: number; dislikesData: number }[];
  chartConfig: ChartConfig;
}

export function RadialChart({ title, description, data, chartConfig }: RadialChartProps) {
  const [viewType, setViewType] = React.useState<"both" | "likes" | "dislikes">("both");
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);


  return (
    <Card className={`flex flex-col shadow-none transition-all duration-200 ${
      isDropdownOpen ? "blur-md" : ""
    }`}>
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
              {viewType === "both" ? "Both Views" : 
               viewType === "likes" ? "Likes Only" : "Dislikes Only"}
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            className="text-sm"
            aria-label="View selection"
            onAction={(key) => setViewType(key as "both" | "likes" | "dislikes")}
            selectedKeys={[viewType]}
            selectionMode="single"
          >
            <DropdownItem key="both" className="text-sm">
              Both Views
            </DropdownItem>
            <DropdownItem key="likes" className="text-sm">
              Likes Only
            </DropdownItem>
            <DropdownItem key="dislikes" className="text-sm">
              Dislikes Only
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </CardHeader>
      <CardBody className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full w-full"
        >
          <RadarChart data={data}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="attribute" />
            <PolarGrid />
            {(viewType === "both" || viewType === "likes") && (
              <Radar
                dataKey="likesData"
                name="Likes"
                fill={chartConfig.likes.color}
                fillOpacity={0.6}
                dot={{
                  r: 4,
                  fillOpacity: 1,
                }}
              />
            )}
            {(viewType === "both" || viewType === "dislikes") && (
              <Radar
                dataKey="dislikesData"
                name="Dislikes"
                fill={chartConfig.dislikes.color}
                fillOpacity={0.6}
                dot={{
                  r: 4,
                  fillOpacity: 1,
                }}
              />
            )}
          </RadarChart>
        </ChartContainer>
      </CardBody>
    </Card>
  );
}
