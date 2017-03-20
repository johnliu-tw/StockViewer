angular.module('IonicGo.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };  
})

.controller('MyStockCtrl', ['$scope','myStocksArrayService', 
  function($scope, myStocksArrayService) {
   $scope.MyStocksArray=myStocksArrayService;
   console.log(myStocksArrayService)

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



}]);

