/**
 * Master Controller
 */

 angular.module('RDash')
 .controller('MasterCtrl', ['$scope', '$cookieStore', '$location', MasterCtrl])
 .controller('TimelineCtrl', ['$scope', 'EventService', 'ResourceFactory', 'currentUser', TimelineCtrl])
 .controller('UpcomingEventWidgetCtrl', ['$scope','EventService', 'ResourceFactory', 'currentUser', UpcomingEventWidgetCtrl])
 .controller('ScheduleCtrl', ['$scope', ScheduleCtrl])
 .controller('DashboardCtrl', ['$scope', 'modalProvider', 'currentDashbordWidgetService', DashboardCtrl])
 .controller('DashboardCustomCtrl', ['$scope', 'modalProvider','currentDashbordWidgetService', DashboardCustomCtrl])
 .controller('ProfileCtrl', ['$scope', 'ResourceFactory', 'currentUser', ProfileCtrl])
 .controller('InputFormCtrl', ['$scope', 'ResourceFactory' ,'modalProvider', 'currentUser', InputFormCtrl]);


 function MasterCtrl($scope, $cookieStore, $location) {
    /**
     * Sidebar Toggle & Cookie Control
     */
     $scope.path = $location.path().substring(1);
     var mobileView = 992;

     currentWidth = window.innerWidth;

     $scope.getWidth = function() {
        return window.innerWidth;
    };


    /**
     * Handle Toggle Sidebar 
     */
     $scope.$watch($scope.getWidth, function(newValue, oldValue) {
        if (newValue >= mobileView) {
            if (angular.isDefined($cookieStore.get('toggle'))) {
                $scope.toggle = ! $cookieStore.get('toggle') ? false : true;
            } else {
                $scope.toggle = true;
            }
        } else {
            $scope.toggle = false;
        }

    });

     $scope.toggleSidebar = function() {
        $scope.toggle = !$scope.toggle;
        $cookieStore.put('toggle', $scope.toggle);
    };


    window.onresize = function() {
        $scope.$apply();
    };
}
function DashboardCtrl($scope, modalProvider, currentDashbordWidgetService) {

    $scope.today = new Date()
    $scope.currentWidgets = currentDashbordWidgetService.getCurrentWidgets()
    $scope.openModal = function(type) {
       modalProvider.openModal(type)
    }
    $scope.$on("update: widgets", function(){
        $scope.currentWidgets = currentDashbordWidgetService.getCurrentWidgets()
    })

}

function DashboardCustomCtrl($scope, modalProvider, currentDashbordWidgetService){    
    var max = 4
    var closeModal = function(){
        modalProvider.closeModal()
    }
    $scope.check = angular.copy(currentDashbordWidgetService.getCurrentWidgetsKeys())
    $scope.closeModal = closeModal
    var countChecked = function(){
        var cnt = 0
        Object.values($scope.check).filter(function(val){
            cnt += val ? 1 : 0
        })
        return cnt
    }

    $scope.amount = max - countChecked()
    
    $scope.shouldDisable = function(item){
        return !($scope.amount || item)
    }

    $scope.countAmount = function(){
        $scope.amount = max - countChecked()
    }

    $scope.setDashboardWidget = function() {
        currentDashbordWidgetService.updateCurrentWidgets($scope.check)
        closeModal()
    }

}

function ProfileCtrl($scope, ResourceFactory, currentUser){
    console.log("ProfileCtrl")
    var userid = currentUser.userid
    var appid = currentUser.appid
    var date = '2017-01-28' //mock (find another solution later)

    var initialProfileView = function(){
        var profileResource = ResourceFactory.profile()
        var obj = profileResource.get({userid: userid, appid: appid, date: date}, function(){
            console.log(obj.data.profile)
            $scope.profile = obj.data.profile
            $scope.profile.birthdate = moment(obj.data.profile.birthdate).format("MMMM Do YYYY")
        })
        
    }
    initialProfileView()

}
//1 = sunday
function ScheduleCtrl($scope){
    var task = [
        {day_of_week: 1, task: "Lipitor 1 Tablet", time: "Morning"}
    ]
}
function UpcomingEventWidgetCtrl($scope, EventService,  ResourceFactory, currentUser){
    var userid = currentUser.userid
    var appid = currentUser.appid
    var today = new Date()
    var year = today.getFullYear().toString()
    var month = '0' + (today.getMonth() + 1).toString()

    var _today = moment(today).format('YYYY-MM-DD')
    
    $scope.noData = false
    var appointmentResource = ResourceFactory.appointment()
    var eventsList = appointmentResource.get({userid: userid, appid: appid, month: month, year: year}, function (){
        console.log(eventsList.data)
        var eventLists = eventsList.data
                    .filter(function(event){
                        return moment(new Date(event.date)).isSameOrAfter(_today)
                    }).map(function(event){
                        return EventService.createEventsObject(event, 'widgets')
                    })
        if(eventLists.length > 0){
            $scope.eventsWidget = eventLists   
        }else{
            $scope.noData = true
        }
        
        });
}
function TimelineCtrl($scope, EventService, ResourceFactory, currentUser){
    var userid = currentUser.userid
    var appid = currentUser.appid
    var monthList = EventService.monthList
    $scope.monthList = monthList
    $scope.year = "2017"
    $scope.month = monthList[0]
    $scope.getEventAt = function(){
        var month = $scope.month.ref
        var year = $scope.year
        var appointmentResource = ResourceFactory.appointment()
        var eventsList = appointmentResource.get({userid: userid, appid: appid, month: month, year: year}, function (){
            $scope.eventsPage = eventsList.data
                                .sort(function(a, b){
                                    return new Date(b.date) - new Date(a.date)
                                }).map(function(event) { 
                                    return EventService.createEventsObject(event, 'page')
                                })
               
            });
    } 
    
}

function InputFormCtrl($scope, ResourceFactory, modalProvider, currentUser){    
    $scope.hstep = 1;
    $scope.mstep = 1;
    $scope.option = {
        type_list: [
            {id: 1, title: 'Results', template: 'templates/inputform/labresults.html'},
            {id: 2, title: 'Nutrient', template: 'templates/inputform/nutrient.html'},
            {id: 3, title: 'Appointment', template: 'templates/inputform/appointment.html'},
            {id: 4, title: 'Profile', template: 'templates/inputform/profile.html'}
        ],
        labresults_list: [
            {id: 1, title: 'creatinine', unit: 'mm/dL', limit: 1.5},
            {id: 2, title: 'BUN', unit: 'mm/dL', limit: 20},
            {id: 3, title: 'albumin', unit: 'mm/dL', limit: 20},
            {id: 4, title: 'eGFR', unit: 'mm/dL', limit: 1.5},
            {id: 5, title: 'sediment', unit: 'mm/dL', limit: 12},
            {id: 6, title: 'albumin creatinine ratio', unit: 'mm/dL', limit: 2.5},
            {id: 7, title: 'protein creatinie retio', unit: 'mm/dL', limit: 1.6},  
            {id: 8, title: 'white blood cell ratio', unit: 'mm/dL', limit: 2.4},
            {id: 9, title: 'sodium', unit: 'mm/dL', limit: 3.2},
            {id: 10, title: 'blood pressure', unit: 'mm Hg', limit: "120/80"},
            {id: 11, title: 'water', unit: 'lt', limit: "3"},
            {id: 12, title: 'weight', unit: 'kg', limit: "60"},
            {id: 13, title: 'glucose blood level', unit: 'mmol', limit: "200"},
            // {id: 14, title: 'symtom', unit: '', limit: ""}
        ],
        meal_list: [
            {id: 1, title: 'breakfast'},
            {id: 2, title: 'lunch'},
            {id: 3, title: 'dinner'}
        ]
    }
    // var LabresultResource = $resource('http://0.0.0.0:5000/result/info');
    // var NutrientResource01 = $resource('http://0.0.0.0:5000/nutrient/info');
    var LabresultResource = ResourceFactory.labresultInfo()
    var postNutrientResource = ResourceFactory.nutrientMeal()
    var appointmentResource = ResourceFactory.appointment()
    var profileResource = ResourceFactory.profile()

    var userid = currentUser.userid
    var appid = currentUser.appid

    var formatDate = function (dateObj){
        return moment(dateObj).format('YYYY-MM-DD');
    }

    var createDataObj = function(cat, input){
        console.log("input: " , input)
        var data = new Object();
        data.userid = userid
        data.appid = appid
        data[cat] = angular.copy(input[cat])
        data.date = formatDate(input.date)

        if(input.meal != undefined){
            data.meal = input.meal.title
        }else if(input.time != undefined){
            data[cat].time = moment(input.time).format('LT')

        }

        console.log(JSON.stringify(data))

        return data
    }

    $scope.saveInputForm = function(){    
        if($scope.labresult != undefined){
            labresult = angular.toJson(createDataObj('result', $scope.labresult)); //receive data from input form
            LabresultResource.save(labresult);
            labresult = ''
        }else if($scope.appointment != undefined){
            information = angular.toJson(createDataObj('description', $scope.appointment)) 
            appointmentResource.save(information)
        }else if($scope.nutrient != undefined){
            console.log("save")
            nutrient = angular.toJson(createDataObj('nutrients', $scope.nutrient))
            postNutrientResource.save(nutrient)
            nutrient = ''
        }else if($scope.information != undefined){
            profile = angular.toJson(createDataObj('profile', $scope.information))
            console.log("proflie: " , profile)
            profileResource.save(profile)
        }
        // closeModal()
    } 

    var closeModal = function(){
        modalProvider.closeModal()
        $scope.chooseType = {}
        $scope.labresult = {}
        $scope.general = {}
        // window.location.reload(); 
    }
    $scope.closeModal = closeModal
}