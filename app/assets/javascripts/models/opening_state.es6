{

  class OpeningState extends Backbone.Model {

    initialize() {
      this.listenForEvents()
    }

    listenForEvents() {
      this.listenTo(world, "change:moves", (model, moves) => {
        if (this.get("length") && moves.size > this.get("length")) {
          return
        } else {
          this.set({ length: 999 })
        }
        this.getOpeningForMoves(moves).then((response) => {
          let opening = response.opening
          if (!opening.full_name) {
            return
          }
          this.set({ opening: opening.full_name })
          if (response.search_done) {
            this.set({ length: moves.size })
          }
        })
      })
    }

    getOpeningForMoves(moves) {
      return new Promise((resolve, reject) => {
        $.ajax({
          url: "/openings",
          type: "POST",
          data: { moves: moves.toArray() },
          dataType: "json",
          context: this,
          success: (data, status, xhr) => {
            resolve(data)
          },
          error: (xhr, status, error) => {
            reject(moves)
          }
        })
      })
    }

  }


  Models.OpeningState = OpeningState

}
