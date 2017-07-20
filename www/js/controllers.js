'use strict';

angular.module('conFusion.controllers', [])

  .filter('favoriteFilter', function() {
    return function(dishes, favorites) {
      var out = [];
      for(var i = 0; i < favorites.length; i++) {
        for(var j =0; j < dishes.length; j++) {
          if(dishes[j].id === favorites[i].id) out.push(dishes[j]);
        }
      }
      return out;
    }
  })

  .controller('AppCtrl', function($scope, $timeout, $localStorage,
      $ionicModal, $ionicPlatform, $cordovaCamera, $cordovaImagePicker) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.$on('modal.shown', function(event, modal) {
      console.log('Modal ' + modal.id + ' is shown');
    });
    $scope.$on('modal.hidden', function(event, modal) {
      console.log('Modal ' + modal.id + ' is hidden');
    });
    $scope.$on('$destroy', function(event, modal) {
      console.log('Destroying Modals');
      $scope.loginModal.remove();
      $scope.reserveModal.remove();
    });


    // Form data for the login modal
    $scope.loginData = $localStorage.getObject('userinfo', '{}');

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      id: 'login',
      scope: $scope
    }).then(function(modal) {
      $scope.loginModal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.loginModal.hide();
    };

    // Open the login modal
    $scope.openLogin = function() {
      $scope.loginModal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);
      $localStorage.storeObject('userinfo', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeLogin();
      }, 1000);
    };


    // form data for the reservation modal
    $scope.reservation = {};

    // Create the reservation modal that we will use later
    $ionicModal.fromTemplateUrl('templates/reserve.html', {
      id: 'reserve',
      scope: $scope
    }).then(function(modal) {
      $scope.reserveModal = modal;
    });

    // Triggered in the reservation modal to close it
    $scope.closeReserve = function() {
      $scope.reserveModal.hide();
    };

    // Open the reservation modal
    $scope.openReserve = function() {
      $scope.reserveModal.show();
    };

    // Perform the reserve action when the user submits the reservation form
    $scope.doReserve = function() {
      console.log('Doing reservation', $scope.reservation);

      // Simulate a reservation delay. Remove this and replace with your reservation
      // code if using a server system
      $timeout(function() {
        $scope.closeReserve();
      }, 1000);
    };


    // registration
    $scope.registration = {};

    // create the registration modal that we will use later
    $ionicModal.fromTemplateUrl('templates/register.html', {
      id: 'registration',
      scope: $scope
    }).then(function(modal) {
      $scope.registerModal = modal;
    });

    // Triggered in the registration modal to close it
    $scope.closeRegister = function() {
      $scope.registerModal.hide();
    };

    // Open the registration modal
    $scope.openRegister = function() {
      $scope.registerModal.show();
    };

    // Perform the registration action when the user submits the registration form
    $scope.doRegister = function() {
      // simulate a registration delay.
      // Remove this and replace with your registration code.
      $timeout(function() {
        $scope.closeRegister();
      }, 1000);
    };

    // use the camera to take a picture at registration
    $ionicPlatform.ready(function() {
      $scope.takePicture = function() {
        var options = {
          quality: 50,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 100,
          targetHeight: 100,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
          $scope.registration.imgSrc = "data:image/jpeg;base64," + imageData;
        }, function(err) {
          console.log(err);
        });
      };

      $scope.gallery = function() {
        var options = {
          maximumImagesCount: 1,
          width: 100,
          height: 100,
          quality: 50
        };

        $cordovaImagePicker.getPictures(options).then(function(results) {
          $scope.registration.imgSrc = results[0];
        }, function(err) {
          console.log(err);
        });
      };
    });
  })

  .controller('HeaderController', ['$scope', '$state', function($scope, $state) {
    $scope.isActive = function (viewLocation) {
      if ($state.current.name === 'app.dishdetails') {
        return viewLocation === 'app.menu';
      }
      return $state.current.name === viewLocation;
    };
  }])

  .controller('MenuController', [
      '$scope', 'dishes', 'baseURL',
      'menuFactory', 'favoriteFactory',
      '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast',
      function(
        $scope, dishes, baseURL,
        menuFactory, favoriteFactory,
        $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {
    $scope.baseURL = baseURL;

    $scope.showMenu = false;
    $scope.message = "Loading ...";

    $scope.dishes = dishes;

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

    // add favorite
    $scope.addFavorite = function(index) {
      favoriteFactory.addToFavorites(index);
      $ionicPlatform.ready(function() {
        $cordovaLocalNotification.schedule({
          id: 1,
          title: "Added Favorite",
          text: $scope.dishes[index].name
        }).then(function() {
          console.log('Added favorite ' + $scope.dishes[index].name);
        }, function() {
          console.log('Failed to add notification');
        });

        $cordovaToast.show('Added favorite ' + $scope.dishes[index].name, 'long', 'center')
          .then(function(success) {
            console.log('Diplay toast');
          }, function(error) {
            console.log('Failed to diplay toast');
          });
      });
      $ionicListDelegate.closeOptionButtons();
    }
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

  .controller('DishDetailController', [
      '$scope', 'dish', 'baseURL',
      'favoriteFactory',
      '$ionicPopover', '$ionicModal', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast',
      function($scope, dish, baseURL, favoriteFactory,
        $ionicPopover, $ionicModal, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {
    $scope.baseURL = baseURL;

    $scope.dish = dish;

    // popover, open a menu to add favorite or show comment modal
    $scope.popover = {};
    $ionicPopover.fromTemplateUrl('templates/dish-detail-popover.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });
    $scope.$on('$destroy', function() {
      $scope.popover.remove();
    });

    $scope.toggleMenu = function($event) {
      $scope.popover.show($event);
    };

    $scope.addToFavorites = function() {
      favoriteFactory.addToFavorites($scope.dish.id);
      $scope.popover.hide();

      $ionicPlatform.ready(function() {
        $cordovaLocalNotification.schedule({
          id: 1,
          title: "Added Favorite",
          text: $scope.dish.name
        }).then(function() {
          console.log('Added favorite ' + $scope.dish.name);
        }, function() {
          console.log('Failed to add notification');
        });

        $cordovaToast.show('Added Favorite ' + $scope.dish.name, 'long', 'bottom')
          .then(function(success) {
            console.log('Diplay toast');
          }, function(error) {
            console.log('Failed to diplay toast');
          });
      });
    };

    // comment modal
    $scope.comment = {rating:5, comment:"", author:"", date:""};
    $scope.ratings = [1, 2, 3, 4, 5];

    $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
      id: 'comment',
      scope: $scope
    }).then(function(modal) {
      $scope.commentModal = modal;
    });

    $scope.openComment = function() {
      $scope.comment = {rating:5, comment:"", author:"", date:""};
      $scope.commentModal.show();
    };

    $scope.closeComment = function() {
      $scope.popover.hide();
      $scope.commentModal.hide();
    };

    $scope.submitComment = function () {
        $scope.comment.date = new Date().toISOString();

        $scope.dish.comments.push(angular.copy($scope.comment));
        menuFactory.update({id:$scope.dish.id}, $scope.dish);

        $scope.popover.hide();
        $scope.commentModal.hide();
    };

    $scope.$on('$destroy', function(event, modal) {
      $scope.commentModal.remove();
    });
  }])

  .controller('DishCommentController', ['$scope', 'menuFactory',
      function($scope, menuFactory) {
    $scope.comment = {rating:5, comment:"", author:"", date:""};
    $scope.ratings = [1, 2, 3, 4, 5];

    $scope.submitComment = function () {
        $scope.comment.date = new Date().toISOString();

        $scope.dish.comments.push(angular.copy($scope.comment));
        menuFactory.update({id:$scope.dish.id}, $scope.dish);

        $scope.commentForm.$setPristine();

        $scope.comment.rating = 5;
        $scope.comment.comment = "";
        $scope.comment.author = "";
        $scope.comment.date = "";
    };
  }])

  .controller('IndexController', ['$scope', 'dish', 'promotion', 'leader', 'baseURL',
      function($scope, dish, promotion, leader, baseURL) {
    $scope.baseURL = baseURL;

    $scope.dish = dish;
    $scope.promotion = promotion;
    $scope.executiveChef = leader;
  }])

  .controller('AboutController', ['$scope', 'leaders', 'baseURL',
      function($scope, leaders, baseURL) {
    $scope.baseURL = baseURL;

    $scope.leaders = leaders;
  }])

  .controller('FavoritesController', [
      '$scope', 'dishes', 'favorites', 'baseURL',
      'favoriteFactory',
      '$ionicListDelegate', '$ionicPopup', '$ionicLoading', '$timeout', '$ionicPlatform', '$cordovaVibration',
      function($scope, dishes, favorites, baseURL,
               favoriteFactory,
               $ionicListDelegate, $ionicPopup, $ionicLoading, $timeout, $ionicPlatform, $cordovaVibration) {
    $scope.baseURL = baseURL;
    $scope.shouldShowDelete = false;

    $scope.favorites = favorites;
    $scope.dishes = dishes;

    $scope.toggleDelete = function() {
      $scope.shouldShowDelete = !$scope.shouldShowDelete;
    };

    $scope.deleteFavorite = function(index) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Confirm Delete',
        template: 'Are you sure you want to delete this item?'
      });
      confirmPopup.then(function(res) {
        if(res) {
          favoriteFactory.deleteFromFavorites(index);
          $ionicPlatform.ready(function () {
            $cordovaVibration.vibrate(100);
          });
        }
      })

      $scope.shouldShowDelete = false;
    };
  }])
;
