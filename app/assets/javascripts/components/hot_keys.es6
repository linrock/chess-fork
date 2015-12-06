{

  class HotKeys {

    constructor() {
      Mousetrap.bind(["left"],  () => { chess.prevMove() })
      Mousetrap.bind(["right"], () => { chess.nextMove() })
      // Mousetrap.bind(["up"],    () => { chess.prevEngineMove() })
      // Mousetrap.bind(["down"],  () => { chess.nextEngineMove() })
    }

  }

  Components.HotKeys = HotKeys

}
