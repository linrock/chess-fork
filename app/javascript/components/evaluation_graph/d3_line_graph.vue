<template lang="pug">
  svg.d3-line-graph(:style="svgStyle")
    path(ref="path" :style="pathStyle")

</template>

<script>
  import { scaleTime, scaleLinear, line, select, extent } from 'd3'

  export default {
    props: {
      points: Array,
      color: String,
      strokeWidth: Number,
      width: Number,
      height: Number
    },

    data() {
      return {
        yRange: [-5, 5]
      }
    },

    mounted() {
      this.plotPoints()
    },

    methods: {
      plotPoints() {
        const linePoints = line()
          .x(d => this.xValues(d.x))
          .y(d => this.yValues(d.y))
        select(this.$refs.path)
          .data([this.dataPoints])
          .attr(`d`, linePoints)
      }
    },

    watch: {
      points() {
        this.plotPoints()
      }
    },

    computed: {
      xValues() {
        return scaleTime().range([0, this.width]).domain(extent(this.dataPoints, d => d.x))
      },
      yValues() {
        return scaleLinear().range([this.height, 0]).domain(this.yRange)
      },
      svgStyle() {
        return `width: ${this.width}px; height: ${this.height}px;`
      },
      pathStyle() {
        return `fill: none; stroke: ${this.color}; stroke-width: ${this.strokeWidth}`
      },
      normalizedPoints() {
        const [yMin, yMax] = this.yRange
        return this.points.map(y => y > yMax ? yMax : y < yMin ? yMin : y)
      },
      dataPoints() {
        return this.normalizedPoints.map((y,x) => ({ x, y }))
      }
    },
  }
</script>
