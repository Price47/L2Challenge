import urllib2
from bs4 import BeautifulSoup
import mechanize
import re


keywords = ["smart tv", "curved smart tv"]

class ScraperObject():
    """

    """

    def __init__(self, brand=None, keyword=None):
        self.brands = {'Samsung':[],
                        'LG':[],
                       'Toshiba':[],
                       'Sony':[]}

        self.samsung_reg = re.compile('(?i)samsung')
        self.lg_reg = re.compile('(?i)lg')
        self.toshiba_reg = re.compile('(?i)toshiba')
        self.sony_reg = re.compile('(?i)sony')

        self.base_url = "https://www.bestbuy.com/"

        self.search_brands = brand
        self.search_term = keyword


    def findBrand(self, item):

        if self.samsung_reg.match(item['name']):
            self.brands['Samsung'].append(item)

        if self.lg_reg.match(item['name']):
            self.brands['LG'].append(item)

        if self.toshiba_reg.match(item['name']):
            self.brands['Toshiba'].append(item)

        if self.sony_reg.match(item['name']):
            self.brands['Sony'].append(item)


    def search(self):
        search_rank = 1
        br = mechanize.Browser()
        br.open(self.base_url)

        br.select_form('frmSearch')
        br.form['st'] = self.search_term

        br.submit()

        r = br.response()

        soup = BeautifulSoup(r,'html.parser')

        items = soup.findAll('div', attrs={'class':'list-item-postcard'})
        top3 = items[:3]

        for item in items:
            name = item.find('div', attrs={'class':'sku-title'})
            rank = item.find('span',attrs={'class':'star-rating-value'})
            reviews = item.find('span',attrs={'class':'number-of-reviews'})

            self.findBrand({'search_rank':search_rank,
                            'name':name.text,
                            'rating':rank.text,
                            'reviews':reviews.text})

            search_rank += 1

        print len(self.brands['Sony'])
        print len(self.brands['LG'])
        print len(self.brands['Toshiba'])
        print len(self.brands['Samsung'])


