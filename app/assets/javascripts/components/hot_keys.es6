{

  class HotKeys {

    constructor() {
      Mousetrap.bind(["left"], () => { chess.prevMove() });
      Mousetrap.bind(["right"], () => { chess.nextMove() });
    }

  }

  Components.HotKeys = HotKeys;

}
