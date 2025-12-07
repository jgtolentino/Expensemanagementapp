// lib/deakinChartTheme.ts
/**
 * Deakin Enterprise 365 Chart Theme
 * For use with Recharts in Finance PPM
 */

export const DEAKIN_CHART_THEME = {
  colors: {
    categorical: ["#0078d4", "#4b38b3", "#00b294", "#f2c811", "#ff8c00"],
    heat: {
      low: "#f2c6c6",
      mid: "#c25757",
      high: "#580000",
    },
  },
  axis: {
    stroke: "#d4d4d4",
    tickColor: "#737373",
    labelColor: "#515151",
    fontSize: 12,
    fontFamily:
      '"Segoe UI", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  },
  grid: {
    stroke: "#e5e5e5",
    strokeDasharray: "3 3",
  },
  tooltip: {
    backgroundColor: "#111827",
    borderColor: "#374151",
    textColor: "#f9fafb",
  },
};

/**
 * Apply Deakin axis styling to Recharts XAxis/YAxis
 * 
 * Usage:
 * <XAxis {...applyDeakinAxisProps()} />
 */
export const applyDeakinAxisProps = () => ({
  tickLine: { stroke: DEAKIN_CHART_THEME.axis.stroke },
  axisLine: { stroke: DEAKIN_CHART_THEME.axis.stroke },
  tick: {
    fill: DEAKIN_CHART_THEME.axis.tickColor,
    fontSize: DEAKIN_CHART_THEME.axis.fontSize,
    fontFamily: DEAKIN_CHART_THEME.axis.fontFamily,
  },
});

/**
 * Apply Deakin grid styling to Recharts CartesianGrid
 * 
 * Usage:
 * <CartesianGrid {...applyDeakinGridProps()} />
 */
export const applyDeakinGridProps = () => ({
  stroke: DEAKIN_CHART_THEME.grid.stroke,
  strokeDasharray: DEAKIN_CHART_THEME.grid.strokeDasharray,
});

/**
 * Apply Deakin tooltip styling to Recharts Tooltip
 * 
 * Usage:
 * <Tooltip {...applyDeakinTooltipProps()} />
 */
export const applyDeakinTooltipProps = () => ({
  contentStyle: {
    backgroundColor: DEAKIN_CHART_THEME.tooltip.backgroundColor,
    borderColor: DEAKIN_CHART_THEME.tooltip.borderColor,
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.12)",
  },
  itemStyle: {
    color: DEAKIN_CHART_THEME.tooltip.textColor,
  },
  labelStyle: {
    color: DEAKIN_CHART_THEME.tooltip.textColor,
    fontWeight: 600,
  },
});

/**
 * Get categorical color by index
 * 
 * Usage:
 * <Bar fill={getChartColor(0)} />
 */
export const getChartColor = (index: number): string => {
  return DEAKIN_CHART_THEME.colors.categorical[
    index % DEAKIN_CHART_THEME.colors.categorical.length
  ];
};

/**
 * Get heatmap color based on value (0-1 range)
 * 
 * Usage:
 * const color = getHeatmapColor(0.75); // Returns interpolated color
 */
export const getHeatmapColor = (value: number): string => {
  // Simple 3-stop gradient interpolation
  if (value <= 0.5) {
    return interpolateColor(
      DEAKIN_CHART_THEME.colors.heat.low,
      DEAKIN_CHART_THEME.colors.heat.mid,
      value * 2
    );
  } else {
    return interpolateColor(
      DEAKIN_CHART_THEME.colors.heat.mid,
      DEAKIN_CHART_THEME.colors.heat.high,
      (value - 0.5) * 2
    );
  }
};

/**
 * Helper: Interpolate between two hex colors
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  
  if (!c1 || !c2) return color1;
  
  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));
  
  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
