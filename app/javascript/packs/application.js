/* eslint no-console:0 */

import AnalysisCache from '../models/analysis_cache'
import AnalysisSequencer from '../models/analysis_sequencer'
import OpeningState from '../models/opening_state'
import HotKeys from '../models/hot_keys'

import MainBoard from '../views/main_board'
import PgnImporter from '../views/pgn_importer'
import MoveList from '../views/move_list'
import ModalMoveList from '../views/modal_move_list'
import ActionButtons from '../views/action_buttons'
import AnalysisHandler from '../views/analysis_handler'
import IntroMessage from '../views/intro_message'
import EvaluationGraph from '../views/evaluation_graph'
import PositionInfo from '../views/position_info'
import VirtualDomBoard from '../views/virtual_dom_board'
import SubHeader from '../views/sub_header'

import { chess } from '../chess_mechanism'

document.addEventListener('DOMContentLoaded', () => {
  window.analysisCache = new AnalysisCache
  window.openingState = new OpeningState

  new AnalysisSequencer
  chess.start()

  window.chessboard = new MainBoard

  new HotKeys

  new PgnImporter
  new MoveList
  new ModalMoveList
  new ActionButtons
  new AnalysisHandler
  new IntroMessage
  new EvaluationGraph
  new PositionInfo
  new VirtualDomBoard
  new SubHeader
})
