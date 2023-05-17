import { stats } from "../db/util.ts";
import { DbPerfRunSummary, Stats } from "../types.ts";
import RenderStats from "./stats.tsx";

export interface RegionResultTableProps {
  summary: Map<string, Map<string, DbPerfRunSummary>>;
  region: string;
}

export default function RegionResultTable(props: RegionResultTableProps) {
  return (
    <div id={props.region}>
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
                  <RenderStats stats={writeStats}/>
                  <RenderStats stats={atomicWriteStats}/>
                  <RenderStats stats={eventualReadStats}/>
                  <RenderStats stats={strongReadStats}/>
                </tr>
              )
              }
            )
          }
        </tbody>
      </table>
    </div>
  );
}