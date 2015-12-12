# Used for fast opening lookups, given a move list
#
class OpeningTree


  # children -> maps move names to more nodes
  #
  class Node

    attr_accessor :opening, :children

    def initialize
      @children = {}
    end

    def set_opening(opening)
      @opening = opening
    end

    def inspect
      %(<Node @eco="#{@opening.eco}" @name="#{@opening.name}">)
    end

  end


  attr_accessor :root, :size

  def initialize
    @root = Node.new
    @size = 0
  end

  def build_tree(openings)
    openings.each do |opening|
      current = @root
      moves = opening.move_list
      while (move = moves.shift)
        if !current.children[move]
          current.children[move] = Node.new
        end
        current = current.children[move]
      end
      current.set_opening opening
      @size += 1
    end
  end

  def generate!
    openings = EcoParser.new(Rails.root.join("data/scid.eco")).scan_into_openings
    build_tree(openings)
  end

  def get_opening(move_list)
    current = @root
    while (move = move_list.shift)
      return current unless current.children[move]
      current = current.children[move]
    end
    current.opening
  end

  def get_opening_from_pgn(pgn)
    get_opening pgn.gsub(/\d+\./, '').gsub(/\*/, '').strip.split(/\s+/)
  end

  def inspect
    %(<OpeningTree @size=#{@size}>)
  end

end
