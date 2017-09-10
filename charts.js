
$(document).ready(function(){
    delete_cookie("JSANIMATORCHECK");
    cookie = false;
    document.getElementById("download_csv").addEventListener("click", function(){
            $('#animator_wrapper').css('display','inline');
            var cookieChecker = setInterval(clearAnimation,500)

    });
});

var highestDateOffset = 2;

function getLowestDate(){
    lowestDate = $.get('/lowestDate').then(
        function(success){

            highestDateOffset = parseInt(success['high_date'].split("-")[2]) -
                parseInt(success['low_date'].split("-")[2]);

    },
        function(error){
            console.log(error)
        });
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

function getTvData(){
        $('.data-chart').css('display', 'none');
        document.getElementById('best_buy_loader').style.display="inline";
        console.log('collecting data...');
        $.get('get_bestbuy_data').then(successCallback, errorCallback)
}

function dbData(){
    $('#date').text(0);
    url = "getbestbuycsv/" + new Date().toISOString().split('T')[0];
    document.getElementById("download_csv").href = (url);
    $('.data-chart').css('display', 'none');
    now = new Date().toISOString().split('T')[0];
    $('#header_date').text('Best Buy Data ' + now);
    document.getElementById('best_buy_loader').style.display="inline";
    console.log('collecting data...');
    $.get('savedTVData/'+ now).then(successCallback, errorCallback);

}

function dbDataByDate(date){
    cur_date = date.toISOString().split('T')[0];
    $('.data-chart').css('display', 'none');
        $('#header_date').text('Best Buy Data ' + cur_date );
        document.getElementById('best_buy_loader').style.display="inline";
        console.log('collecting data...');
        $.get('savedTVData/'+ cur_date).then(successCallback, errorCallback);
}

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
    dateOffset = parseInt(current)+1;

    if(dateOffset > highestDateOffset){
        dateOffset = highestDateOffset
    }

    $('#date').text(dateOffset);
    cur = new Date(new Date() - (86500000*dateOffset));

    url = "getbestbuycsv/" + cur.toISOString().split('T')[0];

    document.getElementById("download_csv").href = (url);

    dbDataByDate(cur)
}

function getDate(){
    current = $('#date').text();

    date = new Date(new Date() - (86500000*parseInt(current)));

    return date
}

function errorCallback(response){
    console.log(response)
}

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

$(function () {
    Highcharts.setOptions({
        colors:['#447fff', '#44ff91', '#ffab4c', '#c549ff']

    });
});