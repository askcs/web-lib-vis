'use strict';

angular.module('NgVis', []).

  constant('options', {
    debug: false,
    align: 'center',
    autoResize: true,
    editable: true,
    start: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21),
    end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6),
    height: null,
    width: '100%',
    margin: {
      axis: 20,
      item: 10
    },
    max: null,
    maxHeight: null,
    min: null,
    orientation: 'bottom',
    padding: 5,
    selectable: true,
    showCurrentTime: true,
    showCustomTime: true,
    showMajorLabels: true,
    showMinorLabels: true,
    type: 'box', // dot, point
    zoomMin: 1000, // a second
    zoomMax: 1000 * 60 * 60 * 24 * 30 * 12 * 3  // three years
  }).

  directive('timeLine', [
    'options',
    function (options)
    {
      return {
        restrict: 'E',
        replace:  true,
        transclude: true,
        scope: {
          items:     '=',
          timeline:  '='
        },
        link: function (scope, element, attrs)
        {
          var callbacks = {
            onAdd:    scope.timeline.slot.add,
            onMove:   scope.timeline.slot.move,
            onUpdate: scope.timeline.slot.update,
            onRemove: scope.timeline.slot.remove
          };

          options.order       = function () {};
          options.groupOrder  = 'content'; // function () {};

          angular.extend(options, callbacks);

          var _timeline = new vis.Timeline(element[0]);

          _timeline.setOptions(options);

          function render (data)
          {
            var groups = new vis.DataSet();

            var items = new vis.DataSet({
              convert: {
                start:'Date',
                end:  'Date'
              }
            });

            items.on('*', function (event, properties)
            {
              if (options.debug)
                console.log('event=' +
                  angular.toJson(event) + ', ' +
                  'properties=' + angular.toJson(properties));
            });

            if (angular.isArray(data))
            {
              items.add(data);
            }
            else
            {
              var id = 0;

              angular.forEach(data, function (_items, _group)
              {
                groups.add({
                  id:      id,
                  content: _group
                });

                angular.forEach(_items, function (item)
                {
                  var _item = {
                    id:     item.id,
                    group:  id,
                    content:item.content,
                    start:  item.start
                  };

                  if (item.hasOwnProperty('end')) { _item.end = item.end; }

                  items.add(_item);
                });

                id++;
              });

              _timeline.setGroups(groups);
            }

            _timeline.setItems(items);
          }

          scope.$watch('items', function (data) { render(data); }, true);

          angular.extend(scope.timeline, {

            customDate: _timeline.getCustomTime(),

            getSelection: function ()
            {
              return _timeline.getSelection();
            },

            setSelection: function (selection)
            {
              return _timeline.setSelection(selection);
            },

            getWindow: function ()
            {
              return _timeline.getWindow();
            },

            setWindow: function (start, end)
            {
              return _timeline.setWindow(start, end);
            },

            getCustomTime: function ()
            {
              return _timeline.getCustomTime();
            },

            setCustomTime: function (time)
            {
              _timeline.setCustomTime(time);

              this.customDate = _timeline.getCustomTime();
            },

            setOptions: function (options)
            {
              _timeline.setOptions(options);
            }
          });

          _timeline.on('rangechange', function (period)
          {
            scope.timeline.rangeChange(period);
          });

          _timeline.on('rangechanged', function (period)
          {
            scope.timeline.rangeChanged(period);
          });

          _timeline.on('select', function (selected)
          {
            scope.timeline.select(selected);
          });

          _timeline.on('timechange', function (period)
          {
            scope.timeline.timeChange(period);
          });

          _timeline.on('timechanged', function (period)
          {
            scope.timeline.timeChanged(period);
          });
        }
      }
    }
  ]).

  directive('timeBoard', [
    function ()
    {
      return {
        restrict: 'E',
        transclude: true,
        replace:  true,
        scope: {
          timeline: '='
        },
        controller: function ($scope)
        {
          function indicate (range)
          {
            return range.start + ' - ' + range.end;
          }

          setTimeout(function ()
          {
            $scope.range = indicate($scope.timeline.getWindow());

            $scope.$apply();
          }, 15);

          $scope.$watch('timeline.range', function ()
          {
            var range = $scope.timeline.range;

            if (range)
              $scope.range = indicate(range);
          });
        },
        template:'<span>{{range}}</span>'
      }
    }
  ]).

  directive('timeNav', [
    function ()
    {
      return {
        restrict: 'E',
        replace:  false,
        scope: {
          timeline: '='
        },
        controller: function ($scope)
        {


          // now: moment().minutes(0).seconds(0).milliseconds(0)
          // now.clone().add('days', -3)

//          $scope.$watch('timeline.range', function ()
//          {
//            var range = $scope.timeline.range;
//
//            if (range)
//              $scope.range = range.start + ' - ' + range.end;
//          });
        }
      }
    }
  ]);