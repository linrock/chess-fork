// Functions temporarily as an event dispatcher

import Backbone from 'backbone'

export default class ChessMechanism extends Backbone.Model {

  initialize() {
    // k    - analysis variation index
    // j    - analysis varaition position index
    // mode - normal or analysis
  }
}

export const chess = new ChessMechanism
