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

.controller('MyStockCtrl', ['$scope', 
  function($scope) {
   $scope.MyStocksArray=[
   {ticker: "AAPL"},
   {ticker: "GPRO"},
   {ticker: "FB"},
   {ticker: "NFLX"},
   {ticker: "TSLA"},
   {ticker: "BRK-A"},
   {ticker: "INTC"},
   {ticker: "NSFT"},
   {ticker: "GE"},
   {ticker: "BAC"},
   {ticker: "C"},
   {ticker: "T"},
   ]
}])

.controller('StockCtrl', ['$scope','$stateParams','stockDataService', 'dateService','chartDataService',
  function($scope, $stateParams,stockDataService,dateService,chartDataService) {
  
  $scope.ticker= $stateParams.stockticker;
  $scope.oneYearAgoDate = dateService.oneYearAgoDate();
  $scope.currentDate = dateService.currentDate();
   

  $scope.$on("$ionicView.afterEnter",function(){
    getPriceData();
    getChartData();
     
  })

  function getPriceData(){
    var promise = stockDataService.getPriceData($scope.ticker);
    promise.then(function(data){
    console.log(data);
    $scope.stockPriceData = data;
  });
  }

  function getChartData(){
    var promise = chartDataService.getHistoricalData($scope.ticker,$scope.oneYearAgoDate,$scope.currentDate);
    promise.then(function(data){
    console.log(data);
    $scope.ChartData = data;
  });
  }
    /* Chart options */
     $scope.options = { chart: {
        type: 'discreteBarChart',
        height: 450,
        margin : {
            top: 20,
            right: 20,
            bottom: 60,
            left: 55
        },
        x: function(d){ return d.label; },
        y: function(d){ return d.value; },
        showValues: true,
        valueFormat: function(d){
            return d3.format(',.4f')(d);
        },
        transitionDuration: 500,
        xAxis: {
            axisLabel: 'X Axis'
        },
        yAxis: {
            axisLabel: 'Y Axis',
            axisLabelDistance: 30
        }
    }};
    /* Chart data */
     $scope.data = [{
     key: "Cumulative Return",
     values: [
        { "label" : "A" , "value" : -29.765957771107 },
        { "label" : "B" , "value" : 0 },
        { "label" : "C" , "value" : 32.807804682612 },
        { "label" : "D" , "value" : 196.45946739256 },
        { "label" : "E" , "value" : 0.19434030906893 },
        { "label" : "F" , "value" : -98.079782601442 },
        { "label" : "G" , "value" : -13.925743130903 },
        { "label" : "H" , "value" : -5.1387322875705 }
        ]
    }]

}]);

