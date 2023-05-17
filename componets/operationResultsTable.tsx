import { stats } from "../db/util.ts";
import { DbPerfRunSummary, Stats } from "../types.ts";
import RenderStats from "./stats.tsx";

export interface OpResultsTablesProps {
  summary: Map<string, Map<string, DbPerfRunSummary>>;
}

export default function OperationResultsTables(props:OpResultsTablesProps) {
  //Map of db -> Map of region -> performance
  const readSummary = new Map<string, Map<string, Stats>>();
  const writeSummary = new Map<string, Map<string, Stats>>();
  const atomicWriteSummary = new Map<string, Map<string, Stats>>();
  const eventualReadSummary = new Map<string, Map<string, Stats>>();
  const dbSet = new Set<string>();

  for (const [region, dbPerfMap] of props.summary) {
    for (const [db, dbPerfRun] of dbPerfMap) {
      if (!readSummary.has(db)) readSummary.set(db, new Map<string, Stats>());
      if (!writeSummary.has(db)) writeSummary.set(db, new Map<string, Stats>());
      if (!atomicWriteSummary.has(db)) atomicWriteSummary.set(db, new Map<string, Stats>());
      if (!eventualReadSummary.has(db)) eventualReadSummary.set(db, new Map<string, Stats>());

      dbSet.add(db);
      readSummary.get(db)!.set(region, stats(dbPerfRun.eventualReadPerformanceStats));
      writeSummary.get(db)!.set(region, stats(dbPerfRun.writePerformanceStats));
      atomicWriteSummary.get(db)!.set(region, stats(dbPerfRun.atomicWritePerformanceStats));
      eventualReadSummary.get(db)!.set(region, stats(dbPerfRun.eventualReadPerformanceStats));
    }
  }
  const sortedRegions = Array.from(props.summary.keys()).sort((a, b) => a.localeCompare(b));
  const sortedDbs = Array.from(dbSet).sort((a, b) => a.localeCompare(b));

  return (
    <div id="readPerformance">
      <p class="text-2xl font-bold">Read performance</p>
      <table class="w-full mt-5 text-left border-b">
        <thead>
          <tr>
            <th>DB</th>
            {[...sortedRegions].map(region => <th>{region}</th>)}
          </tr>
        </thead>
        <tbody>
          {
            [...sortedDbs].map(db => {
              return (
                <tr class="border-1">
                  <td>{db}</td>
                  {
                    [...sortedRegions].map(region => {
                      return (
                        <RenderStats stats={readSummary.get(db)!.get(region)!}/>
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
  );
}