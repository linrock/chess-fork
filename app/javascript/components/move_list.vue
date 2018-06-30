<template>
  <div class="move-list">
    <template v-for="(sanMove, i) in store.moves">
      <div class="move-num" v-if="i % 2 === 0">{{ ~~(i / 2) + 1 }}. </div>
      <div class="move" @click="gotoMove(i + 1)"
           :class="[{ current: store.positionIndex === i + 1 }]">{{ sanMove }}</div>
    </template>
  </div>
</template>

<script>
  import { SanMove } from '../types'
  import { chess } from '../chess_mechanism'
  import store from '../store'

  export default {
    data() {
      return { store }
    },

    methods: {
      gotoMove(i) {
        chess.setPositionIndex(i)
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .move-list 
    font-size 14px
    width 100%
    height 100%
    overflow hidden

    .move-num 
      float left
      width 45px
      padding 7px 0 7px 15px

    .move 
      float left
      width 70px
      padding 7px 0 7px 12px
      transition background 0.12s ease

      &:hover 
        cursor pointer

      &.current 
        background yellow

</style>
