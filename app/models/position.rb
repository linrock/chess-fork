class Position < ActiveRecord::Base
  after_initialize :truncate_fen

  validates_presence_of :fen
  validate :validate_fen

  def truncate_fen
    self.fen = fen.split(" ")[0..3].join(" ")
  end

  def suffixed_fen(fen)
    fen.split(" ").length == 4 ? "#{fen} 0 1" : fen
  end

  def validate_fen
    result = $chess.validate_fen suffixed_fen(fen)
    errors.add :fen, " - #{result["error"]}" if result["valid"] != true
  end

end
