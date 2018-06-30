import Backbone from 'backbone'

import { HTML } from '../types'

export default class Tooltip extends Backbone.View<Backbone.Model> {
  private $tooltip: JQuery
  private text: string

  events(): Backbone.EventsHash {
    return {
      "mouseenter" : () => this.$tooltip.removeClass("invisible"),
      "mouseleave" : () => this.$tooltip.addClass("invisible")
    }
  }

  private template(text): HTML {
    return `
      <div class="tooltip invisible">
        <div class="content">${text}</div>
      </div>
    `
  }

  initialize() {
    this.text = this.$el.data("tooltip")
    this.render()
  }

  render() {
    this.$el.css({ position: "relative" })
    this.$el.append(this.template(this.text))
    this.$tooltip = this.$(".tooltip")
    this.$tooltip.css({
      "margin-left" : -Math.round(this.$tooltip.width() / 2)
    })
    return this
  }
}
