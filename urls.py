from django.conf.urls import url

from . import views




urlpatterns = [
    url(r'^$', views.home, name='index'),
    url(r'^about$', views.about, name='about'),
    url(r'^dori', views.dori, name='dori'),
    url(r'^home', views.home, name='home'),
    url(r'^loadingscreens/(?P<index>[0-9]{1})', views.loadingscreens, name='loadingscreens'),
    url(r'^bestbuydata', views.bestbuydata, name='bestbuydata'),
    url(r'^getbestbuycsv$', views.getTvDataCSVbyDate, name='csvdata'),
    url(r'^getbestbuycsv/(?P<search_date>[0-9]{4}-[0-9]{2}-[0-9]{2})$', views.getTvDataCSVbyDate, name='csvdata'),
    url(r'^getbestbuycsv/(?P<start_date>[0-9]{4}-[0-9]{2}-[0-9]{2})/(?P<end_date>[0-9]{4}-[0-9]{2}-[0-9]{2})',
        views.getTvDataCSVbyDateRange, name='csvdata'),
    url(r'^savedTVData/(?P<search_date>[0-9]{4}-[0-9]{2}-[0-9]{2})', views.savedTVData, name='savedData'),
    url(r'^savedTVDataRange/(?P<start_date>[0-9]{4}-[0-9]{2}-[0-9]{2})/(?P<end_date>[0-9]{4}-[0-9]{2}-[0-9]{2})',
        views.savedTVDataRange, name='getdata'),
    url(r'^brewer',views.brewer, name='brewer'),
    url(r'^lowestDate', views.getLowestDate, name='lowestDate'),
    url(r'^get_bestbuy_data',views.getTVData, name='getdata'),


]