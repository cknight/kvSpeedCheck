export interface DbPerfRun {
  dbName: string;
  regionId: string;
  writePerformance: number;
  atomicWritePerformance: number;
  eventualReadPerformance: number;
  strongReadPerformance: number;
}

export interface DbPerfRunSummary {

  writePerformanceStats: number[];
  atomicWritePerformanceStats: number[];
  eventualReadPerformanceStats: number[];
  strongReadPerformanceStats: number[];
}

export interface Stats {
  min: number;
  max: number;
  avg: number;
  p95: number;
}