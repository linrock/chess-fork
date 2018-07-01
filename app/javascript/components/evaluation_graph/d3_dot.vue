<template lang="pug">
  svg.d3-dot(ref="circle" :style="svgStyle")
    circle(r="4" style="fill: orange; opacity: 0.8" :cx="x" :cy="yValues(y)")
    circle(r="2" style="fill: white" :cx="x" :cy="yValues(y)")

</template>

<script>
  import { scaleLinear } from 'd3'

  export default {
    props: {
      width: Number,
      height: Number,
      x: {
        type: Number,
        required: true
      },
      y: {
        type: Number,
        required: true
      }
    },

    data: function() {
      return {
        yRange: [-5, 5]
      }
    },

    computed: {
      svgStyle() {
        return `width: ${this.width}px; height: ${this.height}px;`
      },
      yValues() {
        return scaleLinear().range([this.height, 0]).domain(this.yRange).clamp(true)
      }
    }
  }
</script>
