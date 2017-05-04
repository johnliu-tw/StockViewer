angular.module('IonicGo.services',[])


 .factory('encodeURIService',function(){

   return{
   	encode: function(string){
      return encodeURIComponent(string).replace(/\"/g, "%22")
   	}
   }

 })
 .service('modalService', function($ionicModal){
  
  this.openModal = function(id){
    var _this = this;
    

    if(id==1){
      $ionicModal.fromTemplateUrl('templates/search.html', {
       scope: null,
       controller: ('SearchCtrl')
      }).then(function(modal) {
       _this.modal = modal;
       _this.modal.show();
    });
    }
    else if(id ==2){
      $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: null,
      controller: ('LoginSignupCtrl')
      }).then(function(modal) {
       _this.modal = modal;
       _this.modal.show();
    });
    }
    else if(id==3){
      $ionicModal.fromTemplateUrl('templates/signup.html', {
      scope: null,
      controller: ('LoginSignupCtrl')
      }).then(function(modal) {
       _this.modal = modal;
       _this.modal.show();
    });

  };
  
  this.closeModal = function(){
    var _this = this;
    if(!_this.modal) return;
    _this.modal.hide();
    _this.modal.remove();

  }

 }})
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

.factory('firebaseDBRef', function() {
  return firebase.database().ref();
})



.factory('firebaseAuthRef', function() {
  return firebase.auth();
})



.factory('firebaseUserRef', function(firebaseDBRef) {
  return firebaseDBRef.child('users');
})

.factory('userService',function($rootScope,$window,$timeout,firebaseUserRef,firebaseAuthRef,
  firebaseDBRef,myStocksArrayService,myStocksCacheService,noteCacheService,modalService,userCacheService){
  
  var login = function(user, signup){
     var email = user.email;
     var password = user.password;
     firebaseAuthRef.signInWithEmailAndPassword(email, password)
      .then(function(authData) {
        $rootScope.currentUser = authData;

        if(signup){
          modalService.closeModal();
        }
        else{
          
          myStocksCacheService.removeAll();
          noteCacheService.removeAll();

          loadUserData(authData);
          userCacheService.put(email, authData);
          modalService.closeModal();

          $timeout(function() {
            $window.location.reload(true);
          }, 400);

        }
        })
      
      .catch(function(error) {
        console.log("Login Failed!", error);
        return false;
      });
  };
  var signup = function(user){
     firebaseAuthRef.createUserWithEmailAndPassword(user.email,user.password)
     .then(function(userData) {
       login(user, true);
       firebaseDBRef.child('emails').push(user.email);
       firebaseUserRef.child('stocks').set(myStocksArrayService);     
       var stockWithNotes = noteCacheService.keys();
       stockWithNotes.forEach(function(stockWithNotes){
          var notes = noteCacheService.get(stockWithNotes);
          notes.forEach(function(note){
            firebaseUserRef.child(userData.uid).child('notes').child(note.ticker).push(note)
          })
       })
     })
     .catch(function(error) {
       console.log("Error creating user:", error);
       return false;
     });

  };

  var logout = function(user){
    firebaseAuthRef.signOut();
    noteCacheService.removeAll();
    myStocksCacheService.removeAll();
    userCacheService.removeAll();
    $rootScope.currentUser = '';
    $window.location.reload(true);
  };

  var updateStocks = function(stocks){
    firebaseUserRef.child(getUser().uid).child('stocks').set(stocks);

  }

  var updateNotes = function(ticker,notes){
    firebaseUserRef.child(getUser().uid).child('notes').child(ticker).remove();
    notes.forEach(function(note){
      firebaseUserRef.child(getUser().uid).child('notes').child(note.ticker).push(note);
    })
  }

  var loadUserData = function(authData){
    firebaseUserRef.child(authData.uid).child('stocks').once('value', function(snapshot){
      var stocksFromDatabase = [];
      snapshot.val().forEach(function(stock){
        var stockToAdd = {ticker: stock.ticker}
        stocksFromDatabase.push(stockToAdd)
      })
      myStocksCacheService.put('myStocks', stocksFromDatabase);
    },
    function(error){
      console.log("Firebase error -> stocks" + error )
    });

    firebaseUserRef.child(authData.uid).child('notes').once('value', function(snapshot){
      snapshot.forEach(function(stockWithNotes){
        var notesFromDatabase = [];
        stockWithNotes.forEach(function(note){
          notesFromDatabase.push(note.val())
          var cacheKey = note.child('ticker').val();
          noteCacheService.put(cacheKey, notesFromDatabase);
        })
      })
    },
    function(error){
      console.log("Firebase error -> notes" + error )
    });

  }

  var getUser = function() {
    return firebaseAuthRef.currentUser;
  };

  if(getUser()){
    $rootScope.currentUser = getUser();
  }
  return{
    login: login,
    signup: signup,
    logout: logout,
    updateStocks : updateStocks,
    updateNotes:updateNotes,
    getUser : getUser


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

 .factory('stockPriceCacheService',function(CacheFactory){
  var stockPriceCache;
    
    if(!CacheFactory.get('stockPriceCache')){
      stockPriceCache=CacheFactory('stockPriceCache',{
        maxAge: 5*1000,
        deleteOnExpire: 'aggressive',
        storageMode:'localStorage'
      });
    }
    else {
      stockPriceCache=CacheFactory.get('stockPriceCache');
    }

  return stockPriceCache;
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
 .factory('userCacheService',function(CacheFactory){
    var userDataCache;
    
    if(!CacheFactory.get('userDataCache')){
      userDataCache=CacheFactory('userDataCache',{
        maxAge: 60*60*8*1000,
        deleteOnExpire: 'aggressive',
        storageMode:'localStorage'
      });
    }
    else {
      userDataCache=CacheFactory.get('userDataCache');
    }

  return userDataCache;


 })
 .factory('fillMyStocksCacheService', function(CacheFactory){
  
  var myStocksCache;
  if(!CacheFactory.get('myStocksCache')){
    myStocksCache = CacheFactory('myStocksCache', {
      storageMode: 'localStorage'
    });
  }
  else{
    myStocksCache = CacheFactory.get('myStocksCache')
  }
  
  var fillMyStocksCache = function(){
   var myStocksArray=[
   {ticker: "AAPL"},
   {ticker: "GPRO"},
   {ticker: "FB"},
   {ticker: "NFLX"},
   {ticker: "TSLA"},
   {ticker: "BRK-A"},
   {ticker: "INTC"},
   {ticker: "GE"},
   {ticker: "BAC"},
   {ticker: "C"},
   {ticker: "T"},
   ];

  myStocksCache.put('myStocks',myStocksArray)

  };

  return{
    fillMyStocksCache: fillMyStocksCache
  };

 })

 .factory('myStocksCacheService', function(CacheFactory){

  var myStocksCache = CacheFactory.get('myStocksCache')
  
  return myStocksCache

 })

 .factory('myStocksArrayService', function(fillMyStocksCacheService,myStocksCacheService){

  if(!myStocksCacheService.info('myStocks')){
     fillMyStocksCacheService.fillMyStocksCache()
  }

  var myStocks = myStocksCacheService.get('myStocks')

  return myStocks;

 })

 .factory('followStockService', function(myStocksArrayService, myStocksCacheService,userService){

  return{
    follow: function(ticker){
      var stockToAdd = {"ticker" : ticker};
      myStocksArrayService.push(stockToAdd)
      myStocksCacheService.put('myStocks',myStocksArrayService)
      if(userService.getUser()){
        userService.updateStocks(myStocksArrayService);
      }
    },
    unfollow: function(ticker){
     for(var i=0;i< myStocksArrayService.length;i++){
      if(myStocksArrayService[i].ticker == ticker){
        myStocksArrayService.splice(i,1);
        myStocksCacheService.remove('myStocks');
        myStocksCacheService.put('myStocks',myStocksArrayService);
        if(userService.getUser()){
          userService.updateStocks(myStocksArrayService);
        }
        break;
      }
     }


    },
    checkFollowing: function(ticker){
      for(var i=0;i<myStocksArrayService.length;i++){
        if(myStocksArrayService[i].ticker == ticker){
          return true;
        }
      }
      return false;
    }

  };

 })

 .factory('stockDataService',function($q,$http,encodeURIService,stockDataCacheService,stockPriceCacheService){

  var getPriceData=function(ticker){
        
       var deferred = $q.defer(),
       cacheKey = ticker,
       stockDataCache=stockDataCacheService.get(cacheKey),

       url="http://query.yahooapis.com/v1/public/yql?format=json&env=store://datatables.org/alltableswithkeys&q=select * from yahoo.finance.quote where symbol in ('"+ ticker +"')";
       if(stockDataCache){
       	deferred.resolve(stockDataCache);
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

 .factory('noteService',function(noteCacheService,userService) {
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

      if(userService.getUser()){
        var notes = noteCacheService.get(ticker);
        userService.updateNotes(ticker,stockNotes);
      }

 		},
 		deleteNote: function(ticker,index){
          var stockNotes=[];
          stockNotes = noteCacheService.get(ticker);
          stockNotes.splice(index,1)
          noteCacheService.put(ticker,stockNotes);

          if(userService.getUser()){
          var notes = noteCacheService.get(ticker);
          userService.updateNotes(ticker,stockNotes);
      }
         
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
  .factory('searchService',function($q,$http,$sce){

    return {

    search: function(query) {

      var deferred = $q.defer(),

      url = 'http://d.yimg.com/aq/autoc?query='+query+'&region=US&lang=en-US';

      $http.get(url)
        .success(function(data){
          var jsonData = data.ResultSet.Result;
          deferred.resolve(jsonData);
        }

          )

      return deferred.promise;
    }
  };
  })




;