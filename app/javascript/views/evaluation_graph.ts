// The real-time evaluation graph in the bottom right
declare var require: any

import _ from 'underscore'
import $ from 'jquery'
import Immutable from 'immutable'
import Backbone from 'backbone'

require('jquery-hoverintent')

import HoverBar from './evaluation_graph/hover_bar'
import StaticBar from './evaluation_graph/static_bar'
import AreaGraph from './evaluation_graph/area_graph'
import { getNormalizedScores } from './evaluation_graph/points_normalizer'
import { world } from '../main'
import { chess } from '../chess_mechanism'


export default class EvaluationGraph extends Backbone.View<Backbone.Model> {
  private $areaGraph: JQuery
  private width: number
  private graph: AreaGraph
  private hoverBar: HoverBar
  private staticBar: StaticBar
  private points: Array<number>
  private hoverI: number

  get el() {
    return ".evaluation-graph"
  }

  events(): Backbone.EventsHash {
    return {
      "mousedown"   : "_click",
      "mousemove"   : "_mouseMove",
    }
  }

  initialize() {
    this.$areaGraph = this.$(".area-graph")
    this.width = parseInt(this.$el.css("width"))
    this.graph = new AreaGraph(this.$areaGraph)
    this.bindHoverEvents()
    this.listenToEvents()
  }

  listenToEvents() {
    this.listenTo(world, "change:positions", (model, positions) => {
      this.plotPositionEvaluations(positions.slice(0, chess.nPositions() - 1))
      this.show()
    })
    this.listenTo(chess, "change:analysis", (analysis) => {
      this.plotPositionEvaluations(chess.getPositions())
    })
    this.listenTo(chess, "polarity:flip", () => {
      this.plotPositionEvaluations(chess.getPositions())
    })
  }

  bindHoverEvents() {
    (<any>this.$el).hoverIntent(e => this._mouseEnter(e), e => this._mouseLeave(e))
  }

  renderPoints(points) {
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

  getIFromMousePosition(event): number {
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

  plotPositionEvaluations(positions: Immutable.List<string>) {
    this.points = getNormalizedScores(positions.toArray())
    this.renderPoints(this.points)
  }

  _click(event) {
    const i = this.getIFromMousePosition(event)
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
