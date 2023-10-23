from django.urls import path
from . import views
from django.conf.urls import url

urlpatterns = [
    url(r'^register-user/$', views.register_user, name='register-user'),
    url(r'^login-user/$', views.login_user, name='login-user'),
    url(r'^logout/$', views.disconnect_user, name='logout'),
    url(r'^verify-user/$', views.verify_user, name='verify-user'),
    url(r'^explore/$', views.explore, name='explore'),
    url(r'^dashboard/$', views.dashboard, name='dashboard'),
]
