class AnalysisController < ApplicationController

  def index
  end

  # Endpoint for requesting analysis for a position
  #
  def create
    options = { :multipv => params[:multipv] }
    render :json => StockfishAnalysis.new(params[:fen], options).to_h.to_json
  end

end
