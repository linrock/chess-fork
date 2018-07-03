import Vue from 'vue'

import MainBoard from '../views/main_board'
import IntroMessage from '../views/intro_message'
import SubHeader from '../views/sub_header'

import ActionButtons from '../components/action_buttons'
import AnalysisInfo from '../components/analysis_info'
import ModalMoveList from '../components/modal_move_list'
import PositionInfo from '../components/position_info'
import MoveList from '../components/move_list'
import PgnImporter from '../components/pgn_importer'
import EvaluationGraph from '../components/evaluation_graph'

import HotKeys from '../hotkeys'
// import OpeningState from '../opening_state'
import store from '../store'

const initVueComponent = (selector: string, component) => {
  const el: HTMLElement = document.querySelector(selector)
  new Vue({ el, store, render: h => h(component) })
}

document.addEventListener('DOMContentLoaded', () => {
  new HotKeys
  // new OpeningState

  // backbone views
  new MainBoard
  new IntroMessage
  new SubHeader

  // vue components
  initVueComponent(`.analysis-info`, AnalysisInfo)
  initVueComponent(`.vue-modal-move-list`, ModalMoveList)
  initVueComponent(`.vue-position-info`, PositionInfo)
  initVueComponent(`.vue-move-list`, MoveList)
  initVueComponent(`.vue-pgn-importer`, PgnImporter)
  initVueComponent(`.vue-actions`, ActionButtons)
  initVueComponent(`.evaluation-graph`, EvaluationGraph)
})
