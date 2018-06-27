const wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00))

const SEARCH_DEPTH = 12

class StockfishEngine {

  constructor(options = {}) {
    this.initialized = false
    this.initStockfish()
  }

  initStockfish() {
    if (this.initialized) {
      return
    }
    this.stockfish = new Worker(`/assets/stockfish${wasmSupported ? '.wasm' : ''}.js`)
    this.stockfish.postMessage('uci')
    this.debugMessages()
    this.initialized = true
  }

  debugMessages() {
    this.stockfish.addEventListener('message', e => console.log(e.data))
  }

  sendToStockfish(message) {
    console.warn(message)
    this.stockfish.postMessage(message)
  }

  analyze(fen, options = {}, callback = () => {}) {
    options.depth = +options.depth || SEARCH_DEPTH
    if (options.multipv && options.multipv > 1) {
      this.sendToStockfish(`setoption name MultiPV value ${options.multipv}`)
    }
    this.sendToStockfish(`position fen ${fen}`)
    this.emitEvaluationWhenDone(fen, options, callback)
    this.sendToStockfish(`go depth ${options.depth}`)
  }

  emitEvaluationWhenDone(fen, options, callback) {
    const start = new Date()
    const targetDepth = options.depth
    const targetMultiPv = options.multipv || 1

    let done = (state) => {
      callback({
        fen,
        eval: state.eval
      })
      this.stockfish.removeEventListener('message', processOutput)
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

      var currDepth = parseInt(matches[1])
      if (currDepth < targetDepth) {
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
          eval: {
            depth: currDepth,
            nps: parseInt(matches[5]),
            best: matches[6].split(' ')[0],
            cp: cp,
            mate: mate,
            pvs: []
          }
        }
      } else if (!state || currDepth < state.eval.depth) return // multipv progress

      state.eval.pvs[multiPv - 1] = {
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
