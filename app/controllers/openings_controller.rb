class OpeningsController < ApplicationController

  # params - pgn - input a pgn
  #
  def query
    if params[:moves]
      render :json => $opening_tree.search_for_opening(params[:moves])
    end
  end

end
