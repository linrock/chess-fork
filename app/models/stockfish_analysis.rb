class StockfishAnalysis

  def initialize(fen)
    @fen = fen
  end

  def to_h
    engine = Stockfish::Engine.new
    analysis_output = engine.analyze @fen, { :depth => 10 }
    Stockfish::AnalysisParser.new(analysis_output).parse
  end

end
