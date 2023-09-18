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

export const EVENTUAL_READ = "eventualRead";
export const STRONG_READ = "strongRead";
export const WRITE = "write";
export const ATOMIC_WRITE = "atomicWrite";
export const DB_PERF_RUN = "dbPerfRun";
export const STATS = "stats";
export const REGION_PAGE_LOADS = "regionPageLoads";
export const DELIVERY_FAILED = "deliveryFailed";
export const NEXT_UPDATE = "nextUpdate";
export const COMPUTE_STATS_TOPIC = "computeStatsTopic";
export const LOCK = "lock";
export const LAST_MESSAGE_DELIVERY = "lastMessageDelivery";
