import { regionMapper, stats } from "../db/util.ts";
import { DbPerfRunSummary, Stats } from "../types.ts";
import RenderStats from "./stats.tsx";

export interface OpResultsTablesProps {
  summary: Map<string, Map<string, DbPerfRunSummary>>;
}

export default function OperationAndDbResultsTables(props:OpResultsTablesProps) {
  //Map of db -> Map of region -> performance
  const eventualReadSummary = new Map<string, Map<string, Stats>>();
  const writeSummary = new Map<string, Map<string, Stats>>();
  const atomicWriteSummary = new Map<string, Map<string, Stats>>();
  const strongReadSummary = new Map<string, Map<string, Stats>>();
  const dbSet = new Set<string>();

  for (const [region, dbPerfMap] of props.summary) {
    const dbPerfMapIterable = dbPerfMap.entries();
    for (const [db, dbPerfRun] of dbPerfMapIterable) {
      if (!eventualReadSummary.has(db)) eventualReadSummary.set(db, new Map<string, Stats>());
      if (!writeSummary.has(db)) writeSummary.set(db, new Map<string, Stats>());
      if (!atomicWriteSummary.has(db)) atomicWriteSummary.set(db, new Map<string, Stats>());
      if (!strongReadSummary.has(db)) strongReadSummary.set(db, new Map<string, Stats>());

      dbSet.add(db);
      eventualReadSummary.get(db)!.set(region, stats(dbPerfRun.eventualReadPerformanceStats));
      writeSummary.get(db)!.set(region, stats(dbPerfRun.writePerformanceStats));
      atomicWriteSummary.get(db)!.set(region, stats(dbPerfRun.atomicWritePerformanceStats));
      strongReadSummary.get(db)!.set(region, stats(dbPerfRun.strongReadPerformanceStats));
    }
  }
  const sortedRegions = Array.from(props.summary.keys()).sort((a, b) => regionMapper(a).localeCompare(regionMapper(b)));
  const sortedDbs = Array.from(dbSet).sort((a, b) => a.localeCompare(b));
  const operations = [
    {
      id: "eventualReadPerformance",
      name: "Eventual consistency read performance",
      summary: eventualReadSummary
    },
    {
      id: "strongReadPerformance",
      name: "Strong consistency read performance",
      summary: strongReadSummary
    },
    {
      id: "writePerformance",
      name: "Write performance",
      summary: writeSummary
    },
    {
      id: "atomicWritePerformance",
      name: "Transactional write performance",
      summary: atomicWriteSummary
    }
  ]

  return (
    <>
    {
      //Output a table for each operation
      [...operations].map(operation => {
        return (
          <>
            <div id={operation.id} class="hidden">
              <p class="text-2xl font-bold">{operation.name}</p>
              <div class="mt-5 overflow-x-auto border-1 rounded-md">
                <table class="min-w-full text-left text-sm font-light bg-[#202020]">
                  <thead class="border-b font-medium">
                    <tr>
                      <th class="sticky left-0 z-10 px-6 py-4 bg-[#202525]">DB</th>
                      {[...sortedRegions].map(region => <th  class="min-w-[100px] bg-[#202525]">{regionMapper(region)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {
                      [...sortedDbs].map(db => {
                        return (
                          <tr class="border-b">
                            <td class="font-medium sticky left-0 z-10 whitespace-nowrap px-6 py-4 bg-[#202020]">{db}</td>
                            {
                              [...sortedRegions].map(region => {
                                return (
                                  <RenderStats stats={operation.summary.get(db)!.get(region)!}/>
                                )
                              })
                            }
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      })
    }
    {
      //Output a table for each db
      [...sortedDbs].map(db => {
        return (
          <>
            <div id={db.replace(/\s/g,'')}>
              <p class="text-2xl font-bold">{db}</p>
              <div class="mt-5 overflow-x-auto border-1 rounded-md">
                <table class="min-w-full text-left text-sm font-light bg-[#202020]">
                  <thead class="border-b font-medium">
                    <tr>
                      <th class="sticky left-0 z-10 px-6 py-4 bg-[#202c2c]">Region</th>
                      <th class="min-w-[100px] bg-[#202c2c]">Write</th>
                      <th class="min-w-[100px] bg-[#202c2c]">Transactional<br/>write</th>
                      <th class="min-w-[100px] bg-[#202c2c]">Eventual<br/>read</th>
                      <th class="min-w-[100px] bg-[#202c2c]">Strong<br/>read</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      [...sortedRegions].map(region => {
                        return (
                          <tr class="border-b">
                            <td class="sticky left-0 z-10 whitespace-nowrap px-6 py-4 font-medium bg-[#202020]">{regionMapper(region)}</td>
                            <RenderStats stats={writeSummary.get(db)!.get(region)!}/>
                            <RenderStats stats={atomicWriteSummary.get(db)!.get(region)!}/>
                            <RenderStats stats={eventualReadSummary.get(db)!.get(region)!}/>
                            <RenderStats stats={strongReadSummary.get(db)!.get(region)!}/>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </>
          
        )
      })
    }
    </>
  );
}