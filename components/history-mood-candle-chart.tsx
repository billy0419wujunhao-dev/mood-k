"use client";

import { useEffect, useRef } from "react";
import type { EChartsType } from "echarts";
import type { DiaryRecord } from "@/lib/diary-storage";

export type HistoryMoodCandleChartProps = {
  recordsAsc: DiaryRecord[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

/** ECharts candlestick：`[open, close, low, high]` */
function buildSeriesData(recordsAsc: DiaryRecord[], selectedDate: string | null) {
  return recordsAsc.map((r) => {
    const value: [number, number, number, number] = [r.open, r.close, r.low, r.high];
    const isDoji = r.close === r.open;
    const sel = r.date === selectedDate;
    if (isDoji) {
      return {
        value,
        itemStyle: {
          color: "#71717a",
          color0: "#71717a",
          borderColor: sel ? "#fafafa" : "#a1a1aa",
          borderColor0: sel ? "#fafafa" : "#a1a1aa",
          borderWidth: sel ? 2 : 1,
        },
      };
    }
    if (sel) {
      return {
        value,
        itemStyle: {
          borderColor: "#fafafa",
          borderColor0: "#fafafa",
          borderWidth: 2,
        },
      };
    }
    return { value };
  });
}

function buildOption(recordsAsc: DiaryRecord[], selectedDate: string | null) {
  const dates = recordsAsc.map((r) => r.date);
  const data = buildSeriesData(recordsAsc, selectedDate);
  return {
    backgroundColor: "transparent",
    animationDuration: 200,
    grid: {
      left: 44,
      right: 12,
      top: 20,
      bottom: dates.length > 10 ? 52 : 36,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross", lineStyle: { color: "#52525b", width: 1 } },
      backgroundColor: "rgba(24,24,27,0.94)",
      borderColor: "#3f3f46",
      textStyle: { color: "#e4e4e7", fontSize: 12 },
      formatter(params: unknown) {
        if (!Array.isArray(params)) return "";
        const axisVal = String((params[0] as { axisValue?: string }).axisValue ?? "");
        const candle = params.find(
          (p: { seriesType?: string }) => p.seriesType === "candlestick",
        ) as { data?: { value?: number[] } } | undefined;
        const raw = candle?.data && "value" in candle.data ? candle.data.value : undefined;
        if (!raw || !Array.isArray(raw) || raw.length < 4) return axisVal;
        const [o, c, l, h] = raw as [number, number, number, number];
        const kind = c > o ? "阳线" : c < o ? "阴线" : "十字星";
        return `${axisVal} · ${kind}\n开 ${o}　收 ${c}\n低 ${l}　高 ${h}`;
      },
    },
    xAxis: {
      type: "category",
      data: dates,
      boundaryGap: true,
      axisLine: { lineStyle: { color: "#3f3f46" } },
      axisTick: { show: false },
      axisLabel: {
        color: "#71717a",
        fontFamily: "ui-monospace, monospace",
        fontSize: 10,
        rotate: dates.length > 10 ? 40 : 0,
      },
    },
    yAxis: {
      type: "value",
      min: 1,
      max: 10,
      interval: 1,
      splitLine: { lineStyle: { color: "#27272a", type: "dashed" } },
      axisLine: { show: false },
      axisLabel: {
        color: "#71717a",
        fontFamily: "ui-monospace, monospace",
        fontSize: 10,
      },
    },
    series: [
      {
        type: "candlestick",
        data,
        barMaxWidth: 18,
        itemStyle: {
          color: "#34d399",
          color0: "#fb7185",
          borderColor: "#34d399",
          borderColor0: "#fb7185",
        },
      },
    ],
  };
}

export default function HistoryMoodCandleChart({
  recordsAsc,
  selectedDate,
  onSelectDate,
}: HistoryMoodCandleChartProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);
  const recordsRef = useRef(recordsAsc);
  recordsRef.current = recordsAsc;
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    if (recordsAsc.length === 0) {
      roRef.current?.disconnect();
      roRef.current = null;
      if (resizeHandlerRef.current) {
        window.removeEventListener("resize", resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }
      chartRef.current?.dispose();
      chartRef.current = null;
      return;
    }

    void import("echarts").then((echarts) => {
      if (!chartRef.current) {
        chartRef.current = echarts.init(el, undefined, { renderer: "canvas" });
        const resize = () => chartRef.current?.resize();
        resizeHandlerRef.current = resize;
        window.addEventListener("resize", resize);
        const ro = new ResizeObserver(resize);
        ro.observe(el);
        roRef.current = ro;
      }

      const chart = chartRef.current;
      if (!chart) return;

      chart.setOption(buildOption(recordsAsc, selectedDate), { notMerge: true });

      const handleClick = (p: {
        componentType?: string;
        seriesType?: string;
        dataIndex?: number;
      }) => {
        if (p.componentType === "series" && p.seriesType === "candlestick" && typeof p.dataIndex === "number") {
          const list = recordsRef.current;
          const d = list[p.dataIndex]?.date;
          if (d) onSelectDate(d);
        }
      };
      chart.off("click");
      chart.on("click", handleClick);
      chart.resize();
    });
  }, [recordsAsc, selectedDate, onSelectDate]);

  useEffect(() => {
    return () => {
      roRef.current?.disconnect();
      roRef.current = null;
      if (resizeHandlerRef.current) {
        window.removeEventListener("resize", resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  if (recordsAsc.length === 0) return null;

  return (
    <div
      ref={hostRef}
      className="h-[min(420px,55vh)] w-full min-h-[280px]"
      role="img"
      aria-label="历史情绪 K 线图，点击柱子可定位到对应日记"
    />
  );
}
