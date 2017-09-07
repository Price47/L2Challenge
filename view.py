

def getTVData(request):

    smart_tv = SO(keyword='smart tv')
    curved_smart_tv = SO(keyword='curved smart tv')

    rate_trends = []

    data = smart_tv.search()
    curved_data = curved_smart_tv.search()

    for d in data:
        rate_trends.append(d[''])



    hits_json = {'Sony':len(data['brands']['Sony']),
                  'Toshiba':len(data['brands']['Toshiba']),
                  'Samsung':len(data['brands']['Samsung']),
                  'LG':len(data['brands']['LG'])}

    curved_hits_json = {'Sony':len(curved_data['brands']['Sony']),
                  'Toshiba':len(curved_data['brands']['Toshiba']),
                  'Samsung':len(curved_data['brands']['Samsung']),
                  'LG':len(curved_data['brands']['LG'])}

    return_obj = {'normal_hits': hits_json,
                  'curved_hits': curved_hits_json,
                  'rate_trends': }

    return JsonResponse(return_obj)