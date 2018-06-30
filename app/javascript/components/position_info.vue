<template lang="pug">
  .position-info(:class="[{ invisible: store.positionIndex <= 0 }]")
    a.action.show-fen(href="javascript:" @click="toggleFen")
      .name {{ showingFen ? `Hide` : `Show` }} FEN
    .position-description
      .fen(v-if="showingFen") {{ currentFen }}
      div(v-if="!showingFen") {{ positionInfoText }}

</template>

<script lang="ts">
  import { FEN, SanMove } from '../types'
  import store from '../store'
  import { chess } from '../chess_mechanism'

  const firstVariationMove = (k: number): SanMove => {
    return store.currentAnalysis.variations[k].firstMove
  }

  export default {
    data() {
      return {
        showingFen: false,
        store
      }
    },

    computed: {
      currentFen(): FEN {
        if (store.mode === `normal`) {
          return chess.getPosition(store.positionIndex)
        } else if (store.mode === `analysis`) {
          const j = store.variationIndex + 1
          const k = store.variationPositionIndex
          return store.currentAnalysis.variations[k].positions[j]
        }
      },
      positionInfoText(): string {
        const i = store.positionIndex - 1
        if (store.mode === `normal`) {
          return `${chess.getMovePrefix(i)} ${chess.getMoves(i)}`
        } else if (store.mode === `analysis`) {
          const k = store.variationPositionIndex
          return `Variation after ${chess.getMovePrefix(i)} ${firstVariationMove(k)}`
        }
      }
    },

    methods: {
      toggleFen() {
        this.showingFen = !this.showingFen
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
