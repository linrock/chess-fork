// For querying for openings that correspond to the move sequence
// in the current move list

import $ from 'jquery'
import Backbone from 'backbone'
import Immutable from 'immutable'

import { world } from './world_state'

interface OpeningResponse {
  eco: string,
  full_name: string
}

class OpeningCache {
  private openings: Immutable.Map<Array<string>, Immutable.Map<string, any>>

  constructor() {
    this.openings = Immutable.Map()
  }

  getOpening(moves) {
    return this.openings.get(moves)
  }

  setOpening(moves, opening) {
    this.openings = this.openings.set(moves, Immutable.Map(opening))
  }
}


class OpeningState extends Backbone.Model {
  private cache: OpeningCache

  initialize() {
    this.cache = new OpeningCache()
    this.listenForEvents()
  }

  listenForEvents() {
    this.listenTo(world, "change:moves", (model, moves) => {
      if (this.get("length") && moves.size > this.get("length")) {
        return
      } else {
        this.set({ length: 0 })
      }
      this.getOpeningForMoves(moves).then((opening) => {
        let openingText = `${opening.eco} – ${opening.full_name}`
        this.set({ opening: openingText })
      })
    })
  }

  remoteGetOpeningForMoves(moves): Promise<OpeningResponse> {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: "/openings",
        type: "POST",
        data: { moves: moves.toArray() },
        dataType: "json",
        context: this,
        success: (data, status, xhr) => {
          if (data.opening) {
            resolve(data)
          } else {
            reject(data)
          }
        },
        error: (xhr, status, error) => {
          reject(moves)
        }
      })
    })
  }

  processRemoteResponse(moves, response): OpeningResponse {
    let opening = response.opening
    if (response.search_done) {
      this.set({ length: moves.size })
    }
    this.cache.setOpening(moves, opening)
    return opening
  }

  getOpeningForMoves(moves): Promise<OpeningResponse> {
    return new Promise((resolve, reject) => {
      let opening = this.cache.getOpening(moves)
      if (opening) {
        resolve(<OpeningResponse>opening.toObject())
      } else {
        return this.remoteGetOpeningForMoves(moves).then((response) => {
          resolve(this.processRemoteResponse(moves, response))
        })
      }
    })
  }
}

const openingState = new OpeningState

export default openingState
