from django.urls import path  
from . import views  
  
urlpatterns = [  
    path('api/spaces', views.get_spaces, name='get_spaces'),  
]  