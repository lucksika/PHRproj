angular.module('RDash')
.factory('currentUser', function (){
    return {
        userid: "lucksika",
        appid: "display01"
    }
})
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
    this.createObjforTable = function(tableObj){
        var arr = []
        for(var key in tableObj){
            var obj = {}
            obj.date = FormatDateFactory.formatDateTable(new Date(key))

            var data = tableObj[key].split(',') //[value, limit]
            obj.value = data[0]

            var ol = parseFloat(data[0]) - parseFloat(data[1])
            if(ol > 0){
                obj.overlimit = "over: " + ol.toFixed(2);
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
                            obj.text = "" + legend + ": " + realData[index] + " g"
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