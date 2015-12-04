class AnalysisController < ApplicationController

  def index
  end

  # Endpoint for requesting analysis for a position
  #
  def create
    render :json => StockfishAnalysis.new(params[:fen]).to_h.to_json
  end

end
