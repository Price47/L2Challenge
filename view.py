from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

import csv
from datetime import datetime, date
from celery.schedules import crontab
from celery.task import periodic_task

from Scraper import ScraperObject as SO
from Helper import  HelperObject

helper = HelperObject()

@periodic_task(run_every=crontab(hour=1, minute=30))
def update_bestbuy_snapshot():
    helper.clearTodaysData()

    SO(keyword='smart tv').search()
    SO(keyword='curved smart tv').search()

def getLowestDate(request):

    return JsonResponse({'low_date':helper.lowestDate(), 'high_date':helper.highestDate()})

def bestbuydata(request):
    now = datetime.now()
    collected = "%d-%d-%d"%(now.month, now.day, now.year)
    return render(request, 'priceweb/bestbuy_tv_data.html', context={'date':collected})

def getTVData(request):
    today = date.today()

    helper.clearTodaysData()

    smart_tv = SO(keyword='smart tv')
    curved_smart_tv = SO(keyword='curved smart tv')

    smart_tv.search()
    curved_smart_tv.search()

    return_obj = helper.retrieveData(today)

    return JsonResponse(return_obj)


def savedTVData(request, search_date=None):
    if(search_date==None):
        search_date = date.today()
    else:
        datetime.strptime(search_date,"%Y-%m-%d").date()
    return_obj = helper.retrieveData(search_date)

    return JsonResponse(return_obj)


def getTvDataCSVbyDate(request, search_date=None):
    if search_date == None:
        search_date = date.today()

    d = datetime.now()
    unique_string = "%d%d%d%d%d%d" % (d.year, d.month, d.day, d.hour, d.minute, d.second)

    filename = "Data_" + unique_string + ".csv"

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=' + filename

    writer = csv.writer(response)

    helper.formatCSVData('smart tv', writer, search_date)
    helper.formatCSVData('curved smart tv', writer, search_date)

    response.set_cookie(key='JSANIMATORCHECK', value='csv_download_complete')

    return response