//= require jquery
//= require jquery_ujs
//= require jquery-ui/draggable
//= require jquery-ui/droppable
//= require underscore
//= require backbone
//= require chess
//= require mousetrap
//= require mithril
//= require immutable
//= require d3
//= require rickshaw
//= require_tree ../../../vendor/assets/javascripts/polyfills
//= require_self
//= require_tree ./components


window.Components = {};

$(function() {

  var chess = window.chess = new Components.ChessMechanism;
  var chessboard = window.chessboard = new Components.MainBoard;
  var analysisCache = window.analysisCache = new Components.AnalysisCache;
  var chronicle = window.chronicle = new Components.Chronicle;
  chess.start();

  new Components.PgnImporter;
  new Components.MoveList;
  new Components.ModalMoveList;
  new Components.ActionButtons;
  new Components.HotKeys;
  new Components.AnalysisHandler;
  new Components.IntroMessage;
  new Components.EvaluationGraph;
  new Components.PositionInfo;
  // new Components.MiniHoverBoard;
  new Components.VirtualDomBoard;

});
