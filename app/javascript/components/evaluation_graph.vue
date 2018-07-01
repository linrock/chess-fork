<template lang="pug">
  .evaluation-graph(v-if="positions.length > 1")
    .hover-graph(
      @mouseenter="shouldShowPositionIndicator = true"
      @mousemove="setPositionIndicatorIndex"
      @mouseleave="shouldShowPositionIndicator = false"
      @click="handleClick"
    )
      .graph
        d3-line-graph(
          :points="graphPoints" :color="lineColor" :width="width" :height="height" :strokeWidth="1"
        )
        d3-area-graph(
          :points="graphPoints" :color="lineColor" :width="width" :height="height"
        )
      transition(name="fade")
        d3-vertical-line(
          v-if="shouldShowPositionIndicator"
          :width="width"
          :height="height"
          :x="positionIndicatorX"
          color="rgba(0,0,0,0.15)"
        )
      transition(name="fade")
        hover-indicator(
          :width="width"
          :height="height"
          :i="positionIndex"
          :points="graphPoints"
        )
</template>

<script lang="ts">
  import D3LineGraph from './evaluation_graph/d3_line_graph'
  import D3AreaGraph from './evaluation_graph/d3_area_graph'
  import D3VerticalLine from './evaluation_graph/d3_vertical_line'
  import HoverIndicator from './evaluation_graph/hover_indicator'
  import { getNormalizedScores } from '../analysis/graph_points'
  import { chess } from '../chess_mechanism'

  export default {
    data() {
      return {
        shouldShowPositionIndicator: false,
        positionIndicatorIndex: this.positionIndex,
        width: 460,
        height: 120,
        lineColor: 'rgba(58,137,201,0.6)',
      }
    },

    methods: {
      positionIndexFromOffsetX(offsetX) {
        return ~~(this.positions.length * offsetX / this.width)
      },
      setPositionIndicatorIndex(e) {
        this.positionIndicatorIndex = this.positionIndexFromOffsetX(e.offsetX)
      },
      handleClick(e) {
        const positionIndex = this.positionIndexFromOffsetX(e.offsetX)
        // this.$store.dispatch('setPositionIndex', positionIndex)
        chess.setPositionIndex(positionIndex)
      },
    },

    computed: {
      positionIndex() {
        return this.$store.state.positionIndex
      },
      positions() {
        return this.$store.state.positions
      },
      graphPoints() {
        this.$store.state.currentAnalysis
        return getNormalizedScores(this.positions)
      },
      positionIndicatorX() {
        return this.positionIndicatorIndex / (this.positions.length - 1) * this.width
      }
    },

    components: {
      D3LineGraph,
      D3AreaGraph,
      D3VerticalLine,
      HoverIndicator,
    }
  }
</script>

<style lang="stylus" scoped>
  svg
    position absolute
    top 0
    left 0

    &.d3-vertical-line
      stroke rgba(0,0,0,0.3)

  .hover-graph
    position relative

    &:hover
      cursor pointer

  .hover-indicator
    position absolute
    left 0
    top 0

  // animations
  .fade-enter-active, .fade-leave-active
    transition opacity .2s

  .fade-enter, .fade-leave-to
    opacity 0

</style>
