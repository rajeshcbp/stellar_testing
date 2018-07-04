var app = angular.module('index', ['config', 'ngCookies', 'ui-notification'])

var baseAddress = config_module._invokeQueue[0][2][1].LOGIN_URL;
var url = "";

app.factory('indexFactory', function ($http, $window) {
    return {
        getGdexProducts: function () {
            url = baseAddress + "GetGdexProducts";
            return $http.get(url);
        },
        getGdexCurrencies: function () {
            url = baseAddress + "GetGdexCurrencies";
            return $http.get(url);
        },
        createNewAccount: function (userData) {
            url = baseAddress + "CreateNewAccount";
            return $http.post(url, userData);
        },
        checkPhone: function (phone) {
            console.log("phone", phone);
            //console.log("laName", laName);
            url = baseAddress + "CheckPhone/" + phone;
            return $http.get(url);
        },
        checkEmail: function (email) {
            console.log("email", email);
            //console.log("laName", laName);
            url = baseAddress + "CheckEmail/" + email;
            return $http.get(url);
        },
        getAllAccountsList: function () {
            url = baseAddress + "GetAllAccountsList";
            return $http.get(url);
        },
        getAccountBalance: function (key) {
            url = baseAddress + "GetAccountBalance/" + key;
            return $http.get(url);
        },
        sendTransaction: function (transDatas) {
            url = baseAddress + "TransactionSend";
            return $http.post(url, transDatas);
        }
    };
});
app.factory("SharedObject", function () {
    return {
        recordsCount: 0,
        editItemNumber: 0,
        pageNum: 1,
        insertMode: false,
        reset: function () {
            //this.recordsCount=0;
            this.editItemNumber = 0;
            this.pageNum = 1;
            this.insertMode = false;
        }
    };
});
app.filter('paging', ["SharedObject", function (SharedObject) {
    return function (input, pSize) {
        SharedObject.recordsCount = (input && input.length) ? input.length : 0;
        if (input) {
            var size = parseInt(pSize, 10),
                pageNum = SharedObject.pageNum;
            if (input.length <= size)
                return input;
            var classes = [];
            for (var i = 0; i < input.length; i++) {
                if (i < size * (pageNum - 1)) continue;
                if (i >= size * (pageNum - 1) + size) break;
                else classes.push(input[i]);
            }
            return classes;
        } else return null;
    }
}]);

app.controller('indexController', function ($scope, $http, indexFactory, SharedObject, $cookies, $cookieStore, $window, $location, Notification) {
    $scope.pageSize = 20;
    $scope.localObject = SharedObject;

    //get all accounts
    $scope.getAdmin = function () {
        indexFactory.getAllAccountsList().success(function (resultData1) {
            console.log("resultData1==", resultData1);
            $scope.accounts = resultData1;
        })

        indexFactory.getGdexProducts().success(function (resultData2) {
            console.log("resultData2==", resultData2);
            $scope.gdxProducts = resultData2;
        })

        indexFactory.getGdexCurrencies().success(function (resultData3) {
            console.log("resultData3==", resultData3);
            $scope.gdxCurrencies = resultData3;
        })


        $http.get("https://api.coinmarketcap.com/v2/ticker/512/?convert=XLM")
        .success(function(response1) {
          $scope.xlm = response1;
          console.log("XML data", $scope.xlm);
        })
        .error(function(response1) {
          $scope.message = "Error!!";
        });

        $http.get("https://api.coinmarketcap.com/v2/ticker/1/?convert=BTC")
        .success(function(response2) {
          $scope.btc = response2;
          console.log("BTC data", $scope.btc);
        })
        .error(function(response2) {
          $scope.message = "Error!!";
        });

        $http.get("https://api.coinmarketcap.com/v2/ticker/1027/?convert=ETH")
        .success(function(response3) {
          $scope.eth = response3;
          console.log("ETH data", $scope.eth);
        })
        .error(function(response3) {
          $scope.message = "Error!!";
        });

        $http.get("https://api.coinmarketcap.com/v2/ticker/1831/?convert=BCH")
        .success(function(response4) {
          $scope.bch = response4;
          console.log("BCH data", $scope.bch);
        })
        .error(function(response4) {
          $scope.message = "Error!!";
        });

        $http.get("https://api.coinmarketcap.com/v2/ticker/2/?convert=LTC")
        .success(function(response5) {
          $scope.ltc = response5;
          console.log("LTC data", $scope.ltc);
        })
        .error(function(response5) {
          $scope.message = "Error!!";
        });
        
    }
    $scope.getAdmin();

    // Window refresh
    $scope.refresh = function () {
        $window.location.reload();
        // window.location.href = "/";
    };

    $scope.userEmailfoundlength = null;
    $scope.userPhonefoundlength = null;
     //Check user email
     $scope.emailCheck = function (email) {
        console.log("email", email);
        //console.log("laName", laName);
        indexFactory.checkEmail(email).success(function (data) {
            //console.log("Response==", data);
            //Notification.success(' Success ');
            $scope.userEmailfound = data;
            console.log("$scope.userEmailfound==", $scope.userEmailfound);
            $scope.userEmailfoundlength = $scope.userEmailfound.length;
            console.log("$scope.userEmailfoundlength==", $scope.userEmailfoundlength);
        })

    }

     //Check user phone
     $scope.phoneCheck = function (phone) {
        console.log("phone", phone);
        //console.log("laName", laName);
        indexFactory.checkPhone(phone).success(function (data) {
            //console.log("Response==", data);
            //Notification.success(' Success ');
            $scope.userPhonefound = data;
            console.log("$scope.userPhonefound==", $scope.userPhonefound);
            $scope.userPhonefoundlength = $scope.userPhonefound.length;
            console.log("$scope.userPhonefoundlength==", $scope.userPhonefoundlength);

        })

    }

    // Create an account
    $scope.create = function () {
        $scope.userData = this.user;
        console.log("$scope.userData =", $scope.userData);
        indexFactory.createNewAccount($scope.userData).success(function (data) {
            if (data) {
                $window.location.reload();
            } else {

                console.log("errorMessage =", $scope.errorMessage);
            }
        }).error(function (data) {
            Notification.error({
                message: userData.name + ' ' + ',userProfile Adding Failed ',
                delay: 1000
            });
            //$scope.error = "An Error has occured while Adding userProfile! " + data.ExceptionMessage;
        });
        //End of signup api invoke    
    };

    // request an account
    $scope.request = function (key) {
        $scope.pubKey = key;
		console.log("$scope.pubKey ", $scope.pubKey);
        indexFactory.getAccountBalance($scope.pubKey).success(function (data) {
            if (data) {
                $window.location.reload();
            } else {

                console.log("errorMessage =", $scope.errorMessage);
            }
        }).error(function (data) {
            Notification.error({
                message: userData.name + ' ' + ',userProfile Adding Failed ',
                delay: 1000
            });
            //$scope.error = "An Error has occured while Adding userProfile! " + data.ExceptionMessage;
        });
        //End of signup api invoke    
    };

    // request an account
    $scope.showBalance = function (key) {
        $scope.pubKey = key;
		console.log("$scope.pubKey ", $scope.pubKey);
        indexFactory.getAccountBalance($scope.pubKey).success(function (data) {
            if (data) {
                $scope.myAccountDetails = data;
                console.log("$scope.myAccountDetails ", $scope.myAccountDetails);
            } else {

                console.log("errorMessage =", $scope.errorMessage);
            }
        }).error(function (data) {
            Notification.error({
                message: userData.name + ' ' + ',userProfile Adding Failed ',
                delay: 1000
            });
            //$scope.error = "An Error has occured while Adding userProfile! " + data.ExceptionMessage;
        });
        //End of signup api invoke    
    };

    $scope.sendFromKey = function (fedId, fromPKey, fromSKey) {
        $scope.fid = fedId;
        console.log("fid==", $scope.fid);
        $scope.fromPublicKey = fromPKey;
        console.log("fromPublicKey==", $scope.fromPublicKey);
        $scope.fromSecretKey = fromSKey;
        console.log("fromSecretKey==", $scope.fromSecretKey);
    };

    $scope.transaction = function () {
        $scope.transData = this.trans;
        console.log("transData==", $scope.transData);
        indexFactory.sendTransaction($scope.transData).success(function (data) {
            if (data.message == "SUCCESS") {
                $window.location.reload();
            } else {

                console.log("errorMessage =", $scope.errorMessage);
            }
        }).error(function (data) {
            Notification.error({
                message: userData.name + ' ' + ',userProfile Adding Failed ',
                delay: 1000
            });
            //$scope.error = "An Error has occured while Adding userProfile! " + data.ExceptionMessage;
        });
        //End of signup api invoke 
       
    };
    //===============================================================Pangination===========================================================================================   

    $scope.TotalPages = function () {
        var size = parseInt($scope.pageSize, 10);
        if (size > $scope.localObject.recordsCount) return 1;
        else
            return $scope.localObject.recordsCount % size === 0 ?
                $scope.localObject.recordsCount / size :
                Math.floor($scope.localObject.recordsCount / size) + 1;
    };
    $scope.NavFirst = function () {
        var pageNum = $scope.localObject.pageNum;
        var paglst = $scope.localObject.recordsCount / $scope.pageSize;

        pageNum = $scope.localObject.recordsCount > ($scope.pageSize * pageNum) ? pageNum + (paglst - 1) : pageNum;

        if (pageNum > 1) {
            pageNum = pageNum > 2 ? 1 : pageNum - 1;

        }

        $scope.localObject.reset();
        $scope.localObject.pageNum = pageNum;
    };

    $scope.NavPrev = function () {
        var pageNum = $scope.localObject.pageNum;
        pageNum = pageNum < 2 ? 1 : pageNum - 1;
        $scope.localObject.reset();
        $scope.localObject.pageNum = pageNum;
    };
    $scope.NavNext = function () {
        var pageNum = $scope.localObject.pageNum;
        pageNum = $scope.localObject.recordsCount > ($scope.pageSize * pageNum) ? pageNum + 1 : pageNum;
        $scope.localObject.reset();
        $scope.localObject.pageNum = pageNum;
    };

    $scope.NavLast = function () {
        var pageNum = $scope.localObject.pageNum;
        var paglst = Math.round($scope.localObject.recordsCount / $scope.pageSize) - pageNum;
        pageNum = $scope.localObject.recordsCount > ($scope.pageSize * pageNum) ? pageNum + (paglst) : pageNum;
        $scope.localObject.reset();
        $scope.localObject.pageNum = pageNum;
    };


    //==========================================================================================================================================================   


})