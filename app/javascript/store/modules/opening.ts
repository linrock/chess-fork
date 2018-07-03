// For querying for openings that correspond to the move sequence
// in the current move list

import $ from 'jquery'

import { SanMove } from '../../types'

interface OpeningData {
  eco: string,
  full_name: string
}

interface OpeningCache {
  [moves: string]: OpeningData
}

class OpeningStore {
  private readonly cache: OpeningCache = {}

  public async getOpeningForMoves(moves: Array<SanMove>): Promise<OpeningData> {
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

const openingStore = new OpeningStore

export default {
  state: {
    eco: null,
    fullName: null,
  },
  
  mutations: {
    setOpening(state, opening) {
      state.eco = opening.eco
      state.fullName = opening.full_name
    }
  },
  
  actions: {
    async getOpeningForMoves({ commit }, moves) {
      commit(`setOpening`, await openingStore.getOpeningForMoves(moves))
    }
  },

  getters: {
    openingText(state) {
      return `${state.eco} – ${state.fullName}`
    }
  }
}
