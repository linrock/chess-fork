// The analysis info view under the board

import * as $ from 'jquery'
import * as _ from 'underscore'
import * as Backbone from 'backbone'

import { HTML, FEN } from '../types'
import { AnalysisOptions, defaultAnalysisOptions } from '../analysis/options'
import { world } from '../main'
import { chess } from '../chess_mechanism'

interface PositionEvaluation {
  color: string
  evaluation: string
}

export default class AnalysisCommands extends Backbone.View<Backbone.Model> {
  private $movesCmd: JQuery
  private $depthCmd: JQuery
  private analysisOptions: AnalysisOptions = Object.assign({}, defaultAnalysisOptions)

  get el() {
    return `.suggested-moves`
  }

  events(): Backbone.EventsHash {
    return {
      "click .move" : "_enterAnalysisMode",
      "click .more-moves": "_multiPv",
      "click .more-depth": "_higherDepth"
    }
  }

  initialize() {
    this.$movesCmd = this.$(".more-moves")
    this.$depthCmd = this.$(".more-depth")
    this.listenForEvents()
  }

  listenForEvents() {
    this.listenTo(world, "change:i", (model, i) => {
      if (i <= 0) {
        this.$el.addClass("invisible")
      } else {
        this.$el.removeClass("invisible")
      }
    })
  }

  private _enterAnalysisMode(event) {
    const { fen, k } = event.currentTarget.dataset
    chess.analyzePosition(fen, k)
  }

  private _multiPv() {
    if (this.analysisOptions.multipv === 1) {
      this.analysisOptions.multipv = 3
      this.$movesCmd.text("- show less moves")
    } else {
      this.analysisOptions.multipv = 1
      this.$movesCmd.text("+ show more moves")
    }
    chess.trigger("analysis:options:change", this.analysisOptions)
  }

  private _higherDepth() {
    if (this.analysisOptions.depth === 12) {
      this.analysisOptions.depth = 16
      this.$depthCmd.text("- lower depth")
    } else {
      this.analysisOptions.depth = 12
      this.$depthCmd.text("+ higher depth")
    }
    chess.trigger("analysis:options:change", this.analysisOptions)
  }
}
