<template>
  <div class="analysis-info">
    <!--
    {{ store.positionIndex }}
    {{ store.variationIndex }}
    {{ store.variationPositionIndex }}
    {{ store.currentAnalysis }}
    -->
    <div class="moves" v-if="analysisData">
      <div class="move-row"v-for="variation in analysisData">
        <div class="move engine-move"
             :data-fen="store.currentAnalysis.fen"
             :data-k="variation.variationIndex">
          {{ variation.move }}
        </div>
        <div class="evaluation">{{ variation.evaluation }}</div>
        <div class="source">
          {{ variation.depth }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'underscore'
  import store from '../store'
  import { chess } from '../chess_mechanism'
  import { world } from '../main'
  import { defaultAnalysisOptions } from '../analysis/options'
  import analysisCache from '../analysis/cache'

  const getFormattedEvaluation = (evaluation, polarity) => {
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
    data() {
      return { store }
    },

    computed: {
      currentFen() {
        return chess.getPosition(this.store.positionIndex)
      },

      analysisData() {
        const analysis = this.store.currentAnalysis
        if (!analysis) {
          return
        }
        const variations = analysis.variations
        if (!variations[0].moves[0]) {
          return
        }
        if (this.currentFen !== analysis.fen) {
          return
        }
        const data = []
        for (let k = 0; k < variations.length; k++) {
          const variation = variations[k]
          const polarity = (/ w /.test(analysis.fen) ? 1 : -1) * chess.get("polarity")
          const { color, evaluation } = getFormattedEvaluation(variation.score, polarity)
          data.push({
            move: `${chess.getMovePrefix(world.get("i"))} ${variation.moves[0]}`,
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
