from datetime import date, datetime
from django.http import HttpResponse

from models import Television


class HelperObject():
    """
    Object used in the views.py to access models.
    """

    def __init__(self):
        self.today = date.today()

    def clearTodaysData(self):
        """
        Clear the days data. Only run when new data is downloaded, so there is only one
        set of data, the most current set, for each daily snapshot

        """
        Television.objects.filter(search_date=self.today).delete()

    def lowestDate(self):
        """
        :return: the earliest date in the Database
        """

        return Television.objects.all().values_list('search_date', flat=True).order_by('search_date')[0]

    def highestDate(self):
        """
        :return: the latest date in the Database (generally should be today)
        """

        return Television.objects.all().values_list('search_date', flat=True).order_by('-search_date')[0]


    def sumBrands(self, dataset, key):
        """
        Add the brands collected

        :param dataset: Beautiful soup data
        :param key: search term used to differentiate between different searches in
        the Beautiful soup data (i.e. brands from 'smart tv' or 'curved smart tv'

        :return: dict of sums for each brand
        """
        return {'Sony': len(dataset[key]['Sony']),
                'Toshiba': len(dataset[key]['Toshiba']),
                'Samsung': len(dataset[key]['Samsung']),
                'LG': len(dataset[key]['LG'])}


    def sumDBBrands(self, base_query):
        """
        Same function as sumBrands, but using DB data rather than Beautiful Soup data

        :param base_query: Django Query used to differentiate between different search term
        (Television.objects.filter(search_term='smart tv').filter(search_date=date))
        :return: dict of sums for each brand
        """

        return {'Sony': len(base_query.filter(name__icontains="sony")),
                'Toshiba': len(base_query.filter(name__icontains="toshiba")),
                'Samsung': len(base_query.filter(name__icontains="samsung")),
                'LG': len(base_query.filter(name__icontains="lg"))}


    def defineQuery(self, date):
        """
        Gathers data for a single date

        :param start: start date (yyyy-mm-dd)
        :param end: end date (yyyy-mm-dd)
        :return: formatted object for json response
                """
        smart_tv = Television.objects.filter(search_term='smart tv').filter(search_date=date)
        curved_smart_tv = Television.objects.filter(search_term='curved smart tv').filter(search_date=date)

        rank_trend = list(smart_tv.values_list('search_rank', 'rating'))
        curved_rank_trend = list(curved_smart_tv.values_list('search_rank', 'rating'))
        review_trend = list(smart_tv.values_list('search_rank', 'reviews'))
        curved_review_trend = list(curved_smart_tv.values_list('search_rank', 'reviews'))

        return_obj=self.formatReturnDict(smart_tv, curved_smart_tv,
                                         rank_trend, curved_rank_trend,
                                         review_trend, curved_review_trend)
        return return_obj

    def defineRangeQuery(self, start, end):
        """
        Gathers data for a range of dates

        :param start: start date (yyyy-mm-dd)
        :param end: end date (yyyy-mm-dd)
        :return: formatted object for json response
        """
        smart_tv = Television.objects.filter(search_term='smart tv')\
            .filter(search_date__lte=end).filter(search_date__gte=start)
        curved_smart_tv = Television.objects.filter(search_term='curved smart tv')\
            .filter(search_date__lte=end).filter(search_date__gte=start)



        rank_trend = self.meanSet(smart_tv.values_list('search_rank','rating'))
        curved_rank_trend = self.meanSet(curved_smart_tv.values_list('search_rank','rating'))
        review_trend = self.meanSet(smart_tv.values_list('search_rank','reviews'))
        curved_review_trend = self.meanSet(curved_smart_tv.values_list('search_rank','reviews'))

        return_obj = self.formatReturnDict(smart_tv, curved_smart_tv,
                                           rank_trend, curved_rank_trend,
                                           review_trend, curved_review_trend)
        return return_obj


    def meanSet(self, set):
        """
        This function helps organize the data for a date range. Since many TV's will have the same search
        rank, they can't all be graphed together. meanSet gets the mean value for every occurence of
        a search rank, so that over the course of 5 days, the mean rating for a given search rank is graphed.
        :param set:
        :return:
        """
        meanSet = {}
        return_set = []

        for i in set:
            if i[0] in meanSet:
                meanSet[i[0]].append(i[1])
            else:
                meanSet[i[0]] = [(i[1])]

        for i in meanSet:
            return_set.append([i,float(sum(meanSet[i])) / max(len(meanSet[i]), 1)])

        return return_set


    def formatReturnDict(self, smart_tv, curved_smart_tv, rank_trend, curved_rank_trend, review_trend, curved_review_trend):
        """
        Fetch and organize data into an object used by JS to create charts

        :param date: date of dataset being searched (in YYYY-MM-DD format)
        :return: An object with all the data used by charts.js
        """

        hits_json = self.sumDBBrands(smart_tv)
        curved_hits_json = self.sumDBBrands(curved_smart_tv)
        top_3_hits_json = self.sumDBBrands(smart_tv.filter(top_3=True))
        top_3_curved_hits_json = self.sumDBBrands(curved_smart_tv.filter(top_3=True))



        return_obj = {'normal_hits': hits_json,
                      'curved_hits': curved_hits_json,
                      'top_3_hits': top_3_hits_json,
                      'top_3_curved_hits': top_3_curved_hits_json,
                      'rate_trends': rank_trend,
                      'curved_rate_trends': curved_rank_trend,
                      'review_trends': review_trend,
                      'curved_review_trends': curved_review_trend}

        return return_obj


    def writeCSVData(self, writer, search_term, base_query, top_3, ranks, reviews, search_date):
        """
        Writes to (but does not create) CSV file to be returned to client

        :param writer: CSV writer
        :param search_term: Search term used for initial search ('smart tv', 'curved smart tv')
        :param base_query: Django query which returns all Television objects for a given date and search term
        :param top_3: Queryset containing top 3 brands for given search term
        :param ranks: Array of [search_rank, rating] denoting the trend between search rank and rating
        :param reviews: Array of [search_rank, reviews] denoting the trend between search rank and reviews
        :param search_date: Date this dataset is from
        :return: The writer passed to this function is updated to include data from a given search term
        """
        writer.writerow([search_term,search_date])
        writer.writerow(['Top 3 Search Results'])
        writer.writerow(['Search Rank', 'Name', 'Rating', 'Reviews'])
        for i in top_3:
            writer.writerow([str(i.search_rank), str(i.name), str(i.rating), str(i.reviews)])
        writer.writerow(['Search Results'])
        writer.writerow(['Search Rank', 'Name', 'Rating', 'Reviews'])
        for i in base_query:
            writer.writerow([str(i.search_rank), str(i.name), str(i.rating), str(i.reviews)])
        writer.writerow(['Ranking Search Trend'])
        writer.writerow(['Search Rank', 'Rating'])
        for i in ranks:
            writer.writerow([str(i[0]), str(i[1])])
        writer.writerow(['Review Search Trend'])
        writer.writerow(['Search Rank', 'Reviews'])
        for i in reviews:
            writer.writerow([str(i[0]), str(i[1])])


    def formatCSVData(self, search_term, writer, search_date=None, start_date=None, end_date=None):
        """
        Sets up the Django Queryset's used to write to the CSV. If start and end date are provided,
        the base query includes a range of dates. If not, it includes only one day.

        :param search_term: Search term to limit results to ('smart tv', 'curved smart tv')
        :param writer: CSV writer
        :param search_date: Search date to limit results to ('YYYY-MM-DD')
        :return: Writer passed to this function is updated
        """

        if start_date!=None and end_date!=None:
            base_query = Television.objects.filter(search_date__gte=start_date)\
                .filter(search_date__lte=end_date).filter(search_term=search_term)

            search_date = str(start_date + " to " + str(end_date))

        else:
            base_query = Television.objects.filter(search_date=search_date).filter(search_term=search_term)


        top_3 = base_query.filter(top_3=True)
        ranks = base_query.values_list("search_rank","rating")
        reviews = base_query.values_list("search_rank", "rating")

        self.writeCSVData(writer, search_term, base_query, top_3, ranks, reviews, search_date)
