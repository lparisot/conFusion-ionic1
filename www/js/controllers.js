'use strict';

angular.module('conFusion.controllers', [])

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

  .controller('HeaderController', ['$scope', '$state', function($scope, $state) {
    $scope.isActive = function (viewLocation) {
      if ($state.current.name === 'app.dishdetails') {
        return viewLocation === 'app.menu';
      }
      return $state.current.name === viewLocation;
    };
  }])

  .controller('MenuController', ['$scope', 'menuFactory', 'baseURL',
      function($scope, menuFactory, baseURL) {
    $scope.baseURL = baseURL;

    $scope.showMenu = false;
    $scope.message = "Loading ...";

    $scope.dishes = [];
    menuFactory.getDishes().query(
      function(response) {
        $scope.dishes = response;
        $scope.showMenu = true;
      },
      function(response) {
        $scope.message = "Error: " + response.status + " " + response.statusText;
      });

    // menus filter
    $scope.filterText = '';

    // menus tab selector
    $scope.tab = 1;
    $scope.select = function(setTab) {
      $scope.tab = setTab;

      if (setTab === 2) {
        $scope.filterText = "appetizer";
      }
      else if (setTab === 3) {
        $scope.filterText = "mains";
      }
      else if (setTab === 4) {
        $scope.filterText = "dessert";
      }
      else {
        $scope.filterText = "";
      }
    };
    $scope.isSelected = function (checkTab) {
      return ($scope.tab === checkTab);
    };

    // show details
    $scope.showDetails = false;
    $scope.toggleDetails = function() {
      $scope.showDetails = !$scope.showDetails;
    };
  }])

  .controller('ContactController', ['$scope', function($scope) {
    $scope.feedback = { mychannel:"", firstName:"", lastName:"", agree:false, email:"", tel:{areaCode:"", number:""}, comments:"" };
    $scope.channels = [ {value:"tel", label:"Tel."}, {value:"Email", label:"Email"} ];
    $scope.invalidChannelSelection = false;
  }])

  .controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope, feedbackFactory) {
    $scope.sendFeedback = function() {
      if ($scope.feedback.agree && (!$scope.feedback.mychannel || $scope.feedback.mychannel === "")) {
        $scope.invalidChannelSelection = true;
      }
      else {
        feedbackFactory.getFeedbacks().save(
          $scope.feedback,
          function success() {
            $scope.invalidChannelSelection = false;
            $scope.feedback.mychannel="";
            $scope.feedback.firstName="";
            $scope.feedback.lastName="";
            $scope.feedback.agree=false;
            $scope.feedback.email="";
            $scope.feedback.tel.areaCode="";
            $scope.feedback.tel.number="";
            $scope.feedback.comments="";

            $scope.$watch('feedbackForm', function(feedbackForm) {
              if(feedbackForm) {
                $scope.feedbackForm.$setPristine();
              }
            });
          },
          function error(response) {
            window.alert("Can't access server");
            console.log("Error: " + response.status + " " + response.statusText);
          }
        );
      }
    };

    $scope.updateChannel = function() {
      if ($scope.feedback.agree && (!$scope.feedback.mychannel || $scope.feedback.mychannel === "")) {
        $scope.invalidChannelSelection = true;
      }
      else {
        $scope.invalidChannelSelection = false;
      }
    };
  }])

  .controller('DishDetailController', ['$scope', '$stateParams', 'menuFactory', 'baseURL',
      function($scope, $stateParams, menuFactory, baseURL) {
    $scope.baseURL = baseURL;

    $scope.showDish = false;
    $scope.message="Loading ...";

    $scope.dish = {};
    menuFactory.getDishes().get({id:parseInt($stateParams.id, 10)})
      .$promise.then(
        function(response) {
          $scope.dish = response;
          $scope.showDish = true;
        },
        function(response) {
          $scope.message = "Error: " + response.status + " " + response.statusText;
        });
  }])

  .controller('DishCommentController', ['$scope', 'menuFactory', function($scope, menuFactory) {
    $scope.comment = {rating:5, comment:"", author:"", date:""};
    $scope.ratings = [1, 2, 3, 4, 5];

    $scope.submitComment = function () {
        $scope.comment.date = new Date().toISOString();

        $scope.dish.comments.push(angular.copy($scope.comment));
        menuFactory.getDishes().update({id:$scope.dish.id}, $scope.dish);

        $scope.commentForm.$setPristine();

        $scope.comment.rating = 5;
        $scope.comment.comment = "";
        $scope.comment.author = "";
        $scope.comment.date = "";
    };
  }])

  .controller('IndexController', ['$scope', 'menuFactory', 'corporateFactory', 'baseURL',
      function($scope, menuFactory, corporateFactory, baseURL) {
    $scope.baseURL = baseURL;

    $scope.showDish = false;
    $scope.showPromotion = false;
    $scope.showLeader = false;
    $scope.message="Loading ...";

    $scope.dish = {};
    menuFactory.getDishes().get({id:0})
      .$promise.then(
        function(response) {
          $scope.dish = response;
          $scope.showDish = true;
        },
        function(response) {
          $scope.message = "Error: " + response.status + " " + response.statusText;
        });
    $scope.promotion = {};
    menuFactory.getPromotions().get({id:0})
      .$promise.then(
        function(response) {
          $scope.promotion = response;
          $scope.showPromotion = true;
        },
        function(response) {
          $scope.message = "Error: " + response.status + " " + response.statusText;
        });
    $scope.executiveChef = {};
    corporateFactory.getLeaders().get({id:3})
      .$promise.then(
        function(response) {
          $scope.executiveChef = response;
          $scope.showLeader = true;
        },
        function(response) {
          $scope.message = "Error: " + response.status + " " + response.statusText;
        });
  }])

  .controller('AboutController', ['$scope', 'corporateFactory', 'baseURL',
      function($scope, corporateFactory, baseURL) {
    $scope.baseURL = baseURL;

    $scope.showLeaders = false;
    $scope.message="Loading ...";

    $scope.leaders = [];
    corporateFactory.getLeaders().query(
      function(response) {
        $scope.leaders = response;
        $scope.showLeaders = true;
      },
      function(response) {
        $scope.message = "Error: " + response.status + " " + response.statusText;
      });
  }])

;
