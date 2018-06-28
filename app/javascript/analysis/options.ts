// sent to stockfish worker
export interface AnalysisOptions {
  multipv?: number
  depth?: number
}

export const defaultAnalysisOptions: AnalysisOptions = {
  multipv: 1,
  depth: 12
}
