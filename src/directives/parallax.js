angular.module('duParallax.directive', ['duScroll']).
directive('duParallax',
  function($rootScope){
    //Never mind touch devices
    if('ontouchstart' in window) {
      return;
    }

    var test = angular.element('<div></div>')[0];
    var prefixes = 'transform WebkitTransform MozTransform OTransform'.split(' '); //msTransform
    var transformProperty;
    for(var i = 0; i < prefixes.length; i++) {
      if(test.style[prefixes[i]] !== undefined) {
        transformProperty = prefixes[i];
        break;
      }
    }

    //Skipping browsers withouth transform-support. 
    //Could do fallback to margin or absolute positioning, but would most likely perform badly
    //so better UX would be to keep things static.
    if(!transformProperty){
      return;
    }

    var translate3d = function(result){
      if(!result.x && !result.y) return '';
      return 'translate3d(' + Math.round(result.x) + 'px, ' + Math.round(result.y) + 'px, 0)';
    };

    var rotate = function(result) {
      if(!result.rotation) return '';
      return ' rotate(' + (angular.isNumber(result.rotation) ? Math.round(result.rotation) + 'deg' : result.rotation) +  ')';
    };

    var applyProperties = function(result, element) {
      element.style[transformProperty] = translate3d(result) + rotate(result);
      element.style.opacity = result.opacity;
      if(result.custom) {
        for(var property in result.custom) {
          element.style[property] = result.custom[property];
        }
      }
    };

    return{
      scope : {
        y : '=',
        x : '=',
        rotation : '=',
        opacity : '=', 
        custom : '='
      },
      link: function($scope, $element, $attr){
        var element = $element[0];
        var currentProperties;
        $rootScope.$on('$duScrollChanged', function($event, scrollY){
          var rect = element.getBoundingClientRect();
          var param = {
            scrollY : scrollY,
            elemX: rect.left,
            elemY: rect.top
          };

          var properties = { x : 0, y : 0, rotation : 0, opacity: 1, custom: undefined};

          for(var key in properties){
            if(angular.isFunction($scope[key])){
              properties[key] = $scope[key](param);
            } else if($scope[key]){
              properties[key] = $scope[key];
            }
          }

          //Detect changes, if no changes avoid reflow
          var hasChange = angular.isUndefined(currentProperties);
          if(!hasChange) {
            for(key in properties){
              if(properties[key] !== currentProperties[key]) {
                hasChange = true;
                break;
              }
            }
          }

          if(hasChange) {
            applyProperties(properties, element);
            currentProperties = properties;
          }
        });
      }
    };
});
