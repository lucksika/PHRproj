angular.module('RDash')
.factory('currentUser', function (){
    var _userID
    var _appID = "PHRapp"
    return {
        setUserID: function(userID){
            console.log("userID: ", userID)
            _userID = userID
            console.log("_userID: ", _userID)
        },
        getUserID: function(){
            return _userID
        },
        getAppID: function(){
            return _appID
        }
        
    }
})
.factory('AuthenticationService',
    ['Base64', '$http', '$cookieStore', '$rootScope', '$timeout', 'currentUser',
    function (Base64, $http, $cookieStore, $rootScope, $timeout, currentUser) {
        var service = {};
        var _status = false
        service.setStatus = function(status){
            _status = status
        }

        service.Login = function (username, password, callback) {
            response = { success: username === 'test' && password === 'test' };
            /* Dummy authentication for testing, uses $timeout to simulate api call
             ----------------------------------------------*/
            $timeout(function () {
                if (!response.success) {
                    response.message = 'Username or password is incorrect';
                }
                callback(response);
            }, 1000);


            /* Use this for real authentication
             ----------------------------------------------*/
            //$http.post('/api/authenticate', { username: username, password: password })
            //    .success(function (response) {
            //        callback(response);
            //    });

        };

        service.SetCredentials = function (userID) {
            var authdata = Base64.encode(userID);
            currentUser.setUserID(userID)
            $rootScope.globals = {
                currentUser: {
                    username: username,
                    authdata: authdata
                }
            };

            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        };

        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        };

        service.isAuthenticated = function () {
            return _status
        }

        return service;
    }])

.factory('Base64', function () {
    /* jshint ignore:start */

    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };

    /* jshint ignore:end */
})
.run(["$rootScope", "$state", "AuthenticationService", "$window",
    function($rootScope, $state, AuthenticationService, $window){
    $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
        // check state of authentication
        console.log("isAuthenticated : ", AuthenticationService.isAuthenticated())
        if (toState.authenticate && !AuthenticationService.isAuthenticated()){
            console.log("check authen")
            // User isn’t authenticated
            $state.transitionTo("login");
            event.preventDefault();
            return ;
        }
    });

    // $rootScope.user = {};

    // Executed when the SDK is loaded

   $window.fbAsyncInit = function() {
    // Executed when the SDK is loaded

        FB.init({
          appId: '1456182307766249',
          channelUrl: 'app/channel.html',
          status: true,
          cookie: true,
          xfbml: true
        });

        // srvAuth.watchLoginChange();

    };

    (function(d){
    // load the Facebook javascript SDK
        var js,
        id = 'facebook-jssdk',
        ref = d.getElementsByTagName('script')[0];

        if (d.getElementById(id)) {
          return;
        }

        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";

        ref.parentNode.insertBefore(js, ref);

    }(document, 'script', 'facebook-jssdk' ));

}])
.factory('ResourceFactory', ['$resource', function ($resource) {
    var host = 'localhost'
	return {
		nutrientMeal: function(){
			return $resource('http://'+ host +':5000/nutrient/meal');
		},
		nutrientMealProgress: function(){
			return $resource('http://'+ host +':5000/nutrient/chart/progress');
		},
        nutrientMealLineChart: function(){
            return $resource('http://'+ host +':5000/nutrient/chart/points');
        },
        nutrientImage: function(){
            return $resource('http://127.0.0.1:5000/nutrient/chart/image');
        },
		labresultInfo: function(){
			return $resource('http://'+ host +':5000/result/info');
		},
		labresultImage: function(){
			return $resource('http://127.0.0.1:5000/result/chart/image');
		},
		labresultChartPoint: function(){
			return $resource('http://'+ host +':5000/result/chart/points');
		},
        exercise: function(){
            return $resource('http://'+ host +':5000/exercise/info');
        },
        appointment: function(){
            return $resource('http://'+ host +':5000/appointment/info');
        },
        profile: function(){
            return $resource('http://'+ host +':5000/profile/info');
        },
        medicine: function(){
            return $resource('http://'+ host +':5000/medicine/info');
        },
        medicineList: function(){
            return $resource('http://'+ host +':5000/medicine/list');
        }
	}
}])
.factory('FormatDateFactory', function (){
	return {
		formatDate: function(dateObj){
		    return moment(dateObj).format('YYYY-MM-DD');
		},
        formatDateTable: function(dateObj){
            return moment(dateObj).format('DD MMMM YYYY');
        },
        formatDateGraph: function(dateObj){
            return moment(dateObj).format('MMM DD, YY');  
        }
	}
})
.service('modalProvider', ['$uibModal', function ($uibModal){
	var modalInstance
	this.openModal = function(type){
		
		var template = {
			"inputForm": {
				"controller": "InputFormCtrl",
				"template": "templates/input_modal.html"
			},
			"dashboardCustom": {
				"controller": "DashboardCustomCtrl",
				"template": "templates/dashboardCustomModal.html"
			}
		}
		modalInstance = $uibModal.open({
	          	templateUrl: template[type].template,
	          	controller: template[type].controller
	    });	    

	}
	this.closeModal = function(){
		modalInstance.dismiss()
	}
}])
.service('medicineService', ['ResourceFactory', function(ResourceFactory) {
    var medicineList 
    this.initialMedicineList = function(msg) {
        console.log("initialMedicineList ")
        var medicineResource = ResourceFactory.medicineList()
        var list = medicineResource.get(function (){
            console.log("list.med_list ", list.list)
            medicineList = list.list
        });
    }
    this.getMedicineList = function(){
        return medicineList
    }
}])
.factory('broadcastService', ['$rootScope', function($rootScope) {
    return {
        send: function(msg) {
        	console.log("send msg : " , msg)
            $rootScope.$broadcast(msg);
        }
    }
}])
.service('generateExerciseColorandOptionChart', function(){
    var mock = {
            "walking": "step",
            "running": "step",
            "squeeze ball": "time"
        }
    var generateOptionList = function(title){
        return  {
            scales: {
                yAxes: [{
                    scaleLabel: {
                    display: true,
                    labelString: 'Value ( ' + mock[title] + ' )'
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                    display: true,
                    labelString: 'Date'
                    }
                }]
            }
        }
    }

    this.generateColorandOptionList = function(lists){
        var colors = {}
        var options = {}
        var attr = []
        var green = '#9CCC65'
        var yellow = '#FFF59D'
        
        
        lists.forEach(function(list){
            color = []
            options[list.title] = generateOptionList(list.title)
            list.points.forEach(function(p){
                if(p >= list.goal[0]){
                    color.push(green)
                }else{
                    color.push(yellow)
                }
            })
            colors[list.title] = color
        })
        
        attr.push(colors)
        attr.push(options)

        return attr

    }
})
.service('generateObjectForTableService', ['FormatDateFactory', function(FormatDateFactory){
    this.createObjforTable = function(prefix ,tableObj){
        var arr = []
        for(var key in tableObj){
            var obj = {}
            obj.date = FormatDateFactory.formatDateTable(new Date(key))

            var data = tableObj[key].split(',') //[value, limit]
            obj.value = data[0]

            var ol = parseFloat(data[0]) - parseFloat(data[1])
            if(prefix == "under"){
                ol = ol * -1
            }
            if(ol > 0){
                obj.overlimit = prefix + ": " + ol.toFixed(2);
            }else{
                obj.overlimit = "-"; 
            }
            arr.push(obj)

        }
        return arr
    } 
}])
.service('NutrientPieChartService', function(){
	this.generatePieChartAttr = function(meal, obj){
		var colours = [
            "#F98074", //sodium           
            "#F4C869", //cal
            "#CC6875", //carbohydrate
          	"#01CD9C", //fat
            "#E8AA14", //phosphorus
            "#01808C", //potassium
            "#013051", //protein
            "#0E7C7B",
            "#D9D4D1",          
            "#DBA9FF",
            "#78EABB"]
		var minimunRatio = 5

        var nutrientList = obj.data.nutrient
        var legendLabel = []
        var realData = []
        for(var key in nutrientList) {
            legendLabel.push(key)
            realData.push(obj.data.nutrient[key]);
        }
		// var realData = Object.values()
  //       var legendLabel = Object.keys(obj.data.nutrient)  
        var attr = {}
        attr.labels = legendLabel
        attr.data = realData.map(function(d){ return d < minimunRatio ? minimunRatio : d})
        attr.colours = colours
        attr.options = {
            title: {
                display: true, 
                text: meal,
                fontSize: 20
            },
            tooltips: {
                bodyFontSize: 18,
                mode: 'index',
                bodySpacing: 10,
                callbacks: {
                    label: function(tooltipItem, data) {
                        var datasetLabel = data.labels[tooltipItem.index] || '';
                        var dataLabel = realData[tooltipItem.index]
                        return " " + datasetLabel + ' : ' + dataLabel;
                    }
                }
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    fontSize: 12,
                    boxWidth: 8,
                    generateLabels: function(chart){
                        var data = legendLabel.map(function(legend, index){
                            var obj = {}
                            var unit = 'g'
                            if(legend == 'calories'){
                                unit = 'KCal'
                            }
                            obj.text = "" + legend + ": " + realData[index] + " " + unit
                            obj.fillStyle = colours[index]
                            
                            return obj
                        })
                        console.log(data)
                        return data
                    }
                }
            }
        }
        return attr
	}
})
.service('currentDashbordWidgetService', ['broadcastService', function(broadcastService){
	var widgetsKey = {
        "medicine": true,
        "water": false, 
        "appointment": true,
        "nutrientMeal": true,
        "nutrientProgress": true,
        "overlimit": false      
    }

    var widgetsTemplateUrl = {
    	"water": '../templates/widgets/water.html', 
        "nutrientProgress": '../templates/widgets/nutrientProgress.html',
        "appointment": '../templates/widgets/appointment.html',
        "nutrientMeal": '../templates/widgets/nutrientMeal.html',
        "medicine": '../templates/widgets/medicine.html',
        "overlimit": '../templates/widgets/resultsOverlimit.html'
    }
    
	this.getCurrentWidgets = function(){
		var widgets = Object.keys(widgetsKey)
		.filter(function(key) {return widgetsKey[key]})
		.map(function(key, index){
			return widgetsTemplateUrl[key]
		})
		return widgets
	}
	this.getCurrentWidgetsKeys = function(){
		return widgetsKey
	}
	this.updateCurrentWidgets = function(_widgetsKey){
		widgetsKey = _widgetsKey
		broadcastService.send("update: widgets");
	}
}])
.service('EventService', function(){
    this.monthList = [
        {id: 1, title: 'January', ref: '01'},
        {id: 2, title: 'Febuary', ref: '02'},
        {id: 3, title: 'March', ref: '03'},
        {id: 4, title: 'April', ref: '04'},
        {id: 5, title: 'May', ref: '05'},
        {id: 6, title: 'June', ref: '06'},
        {id: 7, title: 'July', ref: '07'},
        {id: 8, title: 'August', ref: '08'},
        {id: 9, title: 'September', ref: '09'},
        {id: 10, title: 'October', ref: '10'},
        {id: 11, title: 'November', ref: '11'},
        {id: 12, title: 'December', ref: '12'},
    ]
    var assignIcon = function(date){
        var today = moment(new Date()).format('YYYY-MM-DD')
        var iconStyle = [];
        if(date > today){
            iconStyle.push('warning')
            iconStyle.push('glyphicon glyphicon-chevron-up')
            return iconStyle
        }else if(date == today){
            iconStyle.push('success')
            iconStyle.push('glyphicon glyphicon-minus')
            return iconStyle
        }else{
            iconStyle.push('default')
            iconStyle.push('glyphicon glyphicon-chevron-down')
            return iconStyle
        }
    }

    this.createEventsObject = function(string, type){
        var obj = {}
        var description = JSON.parse(string.description)
        obj['date'] = moment(string.date).format('D MMM YYYY'); 
        obj['title'] = description.title
        obj['content'] = description.place + ' ( ' + description.time + ' )'
        obj['note'] = description.note
        
        if(type == 'page'){
            var iconStyle = assignIcon(string.date)
            obj['date'] = moment(string.date).format('D MMMM YYYY'); 
            obj['badgeClass'] = iconStyle[0]
            obj['badgeIconClass'] = iconStyle[1]
        }
        
        return obj
    }
})