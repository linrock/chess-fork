<template lang="pug">
  .position-info(:class="[{ invisible: $store.state.positionIndex <= 0 }]")
    a.action.show-fen(href="javascript:" @click="toggleFen")
      .name {{ showingFen ? `Hide` : `Show` }} FEN
    .position-description
      .fen(v-if="showingFen") {{ currentFen }}
      div(v-if="!showingFen") {{ positionInfoText }}

</template>

<script lang="ts">
  import { FEN, SanMove } from '../types'
  import { chess } from '../chess_mechanism'

  export default {
    data() {
      return {
        showingFen: false,
      }
    },

    computed: {
      currentFen(): FEN {
        if (this.$store.state.mode === `normal`) {
          return chess.getPosition(this.$store.state.positionIndex)
        } else if (this.$store.state.mode === `analysis`) {
          const j = this.$store.state.variationIndex + 1
          const k = this.$store.state.variationPositionIndex
          return this.$store.state.currentAnalysis.variations[k].positions[j]
        }
      },
      positionInfoText(): string {
        const i = this.$store.state.positionIndex - 1
        if (this.$store.state.mode === `normal`) {
          return `${chess.getMovePrefix(i)} ${chess.getMoves(i)}`
        } else if (this.$store.state.mode === `analysis`) {
          const k = this.$store.state.variationPositionIndex
          return `Variation after ${chess.getMovePrefix(i)} ${this.firstVariationMove(k)}`
        }
      }
    },

    methods: {
      toggleFen() {
        this.showingFen = !this.showingFen
      },
      firstVariationMove(k: number): SanMove {
        return this.$store.state.currentAnalysis.variations[k].firstMove
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .position-info 
    position relative
    transition opacity 0.2s ease
    display flex
    float left

    &.invisible 
      opacity 0
      pointer-events none

      &:hover 
        background #efefef

    .position-description 
      font-weight bold
      margin-left 20px
      line-height 26px
      font-size 14px

      .fen 
        font-size 10px
        color #E84A00

    .action 
      color #2F2F2F
      background #F5F5F5
      border-radius 2px
      display block
      padding 8px 10px 7px
      font-size 12px
      text-decoration none

      &:hover 
        cursor pointer
        background #F4F4F4

</style>
