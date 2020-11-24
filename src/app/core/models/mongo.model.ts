export interface MongoUpdateResults {
  lastErrorObject: { n: number; updatedExisting: boolean };
  ok: number;
  value: { sessionDate: string; _id: string };
}

export interface MongoDeleteResults {
  connection: object;
  deleteCount: number;
  n: number;
  ok: number;
  result: { n: number; ok: number };
}
