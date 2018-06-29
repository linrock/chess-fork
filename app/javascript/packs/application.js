import Vue from 'vue'

import MainBoard from '../views/main_board'
import PgnImporter from '../views/pgn_importer'
import MoveList from '../views/move_list'
import ActionButtons from '../views/action_buttons'
import IntroMessage from '../views/intro_message'
import EvaluationGraph from '../views/evaluation_graph'
import PositionInfo from '../views/position_info'
import VirtualDomBoard from '../views/virtual_dom_board'
import SubHeader from '../views/sub_header'

import AnalysisInfo from '../components/analysis_info'
import ModalMoveList from '../components/modal_move_list'

import { chess } from '../chess_mechanism'
import AnalysisEngine from '../analysis/engine'
import HotKeys from '../hotkeys'

document.addEventListener('DOMContentLoaded', () => {
  new AnalysisEngine
  chess.start()

  new HotKeys

  // interface views
  window.chessboard = new MainBoard
  new PgnImporter
  new MoveList
  new ActionButtons
  new IntroMessage
  new EvaluationGraph
  new PositionInfo
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
})
