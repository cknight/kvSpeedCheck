import { Stats } from "../types.ts";

export interface RenderStatsProps {
  stats: Stats;
}

export default function RenderStats(props: RenderStatsProps) {
  if (props.stats.avg === -1) {
    return (
      <td>
        <p class="text-xl mt-2">-</p>
      </td>
    );
  } else {
    return (
      <td>
        <p class="text-xl mt-2">{props.stats.avg}ms</p>
        <div class="text-[10px] mt-5">min: {props.stats.min}ms</div>
        <div class="text-[10px]">max: {props.stats.max}ms</div>
        <div class="text-[10px] mb-2">p95: {props.stats.p95}ms</div>
      </td>
    );
  }
}

