import { regionMapper } from "../utils/util.ts";
import {
  ATOMIC_WRITE,
  EVENTUAL_READ,
  Stats,
  STRONG_READ,
  WRITE,
} from "../types.ts";
import RenderStats from "./stats.tsx";

export interface OpResultsTablesProps {
  stats: Map<string, Stats>;
  regions: Set<string>;
  dbs: Set<string>;
}

export default function OperationAndDbResultsTables(
  props: OpResultsTablesProps,
) {
  const sortedRegions = Array.from(props.regions.keys()).sort((a, b) =>
    regionMapper(a).localeCompare(regionMapper(b))
  );
  const sortedDbs = Array.from(props.dbs).sort((a, b) => a.localeCompare(b));
  const operations = [
    {
      id: "eventualReadPerformance",
      name: "Eventual consistency read performance",
      key: EVENTUAL_READ,
    },
    {
      id: "strongReadPerformance",
      name: "Strong consistency read performance",
      key: STRONG_READ,
    },
    {
      id: "writePerformance",
      name: "Write performance",
      key: WRITE,
    },
    {
      id: "atomicWritePerformance",
      name: "Transactional write performance",
      key: ATOMIC_WRITE,
    },
  ];

  return (
    <>
      {
        //Output a table for each operation
        [...operations].map((operation) => {
          return (
            <>
              <div id={operation.id} class="hidden">
                <p class="text-2xl font-bold">{operation.name}</p>
                <div class="mt-5 overflow-x-auto border-1 rounded-md">
                  <table class="min-w-full text-left text-sm font-light bg-[#202020]">
                    <thead class="border-b font-medium">
                      <tr>
                        <th class="sticky left-0 z-10 px-6 py-4 bg-[#202525]">
                          DB
                        </th>
                        {[...sortedRegions].map((region) => (
                          <th class="min-w-[100px] bg-[#202525]">
                            {regionMapper(region)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...sortedDbs].map((db) => {
                        return (
                          <tr class="border-b">
                            <td class="font-medium sticky left-0 z-10 whitespace-nowrap px-6 py-4 bg-[#202020]">
                              {db}
                            </td>
                            {[...sortedRegions].map((region) => {
                              return (
                                <RenderStats
                                  stats={props.stats.get(
                                    region + "." + db + "." + operation.key,
                                  )!}
                                />
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          );
        })
      }
      {
        //Output a table for each db
        [...sortedDbs].map((db) => {
          return (
            <>
              <div id={db.replace(/\s/g, "")}>
                <p class="text-2xl font-bold">{db}</p>
                <div class="mt-5 overflow-x-auto border-1 rounded-md">
                  <table class="min-w-full text-left text-sm font-light bg-[#202020]">
                    <thead class="border-b font-medium">
                      <tr>
                        <th class="sticky left-0 z-10 px-6 py-4 bg-[#202c2c]">
                          Region
                        </th>
                        <th class="min-w-[100px] bg-[#202c2c]">Write</th>
                        <th class="min-w-[100px] bg-[#202c2c]">
                          Transactional<br />write
                        </th>
                        <th class="min-w-[100px] bg-[#202c2c]">
                          Eventual<br />read
                        </th>
                        <th class="min-w-[100px] bg-[#202c2c]">
                          Strong<br />read
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...sortedRegions].map((region) => {
                        return (
                          <tr class="border-b">
                            <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-4 font-medium bg-[#202020]">
                              {regionMapper(region)}
                            </td>
                            <RenderStats
                              stats={props.stats.get(
                                region + "." + db + "." + WRITE,
                              )!}
                            />
                            <RenderStats
                              stats={props.stats.get(
                                region + "." + db + "." + ATOMIC_WRITE,
                              )!}
                            />
                            <RenderStats
                              stats={props.stats.get(
                                region + "." + db + "." + EVENTUAL_READ,
                              )!}
                            />
                            <RenderStats
                              stats={props.stats.get(
                                region + "." + db + "." + STRONG_READ,
                              )!}
                            />
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          );
        })
      }
    </>
  );
}
