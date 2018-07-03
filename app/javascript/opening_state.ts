// For querying for openings that correspond to the move sequence
// in the current move list

import $ from 'jquery'

import { SanMove } from './types'
import store from './store'

interface OpeningData {
  eco: string,
  full_name: string
}

interface OpeningCache {
  [moves: string]: OpeningData
}

export default class OpeningState {
  private cache: OpeningCache = {}

  constructor() {
    store.watch(state => state.moves, async moves => {
      if (moves.length === 0) {
        return
      }
      const opening = await this.getOpeningForMoves(moves)
      store.dispatch(`setOpeningText`, `${opening.eco} – ${opening.full_name}`)
    })
  }

  private async getOpeningForMoves(moves: Array<SanMove>): Promise<OpeningData> {
    let opening = this.cache[moves.toString()]
    if (!opening) {
      opening = await this.remoteGetOpeningForMoves(moves)
      this.cache[moves.toString()] = opening
    }
    return opening
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
