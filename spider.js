var eventproxy=require('eventproxy');
var request=require('superagent');
var cheerio=require('cheerio');
var url=require('url');
var express=require('express');
var async = require('async');
var queryString = require('querystring');

var urls = [];

var options = {
    utf8:'✓',
    start_day:'2016-11-15',
    end_day:'2016-11-16',
    low_cost:'',
    high_cost:'',
    sort:'0',
    name:'',
    clear_day:'',
    page:'2'
};

var queryParams = queryString.stringify(options);

var url1 = 'http://www.fishtrip.cn/taiwan/taibei?' + queryParams;
console.log(url1)
urls.push(url1);
urls.push('http://www.fishtrip.cn/taiwan/taibei?utf8=%E2%9C%93&start_day=2016-11-15&end_day=2016-11-16&low_cost=&high_cost=&sort=0&name=&clear_day=&page=1')

var result = [];
function fetchData(urls) {
    urls.forEach(function(url) {
        request.get(url)
            .end(function(err, res) {
                if (err) cb(err)

                var $ = cheerio.load(res.text);

                $('.fltriple__item').each(function(index, element) {
                    var id = $(this).children().attr('id');
                    var name = $(this).children().attr('data-ga-name');
                    var price = $(this).children().attr('data-ga-price');
                    var gmaps = $(this).children().attr('data-gmaps');
                    var imgSrc = $(this).children().find('.house-item-image img').attr('data-original');
                    var address = $(this).children().find('.hiinfo__location').text(); 
                    var data = {
                        id: id,
                        name: name,
                        price: price,
                        gmaps: gmaps,
                        imgSrc: imgSrc,
                        address: address
                    }
                    result.push(data);
                })
               
            })
           
    })

console.log(result);
return result;

}


fetchData(urls);




var app = express();
app.listen(3000,function() {
    console.log('app listtening port 3000')
})