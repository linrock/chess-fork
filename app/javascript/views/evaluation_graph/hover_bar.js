// Use a bar to denote the current mouseover position

import Bar from './bar'

export default class HoverBar extends Bar {

  listenToEvents() {
    this.listenTo(this.graph, "mouseenter", () => { this.$el.fadeIn(75)  })
    this.listenTo(this.graph, "mouseleave", () => { this.$el.fadeOut(75) })
    this.listenTo(this.graph, "hover:i", (i) => {
      this.reposition(i)
    })
  }

  render() {
    this.$el.addClass("hover").appendTo(this.graph.$el)
  }
}
