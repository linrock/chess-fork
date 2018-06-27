class AnalysisController < ActionController::Base
  layout 'application'

  def index
  end

  # params - pgn - input a pgn
  #
  def get_opening
    if params[:moves]
      render :json => $opening_tree.search_for_opening(params[:moves])
    else
      render :json => {}
    end
  end
end
