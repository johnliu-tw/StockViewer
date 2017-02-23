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
   	var d = new Date(new Date().setDate(new Date().getDate()-30));
   	var date = $filter('date')(d,'yyyy-MM-dd');

   	return date;

   }
   return {
   	currentDate: currentDate,
   	oneMonthAgoDate: oneMonthAgoDate
   }

 })

 .factory('stockDataService',function($q,$http,encodeURIService){

  var getPriceData=function(ticker){
        
       var deferred = $q.defer(),
       url="http://query.yahooapis.com/v1/public/yql?format=json&env=store://datatables.org/alltableswithkeys&q=select * from yahoo.finance.quote where symbol in ('"+ ticker +"')";
       	$http.get(url)
       .success(function(json){
       var jsonData = json.query.results.quote;
       deferred.resolve(jsonData);
     })
       .error(function(error){
       console.log("API error" + error);
       deferred.reject();
       })
     
     return deferred.promise;

  };

 	return {

 	getPriceData: getPriceData

 	};
 		
 })

 .factory('chartDataService', function($q,$http,encodeURIService){
   
   var getHistoricalData = function(ticker,fromDate,endDate){
       
       var deferred = $q.defer(),
       url="http://query.yahooapis.com/v1/public/yql?format=json&env=store://datatables.org/alltableswithkeys&q=select * from yahoo.finance.historicaldata where symbol = '"+ticker+"' and startDate = '"+fromDate+"' and endDate = '"+endDate+"'"
       $http.get(url)
       .success(function(json){
       var jsonData = json.query.results.quote;
       var priceData = [];
       jsonData.forEach(function(dayDataObject){
       	var date = dayDataObject.Date.substring(5),
       	price= parseFloat(Math.round(dayDataObject.Close*100)/100).toFixed(3);
        priceDatum= {"label": date ,"value": price}
        priceData.unshift(priceDatum);

       })
       
 
       var formattedChartData = 
       [{ key: 'Cumulative Return', values: priceData }] ;
        
         console.log(formattedChartData)

       deferred.resolve(formattedChartData);

     })
       .error(function(error){
       console.log("Chart Data error" + error);
       deferred.reject();
       })

       return deferred.promise;
    
   }
   return{
   	getHistoricalData: getHistoricalData
   }

 })




;