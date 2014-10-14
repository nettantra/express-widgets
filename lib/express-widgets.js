module.exports = function(app) {
  var helpers = require('express-helpers')();
  var widgets = {};
  if (app) {
    var express = require('express');
  }
  
  var clone = function(original){
    var copy, target = {};
    for ( var name in original ) {
      if ( original[ name ] !== undefined ) 
        target[ name ] = original[ name ];
    }
    return target;
  }


  //can be strongly typed or not depending if it gives a value_type
  var getHtmlOptions = function(){
    var value_type, in_args;
    if(type.of(arguments[0]) == 'string'){
      value_type = arguments[0];
      in_args = arguments[1];
    }else
      in_args = arguments[0];

    var args = Array.prototype.slice.call(in_args),
      i = 0,
      value, html_options = {};
    
    if(args.length > 1){
      args.shift();//get rid of first arg
      if((value_type && type.of(args[0]) == value_type) ||
        (!value_type && type.of(args[0]) != 'object'  
              && type.of(args[0]) != 'function'
              && type.of(args[0]) != 'array')){
        value = args[0];
        i++;
      }
      while(args[i]){
        if(type.of(args[i]) == 'object') html_options = args[i];
        i++;
      }
    }
    if(value) html_options.value = html_options.value || value;
    return html_options;
  }

  var is=
  {
    Null:function(a){return a===null;},
    Undefined:function(a){return a===undefined;},
    nt:function(a){return(a===null||a===undefined);},
    Function:function(a){return(typeof(a)==='function')?a.constructor.toString().match(/Function/)!==null:false;},
    String:function(a){return(typeof(a)==='string')?true:(typeof(a)==='object')?a.constructor.toString().match(/string/i)!==null:false;    },
    Array:function(a){return(typeof(a)==='object')?a.constructor.toString().match(/array/i)!==null||a.length!==undefined:false;},
    Boolean:function(a){return(typeof(a)==='boolean')?true:(typeof(a)==='object')?a.constructor.toString().match(/boolean/i)!==null:false;},
    Date:function(a){return(typeof(a)==='date')?true:(typeof(a)==='object')?a.constructor.toString().match(/date/i)!==null:false;},
    HTML:function(a){return(typeof(a)==='object')?a.constructor.toString().match(/html/i)!==null:false;},
    Number:function(a){return(typeof(a)==='number')?true:(typeof(a)==='object')?a.constructor.toString().match(/Number/)!==null:false;},
    Object:function(a){return(typeof(a)==='object')?a.constructor.toString().match(/object/i)!==null:false;},
    RegExp:function(a){return(typeof(a)==='function')?a.constructor.toString().match(/regexp/i)!==null:false;}
  };
   
  var type={
    of:function(a){
      for(var i in is){
        if(is[i](a))
          return i.toLowerCase();
      }
    }
  };
  
  widgets.cmenu = function (menuData, menuOutput) {
    if (typeof menuOutput == "undefined")
      menuOutput = "";
    if (!menuData['items']) {
      menuOutput += (menuOutput) ? helpers.end_tag_for('ul') : "";
      return menuOutput;
    }
    var menuItems = menuData['items'];
    menuOutput += helpers.start_tag_for('ul', menuData['htmlOptions']);
    for(var i = 0; i < menuItems.length; i++) {
      menuOutput += helpers.start_tag_for("li", menuItems[i]['listHtmlOptions']);
      menuOutput += helpers.link_to(menuItems[i]['name'], menuItems[i]['url'], menuItems[i]['linkHtmlOptions']);
      menuOutput += widgets.cmenu(menuItems[i], menuOutput);
      menuOutput += helpers.end_tag_for("li");
    }
  };
  
  if(app){
    //3.x support
    if(type.of(app) == 'function'){
      for (var name in widgets) {
        app.locals[name] = widgets[name];
      }
      
      //add dynamic widgets
      app.use(function(req, res, next){
        res.locals.is_current_page = function(url){  
          var current_page = req.url,
              httpregex = /http:\/\/|https:\/\/|www\./g;
          return url === current_page ||  url.replace(httpregex,'')  === req.headers.host.replace(httpregex,'') + current_page
        }

        res.locals.link_to_unless_current = function(name, url, html_options){
          var current_page = req.url,
              httpregex = /http:\/\/|https:\/\/|www\./g;
          if(url != current_page && url.replace(httpregex,'')  != req.headers.host.replace(httpregex,'') + current_page)
            return link_to(name, url, html_options)
        }

        next();
      })
    }
    //2.x support 
    else if ((express.Server && app instanceof express.Server) || app instanceof express.HTTPServer || app instanceof express.HTTPSServer) {
      var obj = {};
      if ((express.Server && app instanceof express.Server) || app instanceof express.HTTPServer || app instanceof express.HTTPSServer) {
        for (name in widgets) {
          obj[name] = widgets[name];
        }
      }
      app.widgets(obj);

      //add dynamic widgets
      app.dynamicWidgets({
        is_current_page: function(req, res, next){
          var func = function(url){  
            var current_page = req.url,
                httpregex = /http:\/\/|https:\/\/|www\./g;
            return url === current_page ||  url.replace(httpregex,'')  === req.headers.host.replace(httpregex,'') + current_page
          }
          return func
        },
        link_to_unless_current: function(req, res, next){
          var func = function(name, url, html_options){
            var current_page = req.url,
                httpregex = /http:\/\/|https:\/\/|www\./g;
            if(url != current_page && url.replace(httpregex,'')  != req.headers.host.replace(httpregex,'') + current_page)
              return link_to(name, url, html_options)
          }
          return func;
        }
      })
    }
  }
  
  return widgets;
}
