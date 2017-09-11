The solution I implemented for this challenge is run on a django framework. I hosted it
using my existing site, the page can be found at:

    http://priceweb47.com/bestbuydata

This code itself won't run at all if it's downloaded, I've just collected all the relevant
code and put it into this repo so it's easier to got through. You can also see it integrated
into my existing code if you'd like, at:

    https://github.com/Price47/PriceWeb/tree/master/priceweb

To get the Data from Best Buy, I used a combination of Mechanize (for form submission) and
Beautiful Soup (for html parsing). The Scraper Object I made goes through the search results
from 'smart tv' and 'curved smart tv,' and then finds all of the brands which match the list of
brands provided (Samsung, Sony, LG, Toshiba). At first, I checked for a Best Buy API as a source
of data rather than web scraping, but access to their API is restricted, and only available to
companies.

The data that is scraped is saved in a Database as a simple "Television" model, and then displayed
graphically using High Charts. Only one dataset is saved per day, since it's a snapshot, so if the
data is updated for a particular day, existing data is overwritten. The app can be run multiple times,
the update button will grab the latest search result data for the day it's run. I've found the results
are relatively consistent, only ever slightly, maybe an extra Toshiba result or one less, that sort
of thing. Day by day, I've found that the results have been pretty consistent as well, so as far as volatility,
these datasets are pretty stable.

For the trends for reviews and rating in terms of search rank, I limited the data points to those of the brands
being searched. Originally, I included all search rankings and their ratings/reviews, even those not in the list
of brands provided, but in the end I limited it to the trends only related to the brands list. I also decided to exclude
the "featured products" Televisions, it seemed like they weren't necessarily part of the search results, but if it
 was determined they were important, they could be included with the other results pretty simply.

I've included a sample csv of data, which is what you'll get if you download any day's data with the "download button."
Additionally, you can use the arrows above the charts to navigate snapshots from different days and download those
results. There is also a date range search, so you can search form a given date range. The total number of TV's for that
range will be represented in the graphs showing the percentage of brands present in the search. For review trends and
rating trends, I decided the most useful way to display the trends over a given range was to take the mean value for
rating/review for each search rank over that period and graph that. The rating for every TV with the search rank of 2,
for example, is averaged for the date range searched, to show what the average rating for a tv with search rank of 2 for
any given day. This way for a span of 2 or 3 weeks, you get a clear trend for the relationship between rating and
search rank or reviews and search rank




