// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('kidney',['ionic','kidney.services','kidney.controllers','kidney.directives','kidney.filters','ngCordova','ngFileUpload','btford.socket-io'])

.run(function($ionicPlatform, $state, Storage, $location, $ionicHistory, $ionicPopup,$rootScope,CONFIG,notify,$interval,socket) {
  $ionicPlatform.ready(function() {

    var isSignIN=Storage.get("isSignIN");
    thisPatient=null;
    $rootScope.conversation = {
        type: null,
        id: ''
    }
    if(isSignIN=='YES'){
      $state.go('tab.tasklist');
    }
    var appState = {
        background:false
    }
    document.addEventListener('pause', onPause, false);
    document.addEventListener('resume', onResume, false);
    function onPause(){
        appState.background = true;
    }
    function onResume(){
        appState.background = false;
    }
    socket.on('error', function(data) {
        console.error('socket error');
        console.log(data);
    });
    socket.on('disconnected', function(data) {
        console.error('disconnected');
        console.error(data);
    });
    socket.on('reconnect', function(attempt) {
        console.info('reconnect: ' + attempt);
        var id = Storage.get('UID'),
            name = thisPatient===null?'':thisPatient.name;
        socket.emit('newUser',{ user_name: name, user_id: id });
    });
    socket.on('getMsg', listenGetMsg);
    function listenGetMsg(data){
        console.info('getMsg');
        console.log(data);
        if(!appState.background && (($rootScope.conversation.type == 'single' && $rootScope.conversation.id==data.msg.fromID) || ($rootScope.conversation.type == 'group' && $rootScope.conversation.id==data.msg.targetID))) return;
        notify.add(data.msg);
    }
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
        StatusBar.backgroundColorByHexString("#33bbff");
      // StatusBar.styleDefault();
    }
    $rootScope.$on('$cordovaLocalNotification:click',function(event,note,state){
        console.log(arguments);
        var msg = JSON.parse(note.data);
        if(msg.newsType=='11'){
            $state.go('tab.consult-chat', {chatId: msg.fromID});
        }
    })

    window.addEventListener('native.keyboardshow', function(e) {
        $rootScope.$broadcast('keyboardshow', e.keyboardHeight);
    });
    window.addEventListener('native.keyboardhide', function(e) {
        $rootScope.$broadcast('keyboardhide');
    });

  });
})

// --------路由, url模式设置----------------
.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  //注册与登录
  $stateProvider
    .state('signin', {
      cache: false,
      url: '/signin',
      templateUrl: 'partials/login/signin.html',
      controller: 'SignInCtrl'
    })
    .state('agreement', {
      cache: false,
      url: '/agreeOrNot',
      params:{last:null},

      templateUrl: 'partials/login/agreement.html',
      controller: 'AgreeCtrl'
    })
    .state('phonevalid', { 
      cache: false,
      url: '/phonevalid',
      params:{phonevalidType:null},
      templateUrl: 'partials/login/phonevalid.html',
      controller: 'phonevalidCtrl'
    })
    .state('setpassword', {
      cache:false,
      url: '/setpassword',
      params:{phonevalidType:null},
      templateUrl: 'partials/login/setpassword.html',
      controller: 'setPasswordCtrl'
    })
    .state('userdetail',{
      cache:false,
      url:'mine/userdetail',
      params:{last:null},
      templateUrl:'partials/login/userDetail.html',
      controller:'userdetailCtrl'
    })
    .state('messages',{
      cache:false,
      url:'/messages',
      templateUrl:'partials/messages/AllMessage.html',
      controller:'messageCtrl'
    })
    .state('messagesDetail',{
      cache:false,
      url:'/messagesDetail',
      params:{messageType:null},
      templateUrl:'partials/messages/VaryMessage.html',
      controller:'VaryMessageCtrl'
    })
    .state('payment',{
      cache:false,
      url:'/payment',
      params:{messageType:null},
      templateUrl:'partials/payment/payment.html',
      controller:'paymentCtrl'
    });   
    
    //主页面    
  $stateProvider
    .state('tab', {
      cache:false,
      abstract: true,
      url: '/tab',
      templateUrl: 'partials/tabs/tabs.html',
      controller:'GoToMessageCtrl'
    })
    .state('tab.tasklist', {
      url: '/tasklist',
      views: {
        'tab-tasks': {
          cache:false,
          templateUrl: 'partials/tabs/task/tasklist.html',
          controller: 'tasklistCtrl'
        }
      }
    })
    .state('tab.forum', {
      url: '/forum',
      views: {
        'tab-forum': {
          cache:false,
          templateUrl: 'partials/tabs/forum.html',
          controller: 'forumCtrl'
        }
      }
    })
    .state('tab.myDoctors', {
      url: '/myDoctors',
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/myDoctors.html',
          controller: 'DoctorCtrl'
        }
      }
    })
    .state('tab.consult-chat', {
      url: '/consult/chat/:chatId',
      // params:{type:null,status:null,msgCount:null},
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/consult-chat.html',
          controller: 'ChatCtrl'
        }
      }
    })
    .state('tab.consult-comment', {
      url: '/consult/comment',
      params:{counselId:null,doctorId:null,patientId:null},
      cache:false,
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/commentDoctor.html',
          controller: 'SetCommentCtrl'
        }
      }
    })
    .state('tab.AllDoctors', {
      url: '/AllDoctors',
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/allDoctors.html',
          controller: 'DoctorCtrl'
        }
      }
    })
    .state('tab.DoctorDetail', {
      url: '/DoctorDetail/:DoctorId',
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/DoctorDetail.html',
          controller: 'DoctorDetailCtrl'
        }
      }
    })
    .state('tab.consultquestion1', {
      url: '/consultquestion1',
      params:{DoctorId:null,counselType:null},
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/consultquestion1.html',
          controller: 'consultquestionCtrl'
        }
      },
      // params:{DoctorId:null}
    })
    .state('tab.consultquestion2', {
      url: '/consultquestion2',
      params:{DoctorId:null,counselType:null},
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/consultquestion2.html',
          controller: 'consultquestionCtrl'
        }
      },
      // params:{DoctorId:null}
    })
    .state('tab.consultquestion3', {
      url: '/consultquestion3',
      params:{DoctorId:null,counselType:null},
      views: {
        'tab-consult': {
          cache:false,
          templateUrl: 'partials/tabs/consult/consultquestion3.html',
          controller: 'consultquestionCtrl'
        }
      },
      // params:{DoctorId:null}
    })

    .state('tab.mine', {
        url: '/mine',
        views: {
          'tab-mine': {
            templateUrl: 'partials/tabs/mine/mine.html',
            controller: 'MineCtrl'
          }

        }
         
    })
    .state('tab.DiagnosisInfo', {
        url: '/mine/DiagnosisInfo',
        views: {
          'tab-mine': {
            templateUrl: 'partials/tabs/mine/diagnosisInfo.html',
            controller: 'DiagnosisCtrl'
          }

        }
         
    })
    .state('tab.myConsultRecord', {
        url: '/mine/ConsultRecord',
        views: {
          'tab-mine': {
            templateUrl: 'partials/tabs/mine/consultRecord.html',
            controller: 'ConsultRecordCtrl'
          }

        }
         
    })
    .state('tab.myHealthInfo', {
        url: '/mine/HealthInfo',
        views: {
          'tab-mine': {
            templateUrl: 'partials/tabs/mine/HealthInfo.html',
            controller: 'HealthInfoCtrl'
          }

        }
         
    })
    .state('tab.myHealthInfoDetail', {
      cache:false,
      url: '/mine/HealthInfoDetail/',
      params: {id:null,caneidt:null},
      views: {
        'tab-mine': {
          templateUrl: 'partials/tabs/mine/editHealthInfo.html',
          controller: 'HealthDetailCtrl'
        }

      }
         
    })
     .state('tab.myMoney', {
        url: '/mine/Account/',
        views: {
          'tab-mine': {
            templateUrl: 'partials/tabs/mine/money.html',
            controller: 'MoneyCtrl'
          }

        }     
         
    })
    .state('tab.about',{
        url:'/mine/about',
        views:{
            'tab-mine':{
                templateUrl:'partials/about.html',
                controller:'aboutCtrl'
            }
        }
      
    })
    .state('tab.advice', {
        cache:false,
        url: '/mine/advice/',
        views: {
            'tab-mine': {
                templateUrl: 'partials/tabs/mine/advice.html',
                controller: 'adviceCtrl'
            }

        }     
         
    })
    .state('tab.changePassword',{
        cache:false,
        url:'/mine/changePassword',
        views:{
            'tab-mine':{
                templateUrl:'partials/changePassword.html',
                controller:'changePasswordCtrl'
            }
        }
      
    })

    .state('tab.taskSet', {
        url: '/mine/taskSet/',
        views: {
          'tab-mine': {
            templateUrl: 'partials/tabs/task/taskSet.html',
            controller: 'TaskSetCtrl'
          }
        }           
    })  

     //肾病保险
  $stateProvider
    .state('insurance', {
      cache: false,
      url: '/insurance',
      templateUrl: 'partials/insurance/insurance.html',
      controller: 'insuranceCtrl'
    })
    .state('intension', {
      cache: false,
      url: '/intension',
      templateUrl: 'partials/insurance/intension.html',
      controller: 'insuranceCtrl'
    })
    .state('insuranceexpense', {
      cache: false,
      url: '/insuranceexpense',
      templateUrl: 'partials/insurance/insuranceexpense.html',
      controller: 'insurancefunctionCtrl'
    })
    .state('kidneyfunction', {
      cache: false,
      url: '/kidneyfunction',
      templateUrl: 'partials/insurance/kidneyfunction.html',
      controller: 'insurancefunctionCtrl'
    })
    .state('insurancestafflogin', {
      cache: false,
      url: '/insurancestafflogin',
      templateUrl: 'partials/insurance/insurancestafflogin.html',
      controller: 'insurancestaffCtrl'
    })
    .state('insurancestaff', {
      cache: false,
      url: '/insurancestaff',
      templateUrl: 'partials/insurance/insurancestaff.html',
      controller: 'insurancestaffCtrl'
    });

  $urlRouterProvider.otherwise('/signin');



   
 



});   


 
