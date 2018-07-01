<template lang="pug">
  .actions
    button.action.flip-board(@click="chess.trigger('polarity:flip')")
      i.fa.fa-retweet
    .move-actions(:class="[{ invisible: $store.state.moves.length === 0 }]")
      button.action(@click="$store.dispatch(`firstMove`)")
        ||
        i.fa.fa-chevron-left
      button.action(@click="$store.dispatch(`prevMove`)")
        i.fa.fa-chevron-left
      button.action(@click="$store.dispatch(`nextMove`)")
        i.fa.fa-chevron-right
      button.action(@click="$store.dispatch(`lastMove`)")
        i.fa.fa-chevron-right
        ||

</template>

<script lang="ts">
  import { chess } from '../chess_mechanism'

  export default {
    data() {
      return { chess }
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
