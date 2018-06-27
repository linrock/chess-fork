import $ from 'jquery'
import Backbone from 'backbone'

// Abstract Bar class
//
export default class Bar extends Backbone.View {

  initialize(graph) {
    this.$el = $("<div>").addClass("bar")
    this.graph = graph
    this.listenToEvents()
    this.render()
  }

  render() {
    this.remove()
  }

  reposition(i) {
    let n = this.graph.points.length
    let sc = i / (n - 1)
    if (sc < 0) {
      return
    }
    if (sc > 1) {
      sc = 1
    }
    this.$el.css({
      left: Math.round(sc * this.graph.width)
    })
  }
}
