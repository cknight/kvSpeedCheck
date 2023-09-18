import { Stats } from "../types.ts";

export interface RenderStatsProps {
  stats: Stats;
}

export default function RenderStats(props: RenderStatsProps) {
  if (props.stats.avg < 0) {
    return (
      <td>
        <p class="text-xl mt-2">-</p>
      </td>
    );
  } else {
    return (
      <td>
        <p class="text-xl mt-3">{props.stats.avg}ms</p>
        <div class="text-[10px] mt-4">
          <span class="min-w-[30px] inline-block">min:</span>
          {props.stats.min}ms
        </div>
        <div class="text-[10px]">
          <span class="min-w-[30px] inline-block">max:</span>
          {props.stats.max}ms
        </div>
        <div class="text-[10px] mb-2">
          <span class="min-w-[30px] inline-block">p95:</span>
          {props.stats.p95 < 0 ? "-" : props.stats.p95 + "ms"}
        </div>
      </td>
    );
  }
}
