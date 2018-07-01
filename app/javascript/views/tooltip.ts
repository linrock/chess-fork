import Backbone from 'backbone'

export default class Tooltip extends Backbone.View<Backbone.Model> {
  private $tooltip: JQuery
  private tooltipText: string

  events(): Backbone.EventsHash {
    return {
      "mouseenter" : () => this.$tooltip.removeClass("invisible"),
      "mouseleave" : () => this.$tooltip.addClass("invisible")
    }
  }

  private template(text): string {
    return `
      <div class="tooltip invisible">
        <div class="content">${text}</div>
      </div>
    `
  }

  initialize() {
    this.tooltipText = this.$el.data("tooltip")
    this.render()
  }

  render() {
    this.$el.css({ position: "relative" })
    this.$el.append(this.template(this.tooltipText))
    this.$tooltip = this.$(".tooltip")
    this.$tooltip.css({
      "margin-left" : -Math.round(this.$tooltip.width() / 2)
    })
    return this
  }
}
