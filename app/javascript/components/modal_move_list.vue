<template lang="pug">
  .modal-move-list(:class="[{ invisible: $store.state.mode === `normal` }]")
    .modal-bg(@click="closeModal")
    .modal(v-if="currentAnalysis")
      header.modal-header
        .engine-name {{ currentAnalysis.engine }}
        .close-modal(@click="closeModal") x
      .move-list
        template(v-if="startPlyNum % 2 === 1")
          .move-num {{ startMoveNum }}
          .move ...
        template(v-for="(move, i) in analysisMoves")
          .move-num(v-if="(startPlyNum + i) % 2 === 0") {{ startMoveNum + i }}.
          .move(
            :data-ply="startPlyNum + i"
            :class="[{ current: $store.state.variationPositionIndex === i }]"
            @click="gotoMove(i)"
          ) {{ move }}

</template>

<script lang="ts">
  import { SanMove } from '../types'
  import Analysis from '../analysis/models/analysis'

  export default {
    methods: {
      closeModal() {
        this.$store.dispatch(`setMode`, `normal`)
      },
      gotoMove(variationPositionIndex: number) {
        this.$store.dispatch(`setVariationPositionIndex`, variationPositionIndex)
      }
    },

    computed: {
      currentAnalysis(): Analysis {
        return this.$store.state.currentAnalysis
      },
      analysisMoves(): Array<SanMove> {
        if (!this.currentAnalysis) {
          return []
        }
        return this.currentAnalysis.variations[this.$store.state.variationIndex].moves
      },
      startPlyNum(): number {
        return this.$store.state.positionIndex
      },
      startMoveNum(): number {
        return Math.round( this.startPlyNum / 2)
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .modal-move-list 
    position absolute
    width 100%
    height 100%
    z-index 1
    transition opacity 0.25s ease-in-out

    &.invisible 
      opacity 0
      pointer-events none

      .modal 
        transform translate3d(0,-7px,0)

    .modal-bg 
      width 100%
      height 100%
      background rgba(0,0,0,0.6)

      &:hover 
        cursor pointer

    .modal 
      position absolute
      top 20px
      left 15px
      z-index 1
      width 174px
      height auto
      box-shadow 0 0 5px rgba(0,0,0,0.7)
      transition transform 0.25s ease-in-out

    .modal-header 
      width 174px
      height 34px
      background white
      border-bottom 1px solid #eee
      overflow hidden

      .engine-name 
        color rgba(28,28,28,0.55)
        float left
        font-size 11px
        line-height 34px
        margin-left 15px

      .close-modal 
        color rgba(28,28,28,0.55)
        float right
        font-size 14px
        margin-top 8px
        margin-right 10px

        &:hover 
          cursor pointer

    .move-list 
      height auto
      font-size 14px
      width 100%
      height 100%
      padding 10px 0
      background white
      overflow hidden

      .move-num
        float left
        width 45px
        padding 7px 0 7px 15px

      .move 
        float left
        width 60px
        padding 7px 0 7px 12px
        transition background 0.12s ease

        &:hover
          cursor pointer

        &.current 
          background #CFF

</style>
