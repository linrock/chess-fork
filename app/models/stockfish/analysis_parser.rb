module Stockfish

  # Converts raw analysis output into a hash
  class AnalysisParser

    attr_accessor :raw_analysis, :analysis

    def initialize(raw_analysis = nil)
      @raw_analysis = raw_analysis
      @analysis = {}
    end

    def parse
      best_move_uci = @raw_analysis[/bestmove (\w+) /, 1]
      best_sequence = nil
      best_score = nil
      depth = nil

      if @raw_analysis[/info depth 0 score mate 0/]
        @analysis = {
          :best_move => nil,
          :score => "mate 0"
        }
        return @analysis
      end

      rows = @raw_analysis.split("\n")
      patterns = [
        /info depth (\d+) seldepth (\d+) score (\w+) ([-\d]+) nodes/,
        /info depth (\d+) seldepth (\d+) score (\w+) ([-\d]+) lowerbound nodes/,
        /info depth (\d+) seldepth (\d+) score (\w+) ([-\d]+) upperbound nodes/
      ]
      patterns.each do |regex|
        rows.select {|row| row[regex] }.reverse.each do |row|
          next unless row[/ pv (.*)/]
          seq = $1
          next unless !seq or seq.split(" ")[0] == best_move_uci
          best_sequence = seq
          row[regex]
          case $3
          when "cp" then best_score = $4.to_f/100
          when "mate" then best_score = "mate #{$4}"
          end
          depth = $1.to_i
          break
        end
        if best_score && best_sequence && depth
          @analysis = {
            :best_move => best_move_uci,
            :sequence => best_sequence,
            :score => best_score,
            :depth => depth,
          }
          return @analysis
        end
      end
      return {}
    end

  end

end
