<template lang="pug">
  .hover-indicator
    d3-vertical-line(:width="width" :height="height" :x="x")
    d3-dot(:width="width" :height="height" :x="x" :y="points[i]")

</template>

<script lang="ts">
  import D3VerticalLine from './d3_vertical_line'
  import D3Dot from './d3_dot'

  export default {
    props: {
      width: Number,
      height: Number,
      points: Array,
      i: Number
    },

    computed: {
      x(): number {
        return this.i / (this.n - 1) * this.width
      },
      n(): number {
        return this.points.length
      }
    },

    components: {
      D3VerticalLine,
      D3Dot
    }
  }
</script>

<style lang="stylus" scoped>
  svg
    position absolute
    top 0
    left 0

</style>
