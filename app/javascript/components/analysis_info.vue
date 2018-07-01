<template lang="pug">
  .suggested-moves(:class="[{ invisible: $store.state.positionIndex === 0 }]")
    .engine-actions
      a.more-moves(href="javascript:" @click="showMoreMoves")
        | {{ movesButtonText }}
      a.more-depth(href="javascript:" @click="higherDepth")
        | {{ depthButtonText }}
    .titles
      .response Response
      .eval Score
      .depth Depth
    .moves(v-if="analysisData")
      .move-row(v-for="variation in analysisData")
        .move.engine-move(
          :data-fen="$store.state.currentAnalysis.fen"
          :data-k="variation.variationIndex"
          @click="enterAnalysisMode"
        )
          | {{ variation.move }}
        .evaluation(:class="variation.color") {{ variation.evaluation }}
        .depth {{ variation.depth }}

</template>

<script lang="ts">
  import _ from 'underscore'
  import { FEN } from '../types'
  import { chess } from '../chess_mechanism'
  import { getMovePrefix } from '../utils'
  import { defaultAnalysisOptions } from '../analysis/options'
  import analysisCache from '../analysis/cache'

  type Evaluation = string|number

  interface AnalysisData {
    move: string
    engine: string
    depth: number
    evaluation: number
    color: string
    variationIndex: number
  }

  const getFormattedEvaluation = (evaluation: Evaluation, polarity: number) => {
    let color = ''
    if (_.isNumber(evaluation)) {
      evaluation *= polarity
      evaluation = evaluation > 0 ? `+${evaluation}` : evaluation
      if (evaluation > 0.5) {
        color = 'green'
      } else if (evaluation < -0.5) {
        color = 'red'
      }
    } else if (evaluation.indexOf("mate") === 0) {
      const regex = /mate (-?\d+)/
      const score = Number(regex.exec(evaluation)[1]) * polarity
      if (score < 0) {
        color = 'red'
      } else {
        color = 'green'
      }
      evaluation = `Mate in ${Math.abs(score)}`
    }
    return { color, evaluation }
  }

  export default {
    methods: {
      showMoreMoves() {
        const multipv = this.$store.state.multipv === 1 ? 3 : 1
        this.$store.dispatch(`setAnalysisOptions`, Object.assign(
          {}, this.$store.getters.analysisOptions, { multipv }
        ))
      },
      higherDepth() {
        const depth = this.$store.state.depth === 12 ? 16 : 12
        this.$store.dispatch(`setAnalysisOptions`, Object.assign(
          {}, this.$store.getters.analysisOptions, { depth }
        ))
      },
      enterAnalysisMode(event) {
        const { fen, k } = event.currentTarget.dataset
        chess.analyzePosition(fen, k)
      }
    },

    computed: {
      movesButtonText(): string {
        return this.$store.state.multipv === 1 ? '+ show more moves' : '- show less moves'
      },

      depthButtonText(): string {
        return this.$store.state.depth === 12 ? '+ higher depth' : '- lower depth'
      },

      analysisData(): Array<AnalysisData> {
        const analysis = this.$store.state.currentAnalysis
        if (!analysis) {
          return
        }
        const variations = analysis.variations
        if (!variations[0].firstMove) {
          return
        }
        if (this.$store.getters.currentFen !== analysis.fen) {
          return
        }
        const data = []
        for (let k = 0; k < variations.length; k++) {
          const variation = variations[k]
          const polarity = (/ w /.test(analysis.fen) ? 1 : -1) * this.$store.state.boardPolarity
          const { color, evaluation } = getFormattedEvaluation(variation.score, polarity)
          data.push({
            move: `${getMovePrefix(this.$store.state.positionIndex)} ${variation.firstMove}`,
            engine: analysis.engine,
            depth: variation.depth,
            evaluation,
            color,
            variationIndex: k,
          })
        }
        return data
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .suggested-moves
    transition opacity 0.2s ease
    float right
    margin-top 20px

    &.invisible
      opacity 0

    .engine-actions
      font-size 11px
      margin-bottom 25px
      display flex

      a
        opacity 0.5
        color inherit
        text-decoration none

      .more-depth
        margin-left auto

    .titles
      font-size 11px
      font-weight bold
      padding-bottom 5px
      border-bottom 1px solid #ddd
      margin-bottom 15px
      color rgba(50,50,50,0.8)
      text-transform uppercase
      display flex

      .response
        width 80px

      .eval
        width 80px

      .depth
        width 45px
        text-align right

    // List of candidate moves under the board
    .moves
      font-size 14px
      font-weight 600
      transition opacity 0.2s ease

      &.faded
        opacity 0.5
        transition opacity 0.05s ease

      &.invisible
        opacity 0
        pointer-events none
        transition opacity 0.05s ease

    .move-row
      margin-bottom 12px
      display flex

      .engine-move
        transition color 0.15s ease
        width 80px

        &:hover
          cursor pointer
          color #0bf

      .evaluation
        width 80px
        color rgba(100,100,100,0.9)

        &.green
          color green

        &.red
          color red

      .depth
        float left
        width 45px
        text-align right

</style>
