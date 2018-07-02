// For querying for openings that correspond to the move sequence
// in the current move list

import $ from 'jquery'
import Backbone from 'backbone'

import { SanMove } from './types'
import store from './store'

interface OpeningData {
  eco: string,
  full_name: string
}

interface OpeningCache {
  [moves: string]: OpeningData
}

class OpeningState extends Backbone.Model {
  private cache: OpeningCache = {}

  initialize() {
    this.listenForEvents()
  }

  listenForEvents() {
    store.watch(state => state.moves, moves => {
      this.getOpeningForMoves(moves).then(opening => {
        let openingText = `${opening.eco} – ${opening.full_name}`
        this.set({ opening: openingText })
      })
    })
  }

  private getOpeningForMoves(moves: Array<SanMove>): Promise<OpeningData> {
    return new Promise((resolve, reject) => {
      const opening = this.cache[moves.toString()]
      if (opening) {
        resolve(opening)
      } else {
        return this.remoteGetOpeningForMoves(moves).then(opening => {
          this.cache[moves.toString()] = opening
          resolve(opening)
        })
      }
    })
  }

  private remoteGetOpeningForMoves(moves: Array<SanMove>): Promise<OpeningData> {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "/openings",
        type: "POST",
        data: { moves },
        dataType: "json",
        success: (data, status, xhr) => {
          if (data.opening) {
            resolve(data.opening)
          } else {
            reject(data)
          }
        },
        error: (xhr, status, error) => reject(moves)
      })
    })
  }
}

const openingState = new OpeningState

export default openingState
