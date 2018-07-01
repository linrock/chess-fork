import Vue from 'vue'

import MainBoard from '../views/main_board'
import IntroMessage from '../views/intro_message'
// import VirtualDomBoard from '../views/virtual_dom_board'
import SubHeader from '../views/sub_header'

import ActionButtons from '../components/action_buttons'
import AnalysisInfo from '../components/analysis_info'
import ModalMoveList from '../components/modal_move_list'
import PositionInfo from '../components/position_info'
import MoveList from '../components/move_list'
import PgnImporter from '../components/pgn_importer'
import EvaluationGraph from '../components/evaluation_graph'

import { chess } from '../chess_mechanism'
import store from '../store'
import AnalysisEngine from '../analysis/engine'
import HotKeys from '../hotkeys'

document.addEventListener('DOMContentLoaded', () => {
  new AnalysisEngine
  chess.start()

  new HotKeys

  // backbone views
  const chessboardView = new MainBoard;
  (<any>window).chessboard = chessboardView

  new IntroMessage
  // new VirtualDomBoard
  new SubHeader

  // vue components
  const initVueComponent = (selector: string, component) => {
    const el: HTMLElement = document.querySelector(selector)
    new Vue({ el, store, render: h => h(component) })
  }

  initVueComponent(`.analysis-info`, AnalysisInfo)
  initVueComponent(`.vue-modal-move-list`, ModalMoveList)
  initVueComponent(`.vue-position-info`, PositionInfo)
  initVueComponent(`.vue-move-list`, MoveList)
  initVueComponent(`.vue-pgn-importer`, PgnImporter)
  initVueComponent(`.vue-actions`, ActionButtons)
  initVueComponent(`.evaluation-graph`, EvaluationGraph)
})
