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

  //delete me
  const unknownPerf = props.summary.get("unknown")!;
  props.summary.set('another region', unknownPerf);
  props.summary.set('another region2', unknownPerf);
  props.summary.set('another region3', unknownPerf);
  props.summary.set('another region4', unknownPerf);
  props.summary.set('another region5', unknownPerf);
  props.summary.set('another region6', unknownPerf);
  props.summary.set('another region7', unknownPerf);
  props.summary.set('another region8', unknownPerf);
  props.summary.set('another region9', unknownPerf);

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
  const sortedRegions = Array.from(props.summary.keys()).sort((a, b) => a.localeCompare(b));
  const sortedDbs = Array.from(dbSet).sort((a, b) => a.localeCompare(b));
  const operations = [
    {
      id: "eventualReadPerformance",
      name: "Eventual consistency read perfomance",
      summary: eventualReadSummary
    },
    {
      id: "strongReadPerformance",
      name: "Strong consistency read perfomance",
      summary: eventualReadSummary
    },
    {
      id: "writePerformance",
      name: "Write perfomance",
      summary: writeSummary
    },
    {
      id: "atomicWritePerformance",
      name: "Atomic/transaction write perfomance",
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
            <div id={operation.id}>
              <p class="text-2xl font-bold">{operation.name}</p>
              <div class="overflow-x-scroll">
                <table class="w-full mt-5 text-left border-b">
                  <thead>
                    <tr>
                      <th class="sticky left-0 z-10 p-3">DB</th>
                      {[...sortedRegions].map(region => <th class="p-3">{regionMapper(region)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {
                      [...sortedDbs].map(db => {
                        return (
                          <tr class="border-1">
                            <td class="sticky left-0 z-10 p-3">{db}</td>
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
              <div class="overflow-x-scroll">
                <table class="w-full mt-5 text-left border-b">
                  <thead>
                    <tr>
                      <th class="sticky left-0 z-10 p-3">DB</th>
                      <th>Write</th>
                      <th>Atomic write</th>
                      <th>Eventual read</th>
                      <th>Strong read</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      [...sortedRegions].map(region => {
                        return (
                          <tr class="border-1">
                            <td class="sticky left-0 z-10 p-3">{regionMapper(region)}</td>
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