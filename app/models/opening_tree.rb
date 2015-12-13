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

    def is_leaf?
      @children.size == 0
    end

    def inspect
      if @opening
        %(<Node @eco="#{@opening.eco}" @name="#{@opening.name}" @n_children=#{@children.size}>)
      else
        %(<Node @n_children=#{@children.size}>)
      end
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

  def search_for_opening(move_list)
    current = @root
    last_opening = nil
    while (move = move_list.shift)
      break unless current.children[move]
      current = current.children[move]
      last_opening = current.opening if current.opening
    end
    {
      :opening      => last_opening,
      :search_done  => current.children.size == 0 || move_list.length > 0
    }
  end

  def get_opening(move_list)
    search_for_opening(move_list)[:opening]
  end

  def get_opening_from_pgn(pgn)
    get_opening pgn.gsub(/\d+\./, '').gsub(/\*/, '').strip.split(/\s+/)
  end

  def inspect
    %(<OpeningTree @size=#{@size}>)
  end

end
