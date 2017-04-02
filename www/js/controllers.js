angular.module('IonicGo.controllers', [])

.controller('AppCtrl',['$scope','modalService',
 function($scope, modalService) {

  $scope.modalService = modalService
 
}])

.controller('MyStockCtrl', ['$scope','myStocksArrayService', 'stockDataService','stockDataCacheService','followStockService',
  function($scope, myStocksArrayService, stockDataService, stockDataCacheService,followStockService) {

 $scope.$on("$ionicView.afterEnter",function(){
   
      $scope.getMyStocksData();
      console.log($scope.myStocksData)
     
  })


 $scope.getMyStocksData = function(){
    myStocksArrayService.forEach(function(stock){
      var promise = stockDataService.getPriceData(stock.ticker);

      $scope.myStocksData = [];

      promise.then(function(data){
      $scope.myStocksData.push(stockDataCacheService.get(data.symbol))
      })

    })
    $scope.$broadcast("scroll.refreshComplete");
   };
   $scope.MyStocksArray=myStocksArrayService;
   $scope.unfollowStock = function(ticker){
    followStockService.unfollow(ticker);
    $scope.getMyStocksData();
   }
  
}])

.controller('StockCtrl', ['$scope','$stateParams','$ionicPopup','followStockService','stockDataService', 'dateService','chartDataService','noteService','newsService',
  function($scope, $stateParams,$ionicPopup,followStockService,stockDataService,dateService,chartDataService,noteService,newsService) {
  
  $scope.ticker= $stateParams.stockticker;
  $scope.oneMonthAgoDate = dateService.oneMonthAgoDate();
  $scope.currentDate = dateService.currentDate();
  $scope.stockNotes= []; 
  $scope.newStories = [];
  $scope.following = followStockService.checkFollowing($scope.ticker)

  $scope.$on("$ionicView.afterEnter",function(){
    getPriceData();
    getChartData();
    getNews();
    $scope.stockNotes = noteService.getNote($scope.ticker);
 
     
  })

  $scope.toggleFollow = function(){
    if($scope.following){
      followStockService.unfollow($scope.ticker)
      $scope.following = false;
    }
    else{
      followStockService.follow($scope.ticker)
      $scope.following = true;
    }
  }
  
  $scope.openWindow = function(link){
    //
    console.log("openWindow ->" + link)
  };

  $scope.addNote = function() {
  $scope.note = {title: 'Note',body: '',date: $scope.currentDate,ticker: $scope.ticker};


  var note= $ionicPopup.show({
    template: '<input type="text" ng-model="note.title" id="stock-note-title"><textarea type="text" ng-model="note.body" id="stock-note-body"></textarea>',
    title: 'New note for '+ $scope.ticker,
    scope: $scope,
    buttons: [
      { 
        text: 'Cancel',
        onTop: function(e){
          return;
        }
      },
      {
        text: '<b>Save</b>',
        type: 'button-balanced',
        onTap: function(e) {
        noteService.addNote($scope.ticker, $scope.note);
        }
      }
    ]
  });
  note.then(function(res) {
  $scope.stockNotes = noteService.getNote($scope.ticker);

  });

};
  $scope.openNote = function(index,title,body) {
  $scope.note = {title: title, body: body,date: $scope.currentDate,ticker: $scope.ticker};


  var note= $ionicPopup.show({
    template: '<input type="text" ng-model="note.title" id="stock-note-title"><textarea type="text" ng-model="note.body" id="stock-note-body"></textarea>',
    title: $scope.note.title,
    scope: $scope,
    buttons: [
      {
        text: "Delete",
        type: "button-assertive button-small",
        onTap: function(e){
          noteService.deleteNote($scope.ticker,index);
        } 
      },
      { 
        text: 'Cancel',
        type: "button-small",
        onTap: function(e){
          return;
        } 
      },
      {
        text: '<b>Save</b>',
        type: 'button-balanced button-small',
        onTap: function(e) {
        noteService.deleteNote($scope.ticker,index)
        noteService.addNote($scope.ticker, $scope.note);
        }
      }
    ]
  });
  note.then(function(res) {
  $scope.stockNotes = noteService.getNote($scope.ticker);

  });

};

  function getPriceData(){
    var promise = stockDataService.getPriceData($scope.ticker);
    promise.then(function(data){
    console.log(data);
    $scope.stockPriceData = data;
    if(data.Change >=0 && data!==null){
      $scope.reactiveColor={
        'background-color' : 'green' ,
        'border-color' : 'rgba(255,255,255,.3)'       
      }
    }
    else if(data.Change < 0 && data!==null){
      $scope.reactiveColor={
        'background-color' : 'red',
        'border-color' : 'rgba(0,0,0,.2)'        
      }
    }
  });
  }
  
  function getNews(){
       var promise = newsService.getNews($scope.ticker);
       promise.then(function(data){
       $scope.newStories = data;
       console.log($scope.newStories)
       })
  }

  function getChartData(){
    var promise = chartDataService.getHistoricalData($scope.ticker,$scope.oneMonthAgoDate,$scope.currentDate);
    promise.then(function(data){
    $scope.data=data
  });
  }
    /* Chart options */
     $scope.options = { 
       chart: {
        type: 'discreteBarChart',
        height: 350,
        margin : {
            top: 50,
            right: 20,
            bottom: 60,
            left: 90  
        },
        subtitle: {
        enable: true,
        text: 'Volume Sheet'
        },
        x: function(d){ return d.label; },
        y: function(d){ return d.value; },
        showValues: true,
        valueFormat: function(d){
            return d3.format('s')(d);
        },
        transitionDuration: 500,
        xAxis: {
            axisLabel: 'Date'
        },
        yAxis: {
            axisLabel: 'Volume',
            axisLabelDistance: 10,
            tickFormat: d3.format('s')
        }

    }};



}])

.controller("SearchCtrl", ['$scope','$state','modalService','searchService',
  function($scope,$state,modalService,searchService){

    $scope.closeModal = function(){
      modalService.closeModal();
    }

    $scope.search = function(){
      $scope.searchResults = ' '
      startSearch($scope.searchQuery)
    }

    var startSearch = ionic.debounce(function(query){
      searchService.search(query)
        .then(function(data){
          $scope.searchResults = data
        })
    }, 750);
    $scope.goToStock = function(ticker){
      modalService.closeModal();
      $state.go('app.stock', {stockticker: ticker});
    }

}])

.controller("LoginSignupCtrl",["$scope","modalService",
  function($scope,modalService){
    $scope.closeModal = function(){
      modalService.closeModal();
    }
  
  }])

;

