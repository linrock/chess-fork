// Handles the internal state of chess positions/history
// Also functions as an event dispatcher

import Backbone from 'backbone'
import Immutable from 'immutable'
import Chess from 'chess.js'

import { FEN, ChessMove, SanMove } from './types'
import { world } from './world_state'
import analysisCache from './analysis/cache'

export default class ChessMechanism extends Backbone.Model {
  public mechanism = new Chess

  initialize() {
    // this.set({ fen })
  }
}

export const chess = new ChessMechanism
