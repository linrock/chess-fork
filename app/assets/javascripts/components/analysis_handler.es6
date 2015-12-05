// Handles fetching analysis from remote server + rendering it
//
Components.AnalysisHandler = function() {

  var $suggested = $(".suggested-moves");

  var analysisCache = {};

  var getCachedAnalysis = function(fen) {
    return new Promise(function(resolve, reject) {
      var analysis = analysisCache[fen];
      analysis && resolve(analysis) || reject(fen);
    });
  };

  var getRemoteAnalysis = function(fen) {
    return new Promise(function(resolve, reject) {
      $.post("/analysis", { fen: fen }, function(response) {
        var c = new Chess;
        c.load(fen);
        var bestmove = response.bestmove;
        var move = c.move({ from: bestmove.slice(0,2), to: bestmove.slice(2,5) });
        var analysis = {
          engine: "Stockfish 6",
          san: move.san,
          evaluation: response.score,
          depth: response.depth
        };
        analysisCache[fen] = analysis;
        resolve(analysis);
      });
    });
  };

  var renderAnalysis = function(analysis) {
    var sourceStr = analysis.engine + " - depth " + analysis.depth;
    $suggested.removeClass("invisible");
    $suggested.find(".move").text(chess.getMovePrefix() + " " + analysis.san);
    $suggested.find(".evaluation").text(analysis.evaluation);
    $suggested.find(".source").text(sourceStr);
  };

  _.clone(Backbone.Events).listenTo(chess, "change:fen", function(model, fen) {
    getCachedAnalysis(fen).catch(getRemoteAnalysis).then(renderAnalysis);
  });

};
