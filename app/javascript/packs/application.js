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
import AnalysisEngine from '../analysis/engine'
import HotKeys from '../hotkeys'

document.addEventListener('DOMContentLoaded', () => {
  new AnalysisEngine
  chess.start()

  new HotKeys

  // interface views
  window.chessboard = new MainBoard
  new IntroMessage
  // new VirtualDomBoard
  new SubHeader

  // vue components
  const containerEl = document.querySelector(`.analysis-info`)
  new Vue({
    el: containerEl.appendChild(document.createElement('div')),
    render: h => h(AnalysisInfo)
  })

  const modalMoveListEl = document.querySelector(`.vue-modal-move-list`)
  new Vue({
    el: modalMoveListEl.appendChild(document.createElement('div')),
    render: h => h(ModalMoveList)
  })

  const positionInfoEl = document.querySelector(`.vue-position-info`)
  new Vue({
    el: positionInfoEl.appendChild(document.createElement('div')),
    render: h => h(PositionInfo)
  })

  const moveListEl = document.querySelector(`.vue-move-list`)
  new Vue({
    el: moveListEl.appendChild(document.createElement('div')),
    render: h => h(MoveList)
  })

  const pgnImporterEl = document.querySelector(`.vue-pgn-importer`)
  new Vue({
    el: pgnImporterEl.appendChild(document.createElement('div')),
    render: h => h(PgnImporter)
  })

  const actionButtonsEl = document.querySelector(`.vue-actions`)
  new Vue({
    el: actionButtonsEl.appendChild(document.createElement('div')),
    render: h => h(ActionButtons)
  })

  const evaluationGraphEl = document.querySelector(`.evaluation-graph`)
  new Vue({
    el: evaluationGraphEl.appendChild(document.createElement('div')),
    render: h => h(EvaluationGraph)
  })
})
