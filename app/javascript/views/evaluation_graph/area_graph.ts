import $ from 'jquery'
import Rickshaw from 'rickshaw'

interface GraphPoint {
  x: number,
  y: number
}

// The actual area graph that gets rendered
//
export default class AreaGraph {
  private $el: JQuery
  private maxWidth: number
  private color = "rgba(70, 130, 180, 1)"

  constructor($el) {
    this.$el = $el
    this.maxWidth = parseInt(this.$el.css("width"))
  }

  prepareSeries(points: Array<number>) {
    return [{
      color: this.color,
      stroke: this.color,
      data: this.graphPoints(points)
    }]
  }

  graphPoints(points: Array<number>): Array<GraphPoint> {
    return points.map((point, i) => <GraphPoint>{ x: ~~i, y: point })
  }

  cssWidth(points): number {
    return this.maxWidth
    // TODO minimum number of points before hitting max width?
    if (points.length >= 20) {
      return this.maxWidth
    } else {
      return points.length * 10
    }
  }

  render(points) {
    new Rickshaw.Graph({
      element: $("<div>").appendTo(this.$el)[0],
      width: this.cssWidth(points),
      height: 120,
      series: this.prepareSeries(points),
      min: -10,
      max: 10,
      renderer: "area",
      stroke: true,
      strokeWidth: 1,
      interpolation: "linear"
    }).render()
  }
}
