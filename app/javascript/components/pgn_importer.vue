<template lang="pug">
  .pgn-importer(v-if="$store.state.moves.length === 0")
    textarea(
      ref="pgnInput"
      :placeholder="placeholderText"
      @keyup="validatePgn"
    )
    button.load-pgn(
      :class="[{ invisible: !showPgnInputButton }]"
      @click="loadPgn"
    ) Load PGN
    .invalid-pgn(:class="[{ invisible: !showError }]") Not a valid PGN

</template>

<script lang="ts">
  import Chess from 'chess.js'
  import { PGN } from '../types'
  import { chess } from '../chess_mechanism'

  const placeholderText = `Enter or paste a PGN here to import your game

1. e4 e5 2. ...`

  const formatPgn = (pgn: string): PGN => {
    return pgn.trim().replace("0-0-0", "O-O-O").replace("0-0", "O-O").
      replace("‒", "-").
      replace("–", "-").
      replace("½-½", "1/2-1/2").
      replace("0.5-0.5", "1/2-1/2")
  }

  export default {
    data() {
      return {
        showError: false,
        showPgnInputButton: false,
        pgnIsValid: false,
        placeholderText,
      }
    },

    created() {
      this.cjs = new Chess
    },

    methods: {
      pgnInput() {
        return formatPgn(this.$refs.pgnInput.value)
      },
      validatePgn() {
        this.showError = false
        if (this.cjs.load_pgn(this.pgnInput())) {
          this.showPgnInputButton = true
          this.pgnIsValid = true
        } else {
          this.pgnIsValid = false
        }
      },

      loadPgn() {
        if (this.pgnIsValid) {
          chess.loadPgn(this.pgnInput())
        } else {
          this.showError = true
        }
      }
    }
  }
</script>

<style lang="stylus" scoped>
  .pgn-importer 
    border 1px solid #eee
    position absolute
    top 0
    left 0
    z-index 2
    width 100%
    height 100%

    textarea 
      width 100%
      height 100%
      font-family "Open Sans", sans-serif
      border 0
      resize none
      padding 12px 16px
      font-size 13px
      line-height 22px

    // TODO better positioning of load pgn button
    //
    .load-pgn 
      font-size 13px
      position absolute
      bottom -42px
      right 0
      width 152px
      height 32px
      background #4A90E2
      border-radius 2px
      color white
      transition opacity 0.2s ease

      &.invisible 
        opacity 0
        pointer-events none

      &:hover 
        opacity 0.85

    .invalid-pgn 
      position absolute
      color #FF6900
      bottom -92px
      right 0
      font-size 13px
      transition opacity 0.15s ease

      &.invisible 
        opacity 0
        pointer-events none
  
</style>
