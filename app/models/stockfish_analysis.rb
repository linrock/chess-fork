class StockfishAnalysis

  def initialize(fen, options = {})
    @options = options || {}
    @fen = fen
  end

  def to_h
    engine = Stockfish::Engine.new
    if @options[:multipv].to_i == 3
      engine.multipv(3)
    end
    analysis_output = engine.analyze @fen, { :depth => 10 }
    Stockfish::AnalysisParser.new(analysis_output).parse.merge({
      :engine => engine.version[/(Stockfish \d+)/, 1]
    })
  end

end
