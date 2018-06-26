import _ from 'underscore'
import Backbone from 'backbone'

export default class Tooltip extends Backbone.View {

  get template() {
    return _.template(`
      <div class="tooltip invisible">
        <div class="content"><%= text %></div>
      </div>
    `)
  }

  get events() {
    return {
      "mouseenter" : "show",
      "mouseleave" : "hide"
    }
  }

  initialize() {
    let text = this.$el.data("tooltip")
    this.render(text)
  }

  render(text) {
    this.$el.css({ position: "relative" })
    this.$el.append(this.template({ text: text }))
    this.$tooltip = this.$(".tooltip")
    this.$tooltip.css({
      "margin-left" : -Math.round(this.$tooltip.width() / 2)
    })
  }

  show() {
    this.$tooltip.removeClass("invisible")
  }

  hide() {
    this.$tooltip.addClass("invisible")
  }
}
