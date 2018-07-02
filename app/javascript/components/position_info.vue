<template lang="pug">
  .position-info(:class="[{ invisible: $store.state.positionIndex <= 0 }]")
    a.action.show-fen(href="javascript:" @click="toggleFen")
      .name {{ showingFen ? `Hide` : `Show` }} FEN
    .position-description
      .fen(v-if="showingFen") {{ $store.getters.currentFen }}
      div(v-if="!showingFen") {{ $store.getters.positionInfoText }}

</template>

<script lang="ts">
  export default {
    data() {
      return {
        showingFen: false,
      }
    },

    methods: {
      toggleFen() {
        this.showingFen = !this.showingFen
      },
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
