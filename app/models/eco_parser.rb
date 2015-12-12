# Parses the scid.eco opening classifier
#
class EcoParser

  ROW_SCANNER = /\A(?<eco>[A-E]\d{2}[a-z]?)\s+"(?<name>.*)"\s+(?<pgn>.*)\z/


  attr_accessor :openings

  def initialize(eco_file)
    @text = open(eco_file, 'r').read.strip
    @text = @text.gsub(/\n  /, ' ')
    @openings = []
  end

  def scan_into_openings
    @text.split(/\n/).each do |row|
      match = row.match(ROW_SCANNER)
      next unless match
      @openings << Opening.new(match)
    end
    @openings
  end

end
