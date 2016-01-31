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

.controller('sidebarCtrl', function($scope) {
  $scope.filter = '';
  function copyItems() { return  sidebarItems.map(function(item) { return angular.copy(item); }); }
  $scope.items = copyItems();
  $scope.onFilter = function() {
    var filter = $scope.filter;
    if (!filter)
      return $scope.items = copyItems();
    function getHighlight(text, filter, skip) {
      var index = text.indexOf(filter);
      if (!~index)
        return null;
      var wordDescriptors = text.split(' ').reduce(function(prev, word) {
        var previousItem = prev[prev.length - 1];
        var start = previousItem ? previousItem.end + 1 : 0;
        return prev.concat([{
          start: start,
          end: start + word.length
        }]);
      }, []);
      var startingWord = wordDescriptors.filter(function(section) {
        return index === section.start;
      })[0];
      if (!startingWord || (skip && index === 0))
        return getHighlight(text.substring(index + 1, text.length), filter, (skip ? skip + index : index) + 1);
      start = startingWord.start;
      var end = wordDescriptors.filter(function(section) {
        return index + filter.length >= section.start && index + filter.length <= section.end;
      })[0].end;
      if (skip)
        return { start: start + skip, end: end + skip };
      return { start: start, end: end };
    }
    $scope.items = sidebarItems.map(function(item) {
      item = angular.copy(item);
      var headerInFilter = false;
      item.highlight = getHighlight(item.title, filter);
      if (item.highlight)
        headerInFilter = true;
      var previousSubItems = item.items;
      var newSubItems = [];
      previousSubItems.forEach(function(item) {
        item.highlight = getHighlight(item.title, filter);
        if (item.highlight || headerInFilter)
          newSubItems.push(item);
      });
      item.items = newSubItems;
      return item;
    });
  }
})