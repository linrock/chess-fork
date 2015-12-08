// The real-time evaluation graph in the bottom right

{

  // The actual area graph that gets rendered
  //
  class AreaGraph {

    constructor($el) {
      this.$el = $el
      this.maxWidth = parseInt(this.$el.css("width"))
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
      return this.maxWidth

      // TODO minimum number of points before hitting max width?
      if (points.length >= 20) {
        return this.maxWidth
      } else {
        return points.length * 10
      }
    }

    render(points) {
      let series = this.prepareSeries(points)
      let graph = new Rickshaw.Graph({
        element: $("<div>").appendTo(this.$el)[0],
        width: this.width(points),
        height: 100,
        series: series,
        min: -10,
        max: 10,
        renderer: "area",
        stroke: true,
        strokeWidth: 1,
        interpolation: "linear"
      })
      graph.render()
      this.n = series.length
    }

  }


  // Abstract Bar class
  //
  class Bar extends Backbone.View {

    initialize(graph) {
      this.$el = $("<div>").addClass("bar")
      this.graph = graph
      this.listenToEvents()
      this.render()
    }

    listenToEvents() {}

    render() {
      this.remove()
    }

    reposition(i) {
      let n = this.graph.points.length
      let sc = i / (n - 1)
      if (sc < 0 || sc > 1) {
        return
      }
      this.$el.css({
        left: Math.round(sc * this.graph.width)
      })
    }

  }


  // Use a bar to denote the current mouseover position
  //
  class HoverBar extends Bar {

    listenToEvents() {
      this.listenTo(this.graph, "mouseenter", () => { this.$el.fadeIn(75)  })
      this.listenTo(this.graph, "mouseleave", () => { this.$el.fadeOut(75) })
      this.listenTo(this.graph, "hover:i", (i) => {
        this.reposition(i)
      })
    }

    render() {
      this.$el.addClass("hover").appendTo(this.graph.$el)
    }

  }


  // Use a bar to denote the current position of the board
  //
  class StaticBar extends Bar {

    listenToEvents() {
      this.listenTo(this.graph, "click", (event) => {
        this.$el.show()
      })
      this.listenTo(chess, "change:i", (model, i) => {
        this.reposition(i)
      })
    }

    render() {
      this.$el.addClass("static").appendTo(this.graph.$el)
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
        "mousemove"   : "_mouseMove",
        "mouseenter"  : "_mouseEnter",
        "mouseleave"  : "_mouseLeave"
      }
    }

    initialize(options = {}) {
      this.$areaGraph = this.$(".area-graph")
      this.width = parseInt(this.$el.css("width"))
      this.graph = new AreaGraph(this.$areaGraph)
      this.normalizer = new PointsNormalizer
      this.listenToEvents()
    }

    listenToEvents() {
      this.listenTo(chess, "change:positions", (model, positions) => {
        this.plotPositionEvaluations(positions.slice(0, positions.length - 1))
        this.show()
      })
      this.listenTo(chess, "change:analysis", (analysis) => {
        this.plotPositionEvaluations(chess.get("positions"))
      })
    }

    render(points) {
      this.$areaGraph.empty()
      this.graph.render(points)
      this.addHoverBar()
      this.addStaticBar()
    }

    show() {
      this.$el.removeClass("invisible")
    }

    addHoverBar() {
      if (!this.hoverBar) {
        this.hoverBar = new HoverBar(this)
      }
    }

    addStaticBar() {
      if (!this.staticBar) {
        this.staticBar = new StaticBar(this)
      }
    }

    getIFromMousePosition(event) {
      if (!this.points) {
        return
      }
      let mouseOffset = $(event.target).offset().left
      let offX = event.offsetX || event.clientX - mouseOffset
      if (offX < 0) {
        return
      }
      return ~~( offX / this.width * this.points.length )
    }

    plotPositionEvaluations(positions) {
      this.points = this.normalizer.getNormalizedScores(positions)
      this.render(this.points)
    }

    _click(event) {
      let i = this.getIFromMousePosition(event)
      if (!_.isNumber(i)) {
        return
      }
      this.trigger("click", event)
      chess.setPositionIndex(i)
    }

    _mouseMove(event) {
      let i = this.getIFromMousePosition(event)
      if (!_.isNumber(i)) {
        return
      }
      if (i != this.hoverI) {
        this.hoverI = i
        this.trigger("hover:i", i)
        chess.trigger("preview:i", i)
      }
    }

    _mouseEnter(event) {
      this.trigger("mouseenter", event)
      chess.trigger("preview:show")
    }

    _mouseLeave(event) {
      this.trigger("mouseleave", event)
      chess.trigger("preview:hide")
    }

  }


  Components.EvaluationGraph = EvaluationGraph

}
