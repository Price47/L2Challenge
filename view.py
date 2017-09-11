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
    """
    grab latest data at 1 in the morning
    :return:
    """
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

    return_obj = helper.defineQuery(today)

    return JsonResponse(return_obj)


def savedTVData(request, search_date=None):
    print ('not range in this one')
    if(search_date==None):
        search = date.today()
    else:
        search = datetime.strptime(search_date,"%Y-%m-%d").date()
    return_obj = helper.defineQuery(search)

    return JsonResponse(return_obj)

def savedTVDataRange(request, start_date=None, end_date=None):
    print ('svaed data range')
    if(start_date==None):
        start = date.today()
    if(end_date==None):
        end = date.today()
    else:
        start = datetime.strptime(start_date,"%Y-%m-%d").date()
        end = datetime.strptime(end_date,"%Y-%m-%d").date()

    return_obj = helper.defineRangeQuery(start,end)

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

    helper.formatCSVData('smart tv', writer, search_date=search_date)
    helper.formatCSVData('curved smart tv', writer, search_date=search_date)

    response.set_cookie(key='JSANIMATORCHECK', value='csv_download_complete')

    return response

def getTvDataCSVbyDateRange(request, start_date=None, end_date=None):


    d = datetime.now()
    unique_string = "%d%d%d%d%d%d" % (d.year, d.month, d.day, d.hour, d.minute, d.second)

    filename = "Data_" + unique_string + ".csv"

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=' + filename

    writer = csv.writer(response)

    helper.formatCSVData('smart tv', writer, start_date=start_date, end_date=end_date)
    helper.formatCSVData('curved smart tv', writer, start_date=start_date, end_date=end_date)

    response.set_cookie(key='JSANIMATORCHECK', value='csv_download_complete')

    return response