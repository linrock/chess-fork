import $ from 'jquery'
import Rickshaw from 'rickshaw'

// The actual area graph that gets rendered
//
export default class AreaGraph {

  constructor($el) {
    this.$el = $el
    this.maxWidth = parseInt(this.$el.css("width"))
    this.color = "rgba(70, 130, 180, 1)"
  }

  prepareSeries(points) {
    let series = []
    for (let i in points) {
      series.push({ x: ~~i, y: points[~~i] })
    }
    return [{ color: this.color, stroke: this.color, data: series }]
  }

  width(points) {
    return this.maxWidth

    // TODO minimum number of points before hitting max width?
    if (points.length >= 20) {
      return this.maxWidth
    } else {
      return points.length * 10
    }
  }

  render(points) {
    let series = this.prepareSeries(points)
    let graph = new Rickshaw.Graph({
      element: $("<div>").appendTo(this.$el)[0],
      width: this.width(points),
      height: 120,
      series: series,
      min: -10,
      max: 10,
      renderer: "area",
      stroke: true,
      strokeWidth: 1,
      interpolation: "linear"
    })
    graph.render()
    this.n = series.length
  }
}
