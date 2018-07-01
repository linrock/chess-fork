<template lang="pug">
  .move-list
    template(v-for="(sanMove, i) in moves")
      .move-num(v-if="i % 2 === 0") {{ ~~(i / 2) + 1 }}.
      .move(
        @click="chess.setPositionIndex(i + 1)"
        :class="[{ current: $store.state.positionIndex === i + 1 }]"
      ) {{ sanMove }}

</template>

<script lang="ts">
  import { SanMove } from '../types'
  import { chess } from '../chess_mechanism'

  export default {
    data() {
      return { chess }
    },

    computed: {
      moves(): Array<SanMove> {
        return this.$store.state.moves
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .move-list 
    border 1px solid #eee
    font-size 14px
    width 100%
    height 100%
    overflow hidden
    padding-top 10px
    position absolute

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
