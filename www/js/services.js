angular.module('IonicGo.services',[])

 .factory('encodeURIService',function(){

   return{
   	encode: function(string){
      return encodeURIComponent(string).replace(/\"/g, "%22")
   	}
   }

 })

 .factory('dateService',function($filter){

   var currentDate = function(){
   	var d = new Date();
   	var date = $filter('date')(d,'yyyy-MM-dd');
    
   	return date;

   }
   var oneMonthAgoDate = function(){
   	var d = new Date(new Date().setDate(new Date().getDate()-15));
   	var date = $filter('date')(d,'yyyy-MM-dd');

   	return date;

   }
   return {
   	currentDate: currentDate,
   	oneMonthAgoDate: oneMonthAgoDate
   }

 })


 .factory('chartDataCacheService',function(CacheFactory){
 	var chartDataCache;
    
    if(!CacheFactory.get('chartDataCache')){
    	chartDataCache=CacheFactory('chartDataCache',{
    		maxAge: 60*60*8*1000,
    		deleteOnExpire: 'aggressive',
    		storageMode:'localStorage'
    	});
    }
    else {
    	chartDataCache=CacheFactory.get('chartDataCache');
    }

 	return chartDataCache;
 })

 .factory('stockDataCacheService',function(CacheFactory){
 	var stockDataCache;
    
    if(!CacheFactory.get('stockDataCache')){
    	stockDataCache=CacheFactory('stockDataCache',{
    		maxAge: 60*60*8*1000,
    		deleteOnExpire: 'aggressive',
    		storageMode:'localStorage'
    	});
    }
    else {
    	stockDataCache=CacheFactory.get('stockDataCache');
    }

 	return stockDataCache;
 })
 .factory('noteCacheService',function(CacheFactory){
    var noteDataCache;
    
    if(!CacheFactory.get('noteDataCache')){
    	noteDataCache=CacheFactory('noteDataCache',{
    		maxAge: 60*60*8*1000,
    		deleteOnExpire: 'aggressive',
    		storageMode:'localStorage'
    	});
    }
    else {
    	noteDataCache=CacheFactory.get('noteDataCache');
    }

 	return noteDataCache;


 })



 .factory('stockDataService',function($q,$http,encodeURIService,stockDataCacheService){

  var getPriceData=function(ticker){
        
       var deferred = $q.defer(),
       cacheKey = ticker,
       stockDataCache=stockDataCacheService.get(cacheKey),

       url="http://query.yahooapis.com/v1/public/yql?format=json&env=store://datatables.org/alltableswithkeys&q=select * from yahoo.finance.quote where symbol in ('"+ ticker +"')";
       if(stockDataCache){
       	deferred.resolve(stockDataCache);
       	console.log("Get stock data cache")
       }
       else{
       $http.get(url)
       .success(function(json){
       var jsonData = json.query.results.quote;
       deferred.resolve(jsonData);
       stockDataCacheService.put(cacheKey,jsonData)
       })
       .error(function(error){
       console.log("API error" + error);
       deferred.reject();
       })

       }
     
     return deferred.promise;

  };

 	return {

 	getPriceData: getPriceData

 	};
 		
 })

 .factory('chartDataService', function($q,$http,encodeURIService,chartDataCacheService){
   
   var getHistoricalData = function(ticker,fromDate,endDate){
       
       var deferred = $q.defer(),
       
       cacheKey = ticker,
       chartDataCache=chartDataCacheService.get(cacheKey),
     
       url="http://query.yahooapis.com/v1/public/yql?format=json&env=store://datatables.org/alltableswithkeys&q=select * from yahoo.finance.historicaldata where symbol = '"+ticker+"' and startDate = '"+fromDate+"' and endDate = '"+endDate+"'"
     

       if(chartDataCache){
       	deferred.resolve(chartDataCache);
       	console.log("Get chart cache")
       }
       else{
       	$http.get(url)
       .success(function(json){
       var jsonData = json.query.results.quote;
       var priceData = [];
       jsonData.forEach(function(dayDataObject){
       	var date = dayDataObject.Date.substring(5),
       	price= parseFloat(Math.round(dayDataObject.Close*100)/100).toFixed(3);
        var volume = parseInt(dayDataObject.Volume/10000).toFixed(2)*10000;
        priceDatum= {"label": date ,"value": volume}
        priceData.unshift(priceDatum);
   
       })
       console.log(priceData)
 
       var formattedChartData = 
       [{ key: 'Cumulative Return', values: priceData }] ;

       deferred.resolve(formattedChartData);
       chartDataCacheService.put(cacheKey,formattedChartData)

     })
       .error(function(error){
       console.log("Chart Data error" + error);
       deferred.reject();
       })

       }  

       return deferred.promise;
    
   }
   return{
   	getHistoricalData: getHistoricalData
   }

 })

 .factory('noteService',function(noteCacheService) {
 	return{
 		getNote: function(ticker){
          return noteCacheService.get(ticker);
 		},
 		addNote: function(ticker,note){
          
          var stockNotes = [];

          if(noteCacheService.get(ticker)){
          	stockNotes = noteCacheService.get(ticker);
          	stockNotes.push(note);
          }
          else{
          	stockNotes.push(note);
          }

 		  noteCacheService.put(ticker,stockNotes);

 		},
 		deleteNote: function(ticker,index){
          var stockNotes=[];
          stockNotes = noteCacheService.get(ticker);
          stockNotes.splice(index,1)
          noteCacheService.put(ticker,stockNotes);
          console.log("YA")
         
 		}
 	}
 })
 .factory('newsService', function($q,$http){
  return{
    getNews:function(ticker){
          var deferred = $q.defer(),
          x2js = new X2JS(),
          url = "http://finance.yahoo.com/rss/headline?s="+ ticker;
          $http.get(url)
            .success(function(xml){
              var xmlDoc = x2js.parseXmlString(xml),
              json = x2js.xml2json(xmlDoc),
              jsonData = json.rss.channel.item;
              deferred.resolve(jsonData);
            })
            .error(function(error){
              deferred.reject();
              console.log("News error: "+ error)
            });   

            return deferred.promise;
            }
    };
 })




;