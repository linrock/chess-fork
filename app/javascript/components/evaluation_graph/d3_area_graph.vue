<template lang="pug">
  svg.d3-area-graph(:style="svgStyle")
    path(ref="path" :style="pathStyle")

</template>

<script>
  import { scaleTime, scaleLinear, area, select, extent } from 'd3'

  export default {
    props: {
      points: Array,
      color: String,
      width: Number,
      height: Number
    },

    data() {
      return {
        yRange: [-5, 5]
      }
    },

    methods: {
      plotPoints() {
        const areaGraph = area()
          .x(d => this.xValues(d.x))
          .y0(this.height/2)
          .y1(d => this.yValues(d.y))
        select(this.$refs.path)
          .data([this.dataPoints])
          .attr(`d`, areaGraph)
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
        return `fill: ${this.color}; stroke-width: 0;`
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
