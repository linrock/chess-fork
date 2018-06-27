# Represents an opening as parsed from scid.eco
#
class Opening

  attr_accessor :eco, :name, :pgn

  def initialize(options)
    self.eco   = options[:eco]
    self.name  = options[:name]
    self.pgn   = options[:pgn]
  end

  def base_eco
    self.eco[/\A([A-E]\d{2})/, 1]
  end

  def base_name
    self.name.split(":").first
  end

  def variation
    return @variation if defined?(@variation)
    match = self.name[/:(.*)/, 1]
    return unless match
    @variation = match.strip
  end

  def variation_name
    return unless variation
    return @variation_name if defined?(@variation_name)
    @variation_name =
      variation.split(",").map(&:strip).select {|str| str[0] !~ /\d/ }.join(", ")
  end

  def variation_line
    return unless variation
    return @variation_line if defined?(@variation_line)
    @variation_line =
      variation.split(",").map(&:strip).select {|str| str[0] =~ /\d/ }.join(", ")
  end

  def move_list
    pgn.gsub(/\d+\./, '').gsub(/\*/, '').strip.split(/\s+/)
  end

  def as_json(options = {})
    {
      :eco       => base_eco,
      :name      => base_name,
      :variation => variation,
      :full_name => self.name
    }
  end
end
