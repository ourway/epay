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

function toPersian(string) {
  string = '' + string;
  var persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  var persianChars = 'شذزیثبلاهتنمئدخحضقسفعرصطغظ';
  for (var i=0; i<persianDigits.length; i++)
    string = string.replace(new RegExp(i, 'g'), persianDigits.charAt(i));
  for (var i=0; i<persianChars.length; i++)
    string = string.replace(String.fromCharCode('a'.charCodeAt(0) + i), persianChars.charAt(i));
  string = string.replace(':', 'ک');
  string = string.replace('þ', 'گ');
  string = string.replace('¼', 'و');
  string = string.replace('ü', 'پ');
  string = string.replace('û', 'ج');
  string = string.replace('ý', 'چ');
  return string;
}

function toNumber(string) {
  var persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  for (var i=0; i<persianDigits.length; i++)
    string = string.replace(persianDigits.charAt(i), i);
  return +string;
}

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
  sidebarItems.forEach(function(item) {
    item.items.forEach(function(item) {
      var name = item.sref;
      $stateProvider.state(name, {
        url: '/' + name,
        templateUrl: name + '.html',
        controller: name + 'Ctrl'
      });
    });
  });
})

.directive('dtRestrictInput', function() {
  return {
    require: '?ngModel',
    link: function(scope, input, attributes, ngModel) {
      var validator = scope.$eval(attributes.dtValidator);
      var modifier  = scope.$eval(attributes.dtModifier);
      if (!validator)
        validator = function() { return true; };
      if (!modifier)
        modifier = function(x) { return x; };
      var previousValFunction = input.val;
      input.val = function(value) {        
        if (value != null && ngModel)
          ngModel.$setViewValue(value);
        return previousValFunction.apply(input, arguments);
      }
      function getChar(key) {
        if (key >= 96 && key <= 105)
          return (key - 96) + '';
        if (key === 191)
          return '/';
        if (key == 186)
          return ':';
        return String.fromCharCode(key).toLowerCase()
      }
      function isSpecialKey(key) {
        return ~[13, 38, 40, 37, 39, 27, 32, 17, 18, 9, 16, 20, 91, 93, 8, 36, 35, 45, 46, 33, 34, 144, 
                 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 145, 19].indexOf(key);
      }
      var previousVal = input.val();
      input.on('keydown', function(e) {
        var key = e.keyCode;
        var start = input[0].selectionStart;
        var end = input[0].selectionEnd;
        var val = input.val();
        if (key === 8) { // backspace
          if (start !== end)
            val = val.substr(0, start) + val.substr(end, val.length - end);
          else {
            val = val.substr(0, start - 1) + val.substr(end, val.length - end);
            start--;
          }
        }
        else if (key === 46) { // delete
          if (start !== end)
            val = val.substr(0, start) + val.substr(end, val.length - end);
          else
            val = val.substr(0, start) + val.substr(end + 1, val.length - end - 1);
        }
        else if (!e.ctrlKey && !isSpecialKey(key)) {
          var char = getChar(key);
          val = val.substr(0, start) + char + val.substr(end, val.length - end);
          start++;
        }
        if (val === previousVal)
          return;
        if (modifier)
          val = modifier(val);
        if (validator(val)) {
          input.val(val);
          input[0].setSelectionRange(start, start);
          previousVal = val;
        }
        e.preventDefault();
      });
      input.keydown = function(handler) {
        input.on('keydown', function(e) {
          var returnValue = handler(e);
          if (returnValue != null) {
            if (returnValue !== previousVal) {
              var start = input[0].selectionStart;
              var end = input[0].selectionEnd;
              input.val(returnValue);
              if (start !== end) {
                end += returnValue.length - previousVal.length;
                input[0].setSelectionRange(start, end);
              }
              previousVal = returnValue;
            }
            e.preventDefault();
          }
        });
      };
      input.on('keyup paste input', function() {
        setTimeout(function() {
          var val = input.val();
          if (val !== previousVal) {
            if (modifier)
              val = modifier(val);
            if (!validator(val))
              val = previousVal;
            input.val(val);
            previousVal = val;
          }
        });
      });
    }
  };
})

.directive('dtHighlights', function() {
  return {
    link: function(scope, element, attributes) {
      scope.$watch(attributes.dtHighlights, function(highlights) {
        if (highlights && highlights.length) {
          function isHighlighted(index) {
            return highlights.filter(function (highlight) {
              return highlight.start <= index && index <= highlight.end;
            }).length > 0;
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
    if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {
      e.preventDefault();
      document.getElementById('sidebar-search').focus();
    }
  }
})

.controller('sidebarCtrl', function($scope, $state) {
  $scope.filter = '';
  $scope.$watch(function() { return $state.current; }, function(state) {
    $scope.previousState = $state.current.name;
  });
  function reset() {
    $scope.items = sidebarItems.map(function(item) { return angular.copy(item); });
  }
  reset();
  $scope.items = sidebarItems.map(function(item) { return angular.copy(item); });
  $scope.onFilter = function() {
    var filter = $scope.filter;
    if (!filter)
      return reset();
    function getWordsHighlights(text) {
      return filter.split(' ').reduce(function(highlights, filter) {
        filter = filter.trim();
        if (!filter || highlights.invalid)
          return highlights;
        var newHighlights = getHighlights(text, filter)
        newHighlights = newHighlights.filter(function(h1) {
          return highlights.filter(function(h2) {
            return h1.start === h2.start && h1.end === h2.end;
          }).length < newHighlights.length;
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
      item.highlights = getWordsHighlights(item.title);
      if (!item.highlights.length) {
        item.items = item.items.filter(function(item) {
          item.highlights = getWordsHighlights(item.title);
          return item.highlights.length;
        });
      }
      return item;
    }).filter (function(item) {
      return item.items.length;
    });
    if ($scope.items.filter(function(item) { return item.items.filter(function(item) { return item.sref === $scope.previousState }).length }).length)
      $state.go($scope.previousState);
    else if ($scope.items.length > 0)
      $state.go($scope.items[0].items[0].sref);
  }
  $scope.onKeydown = function(e) {
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
            else if (i !== items.length - 1) {
              subItems = items[i + 1].items; 
              $state.go(subItems[0].sref);
            }
          }
        })
      });
    }
  }

  $scope.modifier = toPersian;
})

/////////////////////////////////////////////////////////////////////////////////////////////

.controller('shaparakBillPaymentCtrl', function($scope, $http) {
  $scope.validator = function(x) {
    return x.length <= 13 && /^[۰-۹]*$/g.test(x);
  }
  $scope.modifier = toPersian;
  $scope.submit = function (billId, paymentId, email) {
    billId = toNumber(billId);
    paymentId = toNumber(paymentId);
    console.log(billId, paymentId, email);
    $http.get('/home', {
      billId: billId,
      paymentId: paymentId,
      email: email
    })
    .then(function (response) {
      console.log('success', response);
    }, function (response) {
      console.log('error', response);
    });
  }
})

.controller('shaparakBatchBillPaymentCtrl', function() {

})

.controller('shaparakIrancellCCCtrl', function() {

})

.controller('shaparakMciCCCtrl', function() {

})

.controller('shaparakRightelCCCtrl', function() {

})

.controller('shaparakTaliyaCCCtrl', function() {

})

.controller('changePin2Ctrl', function() {

})

.controller('blockCardCtrl', function() {

})

.controller('payOrderCtrl', function() {

})

.controller('transferToAccountCtrl', function() {

})

.controller('balanceInquiryCtrl', function() {

})

.controller('getStatementCtrl', function() {

})

.controller('batchTransferCtrl', function() {

})

.controller('getCyberCardCtrl', function() {

})

.controller('extendCyberCardCtrl', function() {

})

.controller('chargeCyberCardCtrl', function() {

})

.controller('mobilePaymentDownloadCtrl', function() {

})

.controller('USSDCtrl', function() {

})
