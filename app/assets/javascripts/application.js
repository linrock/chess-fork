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
//= require_tree ./models
//= require_tree ./views


window.Models = {};
window.Views = {};

$(function() {

  var world = window.world = new Models.WorldState;
  var chess = window.chess = new Models.ChessMechanism;
  var chessboard = window.chessboard = new Views.MainBoard;
  var analysisCache = window.analysisCache = new Models.AnalysisCache;
  var openingState = window.openingState = new Models.OpeningState;
  chess.start();

  new Models.HotKeys;

  new Views.PgnImporter;
  new Views.MoveList;
  new Views.ModalMoveList;
  new Views.ActionButtons;
  new Views.AnalysisHandler;
  new Views.IntroMessage;
  new Views.EvaluationGraph;
  new Views.PositionInfo;
  // new Views.MiniHoverBoard;
  new Views.VirtualDomBoard;
  new Views.SubHeader;

});
