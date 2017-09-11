/**
 * Created by rockstar645 on 9/5/17.
 */
$(document).ready(function(){
    $('#range_menu').hide();
    $( "#datepicker" ).datepicker();
    $( "#datepicker2" ).datepicker();
    delete_cookie("JSANIMATORCHECK");
    cookie = false;
    document.getElementById("download_csv").addEventListener("click", function(){
            $('#animator_wrapper').css('display','inline');
            var cookieChecker = setInterval(clearAnimation,500)

    });
});

var highestDateOffset;

function headerDate(date){
    string = date.split("-");
    return string[1] + "/" + string[2] +"/" + string[0]
}

function getLowestDate(){
    lowestDate = $.get('/lowestDate').then(
        function(success){

            highestDateOffset = (parseInt(success['high_date'].split("-")[2]) -
                parseInt(success['low_date'].split("-")[2]));

    },
        function(error){
            console.log(error)
        });
}

function setDaily(){
    dbData();
    $('#daily_menu').slideDown();
    $('#range_menu').slideUp();
}

function setRange(){
    $('#range_menu').slideDown();
    $('#daily_menu').slideUp()

}

function clearAnimation(){
    if(cookieExists("JSANIMATORCHECK")){
        $('#animator_wrapper').css('display','none');
        delete_cookie("JSANIMATORCHECK");
    }
}

function cookieExists(name) {
    return (document.cookie.indexOf(name) > -1)
}

var delete_cookie = function(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

// This function actually scrapes best buy for data, before creating charts. The data scraped is
// added to the DB. This function is only called when the client clicks "update"
function getTvData(){
        $('.data-chart').css('display', 'none');
        document.getElementById('best_buy_loader').style.display="inline";
        console.log('collecting data...');
        $.get('get_bestbuy_data').then(successCallback, errorCallback)
}

// Grab today's television data
function dbData(){
    $('#date').text(0);
    url = "getbestbuycsv/" + new Date().toISOString().split('T')[0];
    document.getElementById("download_csv").href = (url);
    $('.data-chart').css('display', 'none');
    now = new Date().toISOString().split('T')[0];
    $('#header_date').text(headerDate(now));
    document.getElementById('best_buy_loader').style.display="inline";
    console.log('collecting data...');
    $.get('savedTVData/'+ now).then(successCallback, errorCallback);

}

// Grab Television data by a specific date
function dbDataByDate(date){
    cur_date = date.toISOString().split('T')[0];
    $('.data-chart').css('display', 'none');
    $('#header_date').text(headerDate(cur_date));
    document.getElementById('best_buy_loader').style.display="inline";
    console.log('collecting data...');
    $.get('savedTVData/'+ cur_date).then(successCallback, errorCallback);
}

// Grab the date from the 2 date fields, setting it to today if the field isn't filled in,
// and then updates the download_csv href, then gets data for that date range.
function dbDataByRange(){
        date = new Date();
        console.log('range');

        if($( "#datepicker" ).val()) {
            startDate = $( "#datepicker" ).val().split("/");
            start = startDate[2] + "-" + startDate[0] + "-" + startDate[1];
        }
        else{
            start = date.toISOString().split('T')[0];
        }

        if($( "#datepicker2" ).val()) {
            endDate = $( "#datepicker2" ).val().split("/");
            end = endDate[2] + "-" + endDate[0] + "-" + endDate[1];
        }
        else{
            end = date.toISOString().split('T')[0];
        }

        $('#header_date').text(headerDate(start) + " to " + headerDate(end) );

        url = "getbestbuycsv/" + start + "/" + end;
        document.getElementById("download_csv").href = (url);

        $('.data-chart').css('display', 'none');
        document.getElementById('best_buy_loader').style.display="inline";
        console.log('collecting data...');
        $.get('savedTVDataRange/' + start + "/" + end).then(successCallback, errorCallback)
}

// getNext and getPrev load the next or previous days data. The value saves in #date
// is the offset from today of the data being searched (9/6/2017 is 3 days away from 9/9/2017,
// so the offset is 3.) 86500000 is one day in milliseconds, times the offset is days, which
// gives the date next in the sequence. the download_csv href is also updated, so that
// the csv downloaded is for the data currently being viewed.
function getNext(){

    current = $('#date').text();
    dateOffset = parseInt(current)-1;

    if(dateOffset < 0){
        dateOffset = 0;
    }

    $('#date').text(dateOffset);

    cur = new Date(new Date() - (86500000*dateOffset));

    url = "getbestbuycsv/" + cur.toISOString().split('T')[0];

    document.getElementById("download_csv").href = (url);

    dbDataByDate(cur)
}

function getPrev(){

    current = $('#date').text();

    dateOffset = parseInt(current) + 1;

    if(dateOffset > highestDateOffset){
        dateOffset = highestDateOffset
    }

    $('#date').text(dateOffset);

    cur = new Date(new Date() - (86500000*dateOffset));

    url = "getbestbuycsv/" + cur.toISOString().split('T')[0];

    document.getElementById("download_csv").href = (url);

    dbDataByDate(cur)
}


function errorCallback(response){
    console.log(response)
}

// This function is called for each data request from the db, and populates
// the highcharts graphs with data from the requests
function successCallback(response){
    var straightData = response['normal_hits'];
    var curvedData = response['curved_hits'];
    var top3Data = response['top_3_hits'];
    var curvedTop3Data = response['top_3_curved_hits'];

    document.getElementById('best_buy_loader').style.display="none";
    $('.data-chart').css('display', 'inline-block');

    var top3Percentage = Highcharts.chart('top_3_percentage', {
            chart: {
                type: 'pie'
            },
            title: {
                text:'Brands in Top 3 Search Results'
            },
            subtitle: {
                text: "Smart TV's"
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b>'
            },
            series: [{
                data: [{
                    name: 'LG',
                    y: top3Data['LG']
            }, {
                    name: 'Samsung',
                    y: top3Data['Samsung']

            }, {
                    name: 'Sony',
                    y: top3Data['Sony']
            }, {
                    name: 'Toshiba',
                    y: top3Data['Toshiba']
                }]
            }]
    });

    var top3CurvedPercentage = Highcharts.chart('top_3_curved_percentage', {
            chart: {
                type: 'pie'
            },
            title: {
                text:'Brands in Top 3 Search Results'
            },
            subtitle: {
                text: "Curved Smart TV's"
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b>'
            },
            series: [{
                data: [{
                    name: 'LG',
                    y: curvedTop3Data['LG']
            }, {
                    name: 'Samsung',
                    y: curvedTop3Data['Samsung']

            }, {
                    name: 'Sony',
                    y: curvedTop3Data['Sony']
            }, {
                    name: 'Toshiba',
                    y: curvedTop3Data['Toshiba']
                }]
            }]
    });

    var searchResults = Highcharts.chart('tv_search_results', {
            chart: {
                type: 'bar'
            },
            title: {
                text: 'Best Buy TV search results'
            },
            xAxis: {
                categories: ['LG', 'Samsung', 'Sony', 'Toshiba']
            },
            yAxis: {
                title: {
                    text: 'Hits'
                }
            },
            series: [{
                name: 'Smart TV Results',
                data: [straightData['LG'], straightData['Samsung'], straightData['Sony'], straightData['Toshiba']]
            },
            {
                name: 'Curved Smart TV Results',
                data: [curvedData['LG'], curvedData['Samsung'], curvedData['Sony'], curvedData['Toshiba']]
            }]
    });

    var resultPercentage = Highcharts.chart('tv_search_results_percentage', {
            chart: {
                type: 'pie'
            },
            title: {
                text: 'Search Result Percentages'
            },
            subtitle:{
                text: "Smart Tv's"
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b>'
            },
            series: [{
                data: [{
                    name: 'LG',
                    y: straightData['LG']
            }, {
                    name: 'Samsung',
                    y: straightData['Samsung']

            }, {
                    name: 'Sony',
                    y: straightData['Sony']
            }, {
                    name: 'Toshiba',
                    y: straightData['Toshiba']
                }]
            }]
    });

    var curvedResultPercentage = Highcharts.chart('curved_tv_search_results_percentage', {
            chart: {
                type: 'pie'
            },
            title: {
                text: 'Search Result Percentages'
            },
            subtitle:{
                text: "Curved Smart Tv's"
            },
            tooltip: {
                pointFormat: '<b>{point.percentage:.1f}%</b>'
            },
            series: [{
                data: [{
                    name: 'LG',
                    y: curvedData['LG']
            }, {
                    name: 'Samsung',
                    y: curvedData['Samsung']

            }, {
                    name: 'Sony',
                    y: curvedData['Sony']
            }, {
                    name: 'Toshiba',
                    y: curvedData['Toshiba']
                }]
            }]
    });

    var rateTrend = Highcharts.chart('rate_search_trend', {
            title: {
                text: 'Search results vs Rating trend'
            },
            yAxis: {
                title: {
                    text:'Rating'
                }
            },
            xAxis: {
                title:{
                    text:'Search Ranking'
                }
            },
            plotOptions:{
                series:{
                    pointStart:1
                }
            },
            series:[{
                name: 'Smart TV',
                data: response['rate_trends']
            }, {
                name: 'Curved Smart Tv',
                data: response['curved_rate_trends']
            }]
    });

    var reviewTrend = Highcharts.chart('review_search_trend', {
            title: {
                text: 'Search results vs Review trend'
            },
            yAxis: {
                title: {
                    text:'Number of Reviews'
                }
            },
            xAxis: {
                title:{
                    text:'Search Ranking'
                }
            },
            plotOptions:{
                series:{
                    pointStart:1
                }
            },
            series:[{
                name: 'Smart TV',
                data: response['review_trends']
            }, {
                name: 'Curved Smart Tv',
                data: response['curved_review_trends']
            }]
    });
}


// Sets global style for highcharts
$(function () {
    Highcharts.setOptions({
        colors:['#447fff', '#44ff91', '#ffab4c', '#c549ff']

    });
});