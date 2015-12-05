module Stockfish

  # Converts raw analysis output into a hash
  #
  class AnalysisParser

    ROW_SCANNER = %r{
      \Ainfo\s
      depth\s
      (?<depth>\d+)\s
      seldepth\s
      (?<seldepth>\d+)\s
      (multipv\s(?<multipv>\d+)\s)?
      score\s
      (?<score_type>\w+)?\s
      (?<score>[-\d]+)\s
      (lowerbound\s|upperbound\s)?
      nodes
    }x


    attr_accessor :raw_analysis, :analysis

    def initialize(raw_analysis = nil)
      @raw_analysis = raw_analysis
      @analysis = {}
    end

    def parse
      if @raw_analysis[/info depth 0 score mate 0/]
        @analysis = {
          :bestmove => nil,
          :score => "mate 0"
        }
        return @analysis
      end
      best_move_uci = @raw_analysis[/bestmove (\w+) /, 1]
      @raw_analysis.strip.split("\n").each do |row|
        sequence = row.match(/ pv (?<moves>.*)/)
        next if sequence.nil? || sequence[:moves].split(" ")[0] != best_move_uci
        best_sequence = sequence[:moves]
        analysis = row.match(ROW_SCANNER)
        best_score = case analysis[:score_type]
                     when "cp" then analysis[:score].to_f/100
                     when "mate" then "mate #{analysis[:score]}"
                     end
        depth = analysis[:depth].to_i
        if best_score && best_sequence && depth
          @analysis = {
            :bestmove => best_move_uci,
            :sequence => best_sequence,
            :score => best_score,
            :depth => depth,
          }
          return @analysis
        end
      end
      @analysis || {}
    end

  end

end
