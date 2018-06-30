<template>
  <div class="position-info" :class="[{ invisible: store.positionIndex <= 0 }]">
    <a class="action show-fen" href="javascript:" @click="toggleFen">
      <div class="name">{{ showingFen ? `Hide` : `Show` }} FEN</div>
    </a>

    <div class="position-description">
      <div class="fen" v-if="showingFen">{{ currentFen }}</div>
      <div v-if="!showingFen">{{ positionInfoText }}</div>
    </div>
  </div>
</template>

<script>
  import store from '../store'
  import { chess } from '../chess_mechanism'

  const firstVariationMove = (k) => {
    return chess.get("analysis").variations[k].moves[0]
  }

  export default {
    data() {
      return {
        showingFen: false,
        store
      }
    },

    computed: {
      currentFen() {
        if (store.mode === `normal`) {
          return chess.getPosition(store.positionIndex)
        } else if (store.mode === `analysis`) {
          return store.currentAnalysis.variations[store.variationPositionIndex].positions[store.variationIndex + 1]
        }
      },
      positionInfoText() {
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
