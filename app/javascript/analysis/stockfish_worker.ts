import { FEN, UciMove } from '../types'

declare var WebAssembly: any

const wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00))

interface PositionVariation {
  cp: number
  mate: number|null
  pv: string
  best: UciMove
}

interface PositionEvaluation {
  depth: number
  nps: number
  best: UciMove
  cp: number
  mate: number|null
  pvs: Array<PositionVariation>
}

interface PositionAnalysis {
  fen: FEN
  state: {
    [evaluation: string]: PositionEvaluation
  }
}

interface AnalysisOptions {
  multipv?: number
  depth?: number
}

class StockfishEngine {
  private stockfish: Worker

  constructor() {
    this.stockfish = new Worker(`/assets/stockfish${wasmSupported ? '.wasm' : ''}.js`)
    this.stockfish.postMessage('uci')
    // this.debugMessages()
  }

  public analyze(fen: FEN, options: AnalysisOptions): Promise<PositionAnalysis> {
    options.depth = options.depth
    const { depth, multipv } = options
    this.stockfish.postMessage('position fen ' + fen)
    this.stockfish.postMessage('setoption name MultiPV value ' + multipv)
    return new Promise((resolve, reject) => {
      this.emitEvaluationWhenDone(fen, options, resolve)
      this.stockfish.postMessage('go depth ' + depth)
    })
  }

  private debugMessages() {
    this.stockfish.addEventListener('message', e => console.log(e.data))
  }

  private emitEvaluationWhenDone(
    fen: FEN,
    options: AnalysisOptions,
    callback: (analysis: PositionAnalysis) => void
  ) {
    const start = new Date()
    const targetDepth = options.depth

    const done = state => {
      this.stockfish.removeEventListener('message', processOutput)
      callback({ fen, state })
    }

    // Modified from lila/ui/analyse/src/ceval/stockfishProtocol.js
    //
    let state
    let processOutput = (e) => {
      if (e.data.indexOf('bestmove ') === 0) {
        done(state)
        return
      }

      var matches = e.data.match(/depth (\d+) .*multipv (\d+) .*score (cp|mate) ([-\d]+) .*nps (\d+) .*pv (.+)/)
      if (!matches) {
        return
      }

      var depth = parseInt(matches[1])
      if (depth < targetDepth) {
        return
      }

      var multiPv = parseInt(matches[2])
      var cp, mate

      if (matches[3] === 'cp') {
        cp = parseFloat(matches[4])
      } else {
        mate = parseFloat(matches[4])
      }

      if (fen.indexOf('w') === -1) {
        if (matches[3] === 'cp') cp = -cp
        else mate = -mate
      }

      if (multiPv === 1) {
        state = {
          evaluation: {
            depth,
            nps: parseInt(matches[5]),
            best: matches[6].split(' ')[0],
            cp,
            mate,
            pvs: []
          }
        }
      } else if (!state || depth < state.evaluation.depth) return // multipv progress

      state.evaluation.pvs[multiPv - 1] = {
        cp: cp,
        mate: mate,
        pv: matches[6],
        best: matches[6].split(' ')[0]
      }
    }

    this.stockfish.addEventListener('message', processOutput)
  }
}

const stockfish = new StockfishEngine

export default stockfish
