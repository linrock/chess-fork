class AnalysisController < ApplicationController
  before_action :set_analysis_options, only: [:create]

  def index
  end

  # Endpoint for requesting analysis for a position
  def create
    render json: StockfishAnalysis.new(params[:fen], @options).to_h.to_json
  end

  private

  def set_analysis_options
    @options = {}
    if (multipv = params[:multipv].to_i)
      @options[:multipv] = multipv if multipv == 3
    end
    if (depth = params[:depth].to_i)
      @options[:depth] = depth if (depth == 10 || depth == 16)
    end
  end
end
