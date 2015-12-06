class StockfishAnalysis

  def initialize(fen)
    @fen = fen
  end

  def to_h
    engine = Stockfish::Engine.new
    analysis_output = engine.analyze @fen, { :depth => 10 }
    Stockfish::AnalysisParser.new(analysis_output).parse.merge({
      :engine => engine.version[/(Stockfish \d+)/, 1]
    })
  end

end
