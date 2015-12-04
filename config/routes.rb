Rails.application.routes.draw do

  root 'analysis#index'

  post 'analysis' => 'analysis#create'

end
