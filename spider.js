
var request = require('superagent');
var cheerio = require('cheerio');
var url = require('url');
var express = require('express');
var app = express();
var async = require('async');

var EventProxy  = require('eventproxy');
var ep = new EventProxy();

var queryString = require('querystring');


var urlsArray = [], //存放爬取网址
    pageUrls = [],  //存放收集文章页面网站
    pageNum = 10;  //要爬取的页数

for(var i=0 ; i<= 2 ; i++){
    pageUrls.push('http://taiwan.zizaike.com/search//a14-b10-p' + i + '/?');
}

console.log(pageUrls);

app.get('/', function(req, res) {

})

pageUrls.forEach(function(url) {
    request.get(url)
        .end(function(err,res){
            if(err) console.log(err)
            var $ = cheerio.load(res.text);
            var curPageUrls = $('.div_home_photo a');

            for(var i = 0 ; i < curPageUrls.length ; i++){
                var imgUrl = 'http://taiwan.zizaike.com' + curPageUrls.eq(i).attr('href');
                //console.log(imgUrl);
                urlsArray.push(imgUrl);
                // 相当于一个计数器
                ep.emit('finishImgUrl', imgUrl);
            }
        });
})

ep.after('finishImgUrl',pageUrls.length*25, function(list){
    console.log('获取到的酒店数量是' + list.length + '\n' + '地址是：' + list);
    var concurrencyCount = 0;
    var fetchStart = new Date().getTime();

    var fetchData = function(url, cb) {
        concurrencyCount++;
        console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url);
        request.get(url)
            .end(function(err, res){
                if(err) cb(err)
                var time = new Date().getTime() - fetchStart;
                console.log('抓取 ' + url + ' 成功', '，耗时' + time + '毫秒');
                concurrencyCount--;
                var $ = cheerio.load(res.text);
                var result = {
                    name: $('#line1 h3').text(),
                    price: parseInt($('.price b').html()),
                    address: $('#line2 p').attr('title'),
                    score: parseFloat($('#line3 p b').text()),
                    recommend: $('#comments_filter a').eq(1).text().toString(),
                    notRecommend:$('#comments_filter a').eq(2).html()
                };
                console.log(result)
                cb(null, result);
            })
    }

    async.mapLimit(list, 5, function(url, cb) {
        fetchData(url, cb)},
        function(err, result){
            console.log(result.length)
        }
    )
})




































app.listen(3000, function (req, res) {
    console.log('app is running at port 3000');
});