Rails.application.routes.draw do
  root 'analysis#index'

  post 'openings' => 'analysis#get_opening'
end
