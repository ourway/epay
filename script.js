var Cookie = function(name, value, path, expires, domain, secure)
{
  this.Name = name;
  this.Value = value;
  this.Path = path;
  this.Expires = expires;
  this.Domain = domain;
  this.Secure = secure;
}

Cookie.prototype.MaxSize = 4000;
Cookie.prototype.toString = function() {
  return this.Value;
}

Cookie.prototype.Append = function(newValue) {
  this.Value += newValue;
}

Cookie.prototype.$GetValue = function( startIndex ) {  
  var endIndex = document.cookie.indexOf( ";", startIndex );  
  if( endIndex == -1 )    
    endIndex = document.cookie.length;
  var cookieValue = document.cookie.substring(startIndex, endIndex);
  if( cookieValue == "" )
    return null;
  else
    return unescape( cookieValue );
}

Cookie.prototype.Load = function() {  
  var arg = this.Name + "=";  
  var alen = arg.length;  
  var clen = document.cookie.length;  
  
  var i = 0;  
  while( i < clen )
  {    
    var j = i + alen;    
    if( document.cookie.substring(i, j) == arg )
    {
      this.Value = this.$GetValue(j);
      return this.Value;
    }
    i = document.cookie.indexOf( " ", i ) + 1;    
    if( i == 0 ) break;   
  }  
  
  return null;
}

Cookie.prototype.Save = function() {
  var newCookie = this.Name + "=" + escape(this.Value) +
  ((this.Expires == null) ? "" : ("; expires=" + this.Expires)) +
  ((this.Path == null) ? "" : ("; path=" + this.Path)) +
  ((this.Domain == null) ? "" : ("; domain=" + this.Domain)) +
  ((this.Secure == true) ? "; secure" : "");
  
  if( newCookie.length > Cookie.MaxSize )
    throw Error("Cookie length was " + newCookie.length + "kb but cookies cannot exceed " + Cookie.MaxSize + "kb");
  
  document.cookie = newCookie;
}

Cookie.prototype.Delete = function() {  
  var exp = new Date();  
  exp.setTime(exp.getTime() - 1);
  document.cookie = this.Name + "=null;expires=" + exp.toGMTString();
}

Cookie.prototype = new Cookie();
Cookie.prototype.constructor = Cookie;

Cookie.prototype.GetValue = function(id) {
  if( this.Value == null ) return null;
  
  var i = this.Value.indexOf("|id|" + id);
  if( i < 0 ) return null;

  var vi = this.Value.indexOf("|value|", i);
  var vie = this.Value.indexOf("|disabled|", vi);
  
  var v = this.Value.substring(vi+7, vie);
  return v;
}

Cookie.prototype.GetDisabled = function(id) {
  if( this.Value == null ) return null;

  var i = this.Value.indexOf("|id|" + id);
  if( i < 0 ) return null;

  var vi = this.Value.indexOf("|disabled|", i);
  var vie = this.Value.indexOf("|id|", vi);
  if( vie == -1 ) vie = this.Value.length;
  
  var v = this.Value.substring(vi+10, vie);
  return v;
}

Cookie.prototype.$Append = Cookie.prototype.Append;
Cookie.prototype.Append = function(id, value, disabled) {
  this.$Append("|id|" + id + "|value|" + value + "|disabled|" + disabled);
}

Cookie.prototype.GetPageState = function(psAIBlock) {
  if( psAIBlock == null ) 
    psAIBlock = "all";
  else
    psAIBlock = psAIBlock.toLowerCase();

  var oFields = document.getElementsByTagName("tr");

  if( oFields != null )
  {
    for( i=0; i < oFields.length; i++ )
    {
      var sAIBlock = oFields[i].getAttribute('ai_block');
      
      if( sAIBlock != null ) 
        sAIBlock = sAIBlock.toLowerCase();
        
      if( psAIBlock == "all" || sAIBlock == psAIBlock )
      {
        
        if( oFields[i].id != null )
          this.Append(oFields[i].id, oFields[i].style.display, oFields[i].disabled);
      }
    }
  }
}

Cookie.prototype.RestorePageState = function(psAIBlock) {
  if( this.Value == null ) return;

  if( psAIBlock == null ) 
    psAIBlock = "all";
  else
    psAIBlock = psAIBlock.toLowerCase();
  
  var oFields = document.getElementsByTagName("tr");

  if( oFields != null )
  {
    for( i=0; i < oFields.length; i++ )
    {
      var sAIBlock = oFields[i].getAttribute('ai_block');
      
      if( sAIBlock != null ) 
        sAIBlock = sAIBlock.toLowerCase();
        
      if( psAIBlock == "all" || sAIBlock == psAIBlock )
      {
        var id = oFields[i].id;
        if( id )
        {
          var v = this.GetValue(id);
          var d = this.GetDisabled(id);
          if( v != null )
            oFields[i].style.display = v;

          //needed because in JS "false" evalutes to true (WTF?!?)
          if( d == "true" )
            oFields[i].disabled = true;
          else
            oFields[i].disabled = false;
        }
      }
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*  MOD  --  Modulus function which works for non-integers.  */
function mod(a, b) {
  return a - (b * Math.floor(a / b));
}

function jwday(j) {
  return mod(Math.floor((j + 1.5)), 7);
}

var Weekdays = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");

// LEAP_GREGORIAN  --  Is a given year in the Gregorian calendar a leap year ?
function leap_gregorian(year) {
  return ((year % 4) == 0) && (!(((year % 100) == 0) && ((year % 400) != 0)));
}

//GREGORIAN_TO_JD  --  Determine Julian day number from Gregorian calendar date
var GREGORIAN_EPOCH = 1721425.5;
function gregorian_to_jd(year, month, day) {
  return (GREGORIAN_EPOCH - 1) + (365 * (year - 1)) + Math.floor((year - 1) / 4) + (-Math.floor((year - 1) / 100)) + 
    Math.floor((year - 1) / 400) + Math.floor((((367 * month) - 362) / 12) + ((month <= 2) ? 0 : (leap_gregorian(year) ? -1 : -2)) + day);
}

//  JD_TO_GREGORIAN  --  Calculate Gregorian calendar date from Julian day
function jd_to_gregorian(jd) {
  var wjd, depoch, quadricent, dqc, cent, dcent, quad, dquad, yindex, dyindex, year, yearday, leapadj;
  wjd = Math.floor(jd - 0.5) + 0.5;
  depoch = wjd - GREGORIAN_EPOCH;
  quadricent = Math.floor(depoch / 146097);
  dqc = mod(depoch, 146097);
  cent = Math.floor(dqc / 36524);
  dcent = mod(dqc, 36524);
  quad = Math.floor(dcent / 1461);
  dquad = mod(dcent, 1461);
  yindex = Math.floor(dquad / 365);
  year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
  
  if (!((cent == 4) || (yindex == 4)))
    year++;

  yearday = wjd - gregorian_to_jd(year, 1, 1);
  leapadj = ((wjd < gregorian_to_jd(year, 3, 1)) ? 0 : (leap_gregorian(year) ? 1 : 2));
  month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
  day = (wjd - gregorian_to_jd(year, month, 1)) + 1;
  return new Array(year, month, day);
}

//  LEAP_PERSIAN  --  Is a given year a leap year in the Persian calendar ?
function leap_persian(year) {
  return ((((((year - ((year > 0) ? 474 : 473)) % 2820) + 474) + 38) * 682) % 2816) < 682;
}

//  PERSIAN_TO_JD  --  Determine Julian day from Persian date
var PERSIAN_EPOCH = 1948320.5;
var PERSIAN_WEEKDAYS = new Array("ÔäÈå", "íßÔäÈå", "ÏæÔäÈå", "Óå ÔäÈå", "åÇÑÔäÈå", "äÌÔäÈå", "ÌãÚå");

function persian_to_jd(year, month, day) {
  var epbase, epyear;
  epbase = year - ((year >= 0) ? 474 : 473);
  epyear = 474 + mod(epbase, 2820);
  return day + ((month <= 7) ? ((month - 1) * 31) :
    (((month - 1) * 30) + 6)) + Math.floor(((epyear * 682) - 110) / 2816) + (epyear - 1) * 365 + Math.floor(epbase / 2820) * 1029983 + 
    (PERSIAN_EPOCH - 1);
}

//  JD_TO_PERSIAN  --  Calculate Persian date from Julian day
function jd_to_persian(jd) {
  var year, month, day, depoch, cycle, cyear, ycycle, aux1, aux2, yday;
  jd = Math.floor(jd) + 0.5;
  depoch = jd - persian_to_jd(475, 1, 1);
  cycle = Math.floor(depoch / 1029983);
  cyear = mod(depoch, 1029983);
  if (cyear == 1029982)
    ycycle = 2820;
  else
  {
    aux1 = Math.floor(cyear / 366);
    aux2 = mod(cyear, 366);
    ycycle = Math.floor(((2134 * aux1) + (2816 * aux2) + 2815) / 1028522) +
    aux1 + 1;
  }
  
  year = ycycle + (2820 * cycle) + 474;
  
  if (year <= 0)
    year--;
  
  yday = (jd - persian_to_jd(year, 1, 1)) + 1;
  month = (yday <= 186) ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
  day = (jd - persian_to_jd(year, month, 1)) + 1;
  return new Array(year, month, day);
}

function calcPersian(year,month,day)
{
  var date,j;
  j = persian_to_jd(year,month,day);
  date = jd_to_gregorian(j);
  weekday = jwday(j);
  return new Array(date[0], date[1], date[2],weekday);
}

//  calcGregorian  --  Perform calculation starting with a Gregorian date
function calcGregorian(year,month,day)
{
  month--;
  var j, weekday;
  //  Update Julian day
  j = gregorian_to_jd(year, month + 1, day) + (Math.floor(0 + 60 * (0 + 60 * 0) + 0.5) / 86400.0);
  //  Update Persian Calendar
  perscal = jd_to_persian(j);
  weekday = jwday(j);
  return new Array(perscal[0], perscal[1], perscal[2],weekday);
}

function getTodayGregorian()
{
  var t = new Date();
  var today = new Date();
  var y = today.getYear();
  
  if (y < 1000)
      y += 1900;

  return new Array(y, today.getMonth() + 1, today.getDate(),t.getDay());
}

function getTodayPersian()
{
  var t = new Date();
  var today = getTodayGregorian();
  var persian = calcGregorian(today[0],today[1],today[2]);
  return new Array(persian[0],persian[1],persian[2],t.getDay());
}
String.prototype.toEnglishDigits = function() {
  var result = this.replace(/([^0-9,\u06F0-\u06F9,\u0660-\u0669])*/g, "");

  result = result.replace(/[\u06F0-\u06F9]+/g, function(digit) {

    var ret = '';

    for (var i = 0, len = digit.length; i < len; i++)
        ret += String.fromCharCode(digit.charCodeAt(i) - 1728);

    return ret;
  });

  return result.replace(/[\u0660-\u0669]+/g, function(digit) {

    var ret = '';

    for (var i = 0, len = digit.length; i < len; i++) {
        ret += String.fromCharCode(digit.charCodeAt(i) - 1584);
    }

    return ret;
  });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


if (window.location != window.parent.location) {
  location.href = "/Warning.aspx";
}

function DoPrint() {
  newwindow = window.open("", "result", "status=1,width=650,height=350,menubar=yes");
  newwindow.document.open("text/html", "replace");
  newwindow.document.write("<html><head><title>نتیجه پرداخت قبض</title> <link href=\"style/site1.css\" rel=\"stylesheet\" type=\"text/css\" /></head><body>");
  newwindow.document.write(document.getElementById("forPrint").innerHTML);
  newwindow.document.write("<body/><html/>");
  newwindow.document.close();
  newwindow.print();
}

function convertChars(e) {
  e.value = e.value.toEnglishDigits();
}

    
function getControl (controlID) {
  var control = document.getElementById('ctl00_' + controlID);
  return control;
} 
function hideAndUNhideObj(ThisObj) { 
  nav = document.getElementById(ThisObj).style 
  if (nav.display=="none")
    nav.display='block';
  else
    nav.display='none';
  var pc = new Cookie();
  pc.GetPageState();
  pc.Save();
}

function JustNum(e) {
  if (e.keyCode && e.keyCode != 0) {
    if (!(e.keyCode >= 48 && e.keyCode <= 57))
      e.keyCode = 0;
  }
  if (e.charCode && e.charCode != 0) {
    if (!(e.charCode >= 48 && e.charCode <= 57))
      e.preventDefault();
  }
}