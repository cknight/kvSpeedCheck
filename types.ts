export interface dbPerfRun {
  dbName: string;
  regionId: string;
  writePerformance: number;
  atomicWritePerformance: number;
  eventualReadPerformance: number;
  strongReadPerformance: number;
}
