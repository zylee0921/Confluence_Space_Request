from django.urls import path  
from . import views  
  
urlpatterns = [  
    path('api/spaces', views.get_spaces, name='get_spaces'),  
    path('api/current', views.get_current_user, name='get_current_user'),
]  