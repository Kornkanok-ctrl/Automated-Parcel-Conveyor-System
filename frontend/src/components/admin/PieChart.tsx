"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useEffect, useMemo, useRef } from "react";
import { Package, CheckCircle, RotateCcw } from "lucide-react";

interface PieChartProps {
  stats: {
    waiting: number;
    success: number;
    failed: number;
  };
}

export default function PieChart({ stats }: PieChartProps) {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  const { waiting, success, failed } = stats;
  const total = waiting + success + failed;

  // Filter out zero values and prepare data
  const chartData = useMemo(() => {
    const allData = [
      { name: "รอรับพัสดุ", y: waiting, color: "#f59e0b" },
      { name: "รับพัสดุแล้ว", y: success, color: "#10b981" },
      { name: "ส่งคืนแล้ว", y: failed, color: "#ef4444" },
    ];
    return allData.filter(item => item.y > 0);
  }, [waiting, success, failed]);

  // Update chart data without re-creating
  useEffect(() => {
    if (chartRef.current?.chart) {
      const chart = chartRef.current.chart;
      const series = chart.series[0];
      if (series) {
        series.setData(chartData, true, { duration: 500 }, false);
      }
    }
  }, [chartData]);

  const chartOptions = useMemo(() => ({
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      height: 160,
      width: 160,
      spacing: [0, 0, 0, 0],
    },

    title: {
      text: undefined,
    },

    credits: {
      enabled: false,
    },

    tooltip: {
      enabled: true,
      outside: true,
      backgroundColor: "#1e293b",
      borderRadius: 8,
      borderWidth: 0,
      shadow: true,
      style: {
        fontSize: "12px",
        color: "#fff",
      },
      headerFormat: "",
      pointFormat: '<b>{point.name}</b><br/>{point.y} รายการ ({point.percentage:.1f}%)',
    },

    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },

    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        innerSize: "65%",
        size: "100%",
        borderWidth: 0,
        borderRadius: 4,
        shadow: false,
        states: {
          hover: {
            brightness: 0.05,
            halo: {
              size: 8,
              opacity: 0.25,
            },
          },
          select: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
      },
    },

    series: [
      {
        name: "สถานะ",
        type: "pie",
        enableMouseTracking: true,
        animation: {
          duration: 800,
        },
        colorByPoint: true,
        data: chartData,
      },
    ],
  }), [chartData]);

  // Legend items with icons
  const legendItems = [
    { 
      name: "รอรับพัสดุ", 
      value: waiting, 
      color: "#f59e0b", 
      bgColor: "bg-amber-50",
      icon: Package 
    },
    { 
      name: "รับพัสดุแล้ว", 
      value: success, 
      color: "#10b981", 
      bgColor: "bg-emerald-50",
      icon: CheckCircle 
    },
    { 
      name: "ส่งคืนแล้ว", 
      value: failed, 
      color: "#ef4444", 
      bgColor: "bg-red-50",
      icon: RotateCcw 
    },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 h-full">
      {/* Chart with center text */}
      <div className="relative flex-shrink-0">
        <HighchartsReact
          ref={chartRef}
          highcharts={Highcharts}
          options={chartOptions}
        />
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{total}</div>
            <div className="text-[10px] text-gray-500">รายการทั้งหมด</div>
          </div>
        </div>
      </div>

      {/* Custom Legend - ด้านล่าง */}
      <div className="w-full space-y-2">
        {legendItems.map((item) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
          const Icon = item.icon;
          
          return (
            <div 
              key={item.name}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${item.bgColor} transition-all duration-200 hover:scale-[1.01]`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">{item.value}</span>
                <span 
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white min-w-[44px] text-center"
                  style={{ backgroundColor: item.color }}
                >
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}