// Use an orange bar to denote the current position of the board

import Bar from './bar'
import { world } from '../../world_state'

export default class StaticBar extends Bar {

  listenToEvents() {
    this.listenTo(this.graph, "click", (event) => {
      this.$el.show()
    })
    this.listenTo(world, "change:i", (model, i) => {
      this.reposition(i)
    })
    this.listenTo(world, "change:moves", (model, moves) => {
      if (moves.size > 0) {
        this.$el.show()
      } else {
        this.$el.hide()
      }
    })
  }

  render() {
    this.$el.addClass("static").appendTo(this.graph.$el)
  }
}
