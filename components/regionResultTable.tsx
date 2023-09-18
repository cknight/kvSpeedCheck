import { regionMapper } from "../utils/util.ts";
import {
  ATOMIC_WRITE,
  EVENTUAL_READ,
  Stats,
  STRONG_READ,
  WRITE,
} from "../types.ts";
import RenderStats from "./stats.tsx";

export interface RegionResultTableProps {
  stats: Map<string, Stats>;
  pageLoads: number;
  dbs: Set<string>;
  region: string;
}

export default function RegionResultTable(props: RegionResultTableProps) {
  const sortedDbs = Array.from(props.dbs).sort((a, b) => a.localeCompare(b));

  return (
    <div id={regionMapper(props.region)} class="hidden">
      <p class="text-2xl font-bold">
        {regionMapper(props.region)} ({props.pageLoads} measurements)
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
            {[...sortedDbs].map((db) => {
              return (
                <tr class="border-b">
                  <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-3 font-medium bg-[#202020]">
                    {db}
                  </td>
                  <RenderStats
                    stats={props.stats.get(
                      props.region + "." + db + "." + WRITE,
                    )!}
                  />
                  <RenderStats
                    stats={props.stats.get(
                      props.region + "." + db + "." + ATOMIC_WRITE,
                    )!}
                  />
                  <RenderStats
                    stats={props.stats.get(
                      props.region + "." + db + "." + EVENTUAL_READ,
                    )!}
                  />
                  <RenderStats
                    stats={props.stats.get(
                      props.region + "." + db + "." + STRONG_READ,
                    )!}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
