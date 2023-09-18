import { regionMapper, stats } from "../db/util.ts";
import { DbPerfRunSummary, Stats } from "../types.ts";
import RenderStats from "./stats.tsx";

export interface RegionResultTableProps {
  summary: Map<string, Map<string, DbPerfRunSummary>>;
  region: string;
}

export default function RegionResultTable(props: RegionResultTableProps) {
  return (
    <div id={regionMapper(props.region)} class="hidden">
      <p class="text-2xl font-bold">
        {regionMapper(props.region)}{" "}
        ({[...props.summary.get(props.region)!.values()][0]
          .writePerformanceStats.length} page loads)
      </p>
      <div class="mt-5 overflow-x-auto border-1 rounded-md">
        <table class="min-w-full text-left text-sm font-light bg-[#202020]">
          <thead class="border-b font-medium">
            <tr>
              <th class="sticky left-0 z-10 px-6 py-3 bg-[#202c2c]">DB</th>
              <th class="min-w-[100px] bg-[#202c2c]">Write</th>
              <th class="min-w-[100px] bg-[#202c2c]">Transactional write</th>
              <th class="min-w-[100px] bg-[#202c2c]">Eventual read</th>
              <th class="min-w-[100px] bg-[#202c2c]">Strong read</th>
            </tr>
          </thead>
          <tbody>
            {[...props.summary.get(props.region)!.keys()].map((db) => {
              const runsForDb = props.summary.get(props.region)!.get(db)!;
              const writeStats = stats(runsForDb.writePerformanceStats);
              const atomicWriteStats = stats(
                runsForDb.atomicWritePerformanceStats,
              );
              const eventualReadStats = stats(
                runsForDb.eventualReadPerformanceStats,
              );
              const strongReadStats = stats(
                runsForDb.strongReadPerformanceStats,
              );
              return (
                <tr class="border-b">
                  <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-3 font-medium bg-[#202020]">
                    {db}
                  </td>
                  <RenderStats stats={writeStats} />
                  <RenderStats stats={atomicWriteStats} />
                  <RenderStats stats={eventualReadStats} />
                  <RenderStats stats={strongReadStats} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
