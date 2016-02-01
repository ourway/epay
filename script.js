var sidebarItems = [
  {
    title: 'پرداخت اینترنتی',
    items: [
      { title: 'پرداخت قبض', sref: 'shaparakBillPayment' },
      { title: 'پرداخت قبض گروهی', sref: 'shaparakBatchBillPayment' }
    ]
  },
  {
    title: 'خرید شارژ',
    items: [
      { title: 'شارژ ایرانسل', sref: 'shaparakIrancellCC' },
      { title: 'شارژ همراه اول', sref: 'shaparakMciCC' },
      { title: 'شارژ رایتل', sref: 'shaparakRightelCC' },
      { title: 'شارژ تالیا', sref: 'shaparakTaliyaCC' }
    ]
  },
  {
    title: 'عملیات کارت',
    items: [
      { title: 'تغییر رمز اینترنتی', sref: 'changePin2' },
      { title: 'مسدود کردن کارت', sref: 'blockCard' }
    ]
  },
  {
    title: 'عملیات بانکی',
    items: [
      { title: 'انتقال کارت به کارت', sref: 'payOrder' },
      { title: 'انتقال کارت به سپرده', sref: 'transferToAccount' },
      { title: 'اعلام موجودی', sref: 'balanceInquiry' },
      { title: 'صورت حساب', sref: 'getStatement' },
      { title: 'انتقال وجه گروهی', sref: 'batchTransfer' }
    ]
  },
  {
    title: 'کارت مجازی',
    items: [
      { title: 'خرید کارت مجازی', sref: 'getCyberCard' },
      { title: 'تمدید کارت مجازی', sref: 'extendCyberCard' },
      { title: 'شارژ کارت مجازی', sref: 'chargeCyberCard' }
    ]
  },
  {
    title: 'پرداخت همراه',
    items: [
      { title: 'دریافت برنامه', sref: 'mobilePaymentDownload' }
    ]
  },
  {
    title: 'پرداخت همراه (USSD)',
    items: [
      { title: 'راهنمای سرویس USSD', sref: 'USSD' }
    ]
  }
];

function getHighlights(text, filter) {
  var results = [];
  for (var start = 0; start < text.length; start++) {
    if ((start === 0 || text.charAt(start - 1) === ' ') && text.charAt(start) === filter.charAt(0)) {
      for (var i = 0; i < filter.length; i++) {
        var end = start + i;
        if (end >= text.length || text.charAt(end) !== filter.charAt(i))
          break;
        if (i === filter.length - 1) {
          while (end < text.length - 1 && text.charAt(end + 1) !== ' ')
            end++;
          results.push({ start: start, end: end });
        }
      }
    }
  }
  return results;
}

angular.module('app', ['ngAnimate', 'ui.router'])

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/shaparakBillPayment');
  function addRout(name) {
    $stateProvider.state(name, {
      url: '/' + name,
      templateUrl: name + '.html'
    });
  }
  sidebarItems.forEach(function(item) {
    item.items.forEach(function(item) {
      addRout(item.sref);
    });
  });
})

.directive('epayHighlights', function() {
  return {
    link: function(scope, element, attributes) {
      scope.$watch(attributes.epayHighlights, function(highlights) {
        if (highlights && highlights.length) {
          function isHighlighted(index) {
            return highlights.filter(function (highlight) { return highlight.start <= index && index <= highlight.end; }).length > 0;
          }
          var value = scope.$eval(attributes.ngBind);
          var parts = [];
          var lastPartWasHighlighted;
          for (var i=0; i<value.length; i++) {
            var highlighted = isHighlighted(i);
            var character = value.charAt(i);
            if (highlighted === lastPartWasHighlighted)
              parts[parts.length - 1] += character;
            else
              parts.push(character);
            lastPartWasHighlighted = highlighted;
          }
          element.html(parts.map(function(part, i) {
            return '<span ' + ((parts.length + lastPartWasHighlighted + i + 1) % 2 ? 'class="highlight"' : '') + '>' + part + '</span>';
          }).join(''));
        }
      });
    }
  };
})

.controller('mainCtrl', function($scope) {
  $scope.onKeydown = function(e) {
    console.log(e);
    if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {
      e.preventDefault();
      document.getElementById('sidebar-search').focus();
    }
  }
})

.controller('sidebarCtrl', function($scope, $state) {
  $scope.filter = '';
  $scope.$watch(function() { return $state.current; }, function(state) {
    if ($scope.filter === '')
      $scope.previousState = $state.current.name;
  });
  function reset() {
    $scope.items = sidebarItems.map(function(item) { return angular.copy(item); });
    if ($scope.previousState)
      $state.go($scope.previousState);
  }
  reset();
  $scope.onFilter = function() {
    var filter = $scope.filter;
    if (!filter)
      return reset();
    function getWordsHighlights(text) {
      return filter.split(' ').reduce(function(highlights, filter) {
        if (highlights.invalid)
          return [];
        var newHighlights = getHighlights(text, filter).filter(function(h1) {
          return highlights.filter(function(h2) {
            return h1.start === h2.start && h1.end === h2.end;
          }).length === 0;
        });
        if (!newHighlights.length) {
          highlights = [];
          highlights.invalid = true;
          return highlights;
        }
        return highlights.concat(newHighlights);
      }, []);
    }
    $scope.items = sidebarItems.map(function(item) {
      item = angular.copy(item);
      var headerInFilter = false;
      item.highlights = getWordsHighlights(item.title);
      if (item.highlights.length)
        headerInFilter = true;
      var previousSubItems = item.items;
      var newSubItems = [];
      previousSubItems.forEach(function(item) {
        item.highlights = getWordsHighlights(item.title);
        if (item.highlights.length || headerInFilter)
          newSubItems.push(item);
      });
      item.items = newSubItems;
      return item;
    }).filter (function(item) {
      return item.items.length > 0;
    });
    if ($scope.items.length > 0)
      $state.go($scope.items[0].items[0].sref);
  }
  $scope.onFIlterKeydown = function(e) {
    if (e.keyCode === 38) {
      e.preventDefault();
      $scope.items.forEach(function(item, i, items) {
        item.items.forEach(function(item, j, subItems) {
          if (item.sref === $state.current.name) {
            if (j !== 0)
              $state.go(subItems[j - 1].sref);
            else if (i !== 0) {
              subItems = items[i - 1].items; 
              $state.go(subItems[subItems.length - 1].sref);
            }
          }
        })
      });
    }
    else if (e.keyCode === 40) {
      e.preventDefault();
      $scope.items.forEach(function(item, i, items) {
        item.items.forEach(function(item, j, subItems) {
          if (item.sref === $state.current.name) {
            if (j !== subItems.length - 1)
              $state.go(subItems[j + 1].sref);
            else if (i !== items.length + 1) {
              subItems = items[i + 1].items; 
              $state.go(subItems[0].sref);
            }
          }
        })
      });
    }
  }
})