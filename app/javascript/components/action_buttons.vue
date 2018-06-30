<template>
  <div class="actions">
    <button class="action flip-board" @click="chess.trigger('polarity:flip')">
      <i class="fa fa-retweet"></i>
    </button>

    <div class="move-actions" :class="[{ invisible: store.moves.length === 0 }]">
      <button class="action" @click="chess.firstMove()">
        |<i class="fa fa-chevron-left"></i>
      </button>
      <button class="action" @click="chess.prevMove()">
        <i class="fa fa-chevron-left"></i>
      </button>
      <button class="action next-move" @click="chess.nextMove()">
        <i class="fa fa-chevron-right"></i>
      </button>
      <button class="action last-move" @click="chess.lastMove()">
        <i class="fa fa-chevron-right"></i>|
      </button>
    </div>
  </div>
</template>

<script>
  import { SanMove } from '../types'
  import { chess } from '../chess_mechanism'
  import store from '../store'

  export default {
    data() {
      return { chess, store }
    }
  }
</script>

<style lang="stylus" scoped>
  .actions 
    margin-top 9px
    margin-left 20px
    width 204px
    float left
    overflow hidden

    .action 
      color #cbcbcb
      font-size 14px
      float left
      height 32px
      padding 7px 13px
      background #eee
      text-align center

      &:hover 
        background #e5e5e5

    .flip-board 
      width 41px
      font-size 15px
      margin-right 9px
      padding 7px 0
      border-radius 2px

    .move-actions 
      float left
      border-radius 2px
      overflow hidden
      transition opacity 0.2s ease

      &.invisible 
        opacity 0
        pointer-events none

</style>
