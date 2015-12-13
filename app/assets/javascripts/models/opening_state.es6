// For querying for openings that correspond to the move sequence
// in the current move list

{

  class OpeningCache {

    constructor() {
      this.openings = new Immutable.Map()
    }

    getOpening(moves) {
      return this.openings.get(moves)
    }

    setOpening(moves, opening) {
      this.openings = this.openings.set(moves, new Immutable.Map(opening))
    }

  }


  class OpeningState extends Backbone.Model {

    initialize() {
      this.cache = new OpeningCache()
      this.listenForEvents()
    }

    listenForEvents() {
      this.listenTo(world, "change:moves", (model, moves) => {
        if (this.get("length") && moves.size > this.get("length")) {
          return
        } else {
          this.set({ length: false })
        }
        this.getOpeningForMoves(moves).then((opening) => {
          this.set({ opening: opening.full_name })
        }).catch((error) => {})
      })
    }

    remoteGetOpeningForMoves(moves) {
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

    processRemoteResponse(moves, response) {
      let opening = response.opening
      if (response.search_done) {
        this.set({ length: moves.size })
      }
      this.cache.setOpening(moves, opening)
      return opening
    }

    getOpeningForMoves(moves) {
      return new Promise((resolve, reject) => {
        let opening = this.cache.getOpening(moves)
        if (opening) {
          resolve(opening.toObject())
        } else {
          return this.remoteGetOpeningForMoves(moves).then((response) => {
            resolve(this.processRemoteResponse(moves, response))
          })
        }
      })
    }

  }


  Models.OpeningState = OpeningState

}
