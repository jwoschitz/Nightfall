define(function() {	
  var userAgent = navigator.userAgent.toLowerCase();
  
  return {
      version: (userAgent.match( /.+(?:rv|it|ra|ie|me)[\/: ]([\d.]+)/ ) || [])[1],
      chrome: /chrome/.test( userAgent ),
      safari: /webkit/.test( userAgent ) && !/chrome/.test( userAgent ),
      opera: /opera/.test( userAgent ),
      msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
      mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent )
  }
});