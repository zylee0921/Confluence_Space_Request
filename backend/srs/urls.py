from django.urls import path  
from . import views  
  
urlpatterns = [  
    path('api/spaces', views.get_spaces, name='get_spaces'),  
    path('api/current', views.get_current_user, name='get_current_user'),
    path('api/groups', views.get_current_user_groups, name='get_current_user_groups'),
    path('api/send_request_email', views.send_request_email, name='send_request_email'),
]  