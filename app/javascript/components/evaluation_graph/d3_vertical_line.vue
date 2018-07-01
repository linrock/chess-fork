<template lang="pug">
  svg.d3-vertical-line(:style="svgStyle")
    line(:x1="x" :y1="-height" :x2="x" :y2="height")

</template>

<script lang="ts">
  export default {
    props: {
      width: {
        type: Number,
        required: true
      },
      height: {
        type: Number,
        required: true
      },
      x: {
        type: Number,
        required: true
      },
      color: {
        type: String,
      }
    },

    computed: {
      svgStyle() {
        const color = this.color || `rgba(0,0,0,0.4)`
        return `width: ${this.width}px; height: ${this.height}px; stroke: ${color}`
      }
    }
  }
</script>

<style lang="stylus" scoped>
  svg.d3-vertical-line
    fill none
    stroke-width 0.5px

</style>
