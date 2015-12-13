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

  def variation_name
    return @variation_name if defined?(@variation_name)
    match = self.name[/:(.*)/, 1]
    return unless match
    @variation_name =
      match.split(",").map(&:strip).select {|str| str[0] !~ /\d/ }.join(", ")
  end

  def variation_line
    match = self.name[/:(.*)/, 1]
    return unless match
    match.split(",").map(&:strip).select {|str| str[0] =~ /\d/ }.join(", ")
  end

  def full_name
    if variation_name && variation_name.length > 0
      "#{base_eco} #{base_name}: #{variation_name}"
    else
      "#{base_eco} #{base_name}"
    end
  end

  def move_list
    pgn.gsub(/\d+\./, '').gsub(/\*/, '').strip.split(/\s+/)
  end

  def as_json(options = {})
    {
      :eco       => base_eco,
      :name      => base_name,
      :variation => variation_name,
      :full_name => full_name
    }
  end

end
