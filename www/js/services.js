angular.module('IonicGo.services',[])

 .factory('stockDataService',function($q,$http){

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


;