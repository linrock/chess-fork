// The real-time evaluation graph in the bottom right

{

  // The actual area graph that gets rendered
  //
  class AreaGraph {

    constructor($el) {
      this.$el = $el
      this.color = "rgba(70, 130, 180, 1)"
    }

    prepareSeries(points) {
      let series = []
      for (let i in points) {
        series.push({ x: ~~i, y: points[~~i] })
      }
      return [{ color: this.color, stroke: this.color, data: series }]
    }

    width(points) {
      if (points.length >= 20) {
        return 200
      } else {
        return points.length * 10
      }
    }

    render(points) {
      let graph = new Rickshaw.Graph({
        element: $("<div>").appendTo(this.$el)[0],
        width: this.width(points),
        height: 100,
        series: this.prepareSeries(points),
        min: -10,
        max: 10,
        renderer: "area",
        stroke: true,
        strokeWidth: 1,
        interpolation: "linear"
      })
      graph.render()
    }

  }


  // For taking raw analysis data and updating the polarity
  // of the points to graph correctly
  //
  class PointsNormalizer {

    getGameOverScore(fen) {
      let c = new Chess(fen)
      if (c.in_stalemate()) {
        return 0
      } else if (c.in_checkmate()) {
        if (c.turn() === "w") {
          return -10
        } else {
          return 10
        }
      }
      return 0
    }

    getNormalizedScore(fen) {
      let polarity = /\sw\s/.test(fen) ? 1 : -1
      let analysis = analysisCache.get(fen)
      if (!analysis) {
        return 0
      }
      if (analysis.score) {
        let score = analysis.score
        if (score < -10) {
          score = -10
        } else if (score > 10) {
          score = 10
        }
        if (_.isString(score) && score.match(/^mate/)) {
          let m = +score.split(" ")[1]
          if (m === 0) {
            score = this.getGameOverScore(fen)
          } else {
            score = 10
            score *= (m > 0 ? 1 : -1)
            score *= polarity
          }
        } else {
          score *= polarity
        }
        return score
      } else {
        return this.getGameOverScore(fen)
      }
    }

    getNormalizedScores(fenArray) {
      let scores = []
      for (let fen of fenArray) {
        scores.push(this.getNormalizedScore(fen))
      }
      return scores
    }

  }


  class EvaluationGraph extends Backbone.View {

    get el() {
      return ".evaluation-graph"
    }

    get events() {
      return {
        "mousedown"   : "_click",
        "mouseenter"  : "_mouseEnter",
        "mouseleave"  : "_mouseLeave",
        "mousemove"   : "_mouseMove"
      }
    }

    initialize(options = {}) {
      this.graph = new AreaGraph(this.$el)
      this.normalizer = new PointsNormalizer
      this.listenToEvents()
    }

    listenToEvents() {
      this.listenTo(chess, "change:positions", (model, positions) => {
        let fenArray = positions.slice(1, positions.length - 1)
        this.points = this.normalizer.getNormalizedScores(fenArray)
        this.render(this.points)
      })
    }

    render(points) {
      this.$el.empty()
      this.graph.render(points)
    }

    getIFromMousePosition(event) {
      let mouseOffset = $(event.target).offset().left
      let offX = event.offsetX || event.clientX - mouseOffset
      if (offX < 0) {
        return
      }
      return ~~( offX / 960 * this.points.length )
    }

    _click(event) {
      let i = this.getIFromMousePosition(event)
      if (!i) {
        return
      }
      this.trigger("change:i" , i)
    }

    _mouseEnter(event) {
      this.trigger("mouseenter", event)
    }

    _mouseLeave(event) {
      this.trigger("mouseleave", event)
    }

    _mouseMove(event) {
      this.trigger("mousemove", event)
    }

  }


  Components.EvaluationGraph = EvaluationGraph

}
