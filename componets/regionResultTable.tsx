import { DbPerfRunSummary, Stats } from "../types.ts";

export interface RegionResultTableProps {
  summary: Map<string, Map<string, DbPerfRunSummary>>;
  region: string;
}

function stats(stats: number[]): Stats {
  if (stats.length === 0 || stats.includes(-1)) return {
    min: -1,
    max: -1,
    avg: -1,
    p95: -1,
  };

  const min = Math.min(...stats);
  const avg = stats.reduce((a, b) => a + b, 0) / stats.length;
  const p95 = stats.length > 10 ? stats.sort((a, b) => a - b)[Math.floor(stats.length * 0.95) - 1] : -1;
  const max = Math.max(...stats);

  return {
    min,
    max,
    avg,
    p95
  }
}

export default function RegionResultTable(props: RegionResultTableProps) {
  return (
    <>
    <p class="text-2xl font-bold">{props.region} ({[...props.summary.get(props.region)!.values()][0].writePerformanceStats.length} data points)</p>
    <table class="w-full mt-5 text-left border-b">
    <thead>
      <tr>
        <th>DB</th>
        <th>Write</th>
        <th>Atomic write</th>
        <th>Eventual read</th>
        <th>Strong read</th>
      </tr>
    </thead>
    <tbody>
      {
        [...props.summary.get(props.region)!.keys()].map(db => {
          const runsForDb = props.summary.get(props.region)!.get(db)!;
          const writeStats = stats(runsForDb.writePerformanceStats);
          const atomicWriteStats = stats(runsForDb.atomicWritePerformanceStats);
          const eventualReadStats = stats(runsForDb.eventualReadPerformanceStats);
          const strongReadStats = stats(runsForDb.strongReadPerformanceStats);
          return (
            <tr class="border-1">
              <td class="text-xl">{db}</td>
              <td>
                <p class="text-xl mt-2">{writeStats.avg.toFixed(2)}ms</p>
                <div class="text-xs mt-5">min: {writeStats.min}ms</div>
                <div class="text-xs">max: {writeStats.max}ms</div>
                <div class="text-xs">p95: {writeStats.p95}ms</div>
              </td>
              <td>
                <p class="text-xl mt-2">{atomicWriteStats.avg.toFixed(2)}ms</p>
                <div class="text-xs mt-5">min: {atomicWriteStats.min}ms</div>
                <div class="text-xs">max: {atomicWriteStats.max}ms</div>
                <div class="text-xs">p95: {atomicWriteStats.p95}ms</div>
              </td>
              <td>
                <p class="text-xl mt-2">{eventualReadStats.avg.toFixed(2)}ms</p>
                <div class="text-xs mt-5">min: {eventualReadStats.min}ms</div>
                <div class="text-xs">max: {eventualReadStats.max}ms</div>
                <div class="text-xs">p95: {eventualReadStats.p95}ms</div>
              </td>
              <td>
                <p class="text-xl mt-2">{strongReadStats.avg.toFixed(2)}ms</p>
                <div class="text-xs mt-5">min: {strongReadStats.min}ms</div>
                <div class="text-xs">max: {strongReadStats.max}ms</div>
                <div class="text-xs">p95: {strongReadStats.p95}ms</div>
              </td>
            </tr>
          )
          }
        )
      }
    </tbody>
  </table>
  </>
  );
}