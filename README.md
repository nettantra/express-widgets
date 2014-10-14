# Express Widgets

Express Widgets is a port of Yii framework's Zii Widgets.

## Installation
   
    npm install express-widgets
    
## How to use

Require express and create a server.

    var express = require('express');
    var app = express.createServer();

To automatically inclue all widgets initialize like this. 

    var widgets = require('express-widgets')(app);

Or more simply if you don't need any reference to the widgets object

    require('express-widgets')(app);
    
If you want to only use some widgets require without the app and register necessary view widgets...

    var widgets = require('express-widgets')();

    app.widgets({
       date_tag: widgets.date_tag
    });

Then use it in a ejs view like a rails view

    <% emenu("my_menu", {
      'items': [
        {
          'label': 'Home',
          'url': '/'
        }
      ]
    }) %>


For more help and usage instructions see the [WIKI](https://github.com/nettantra/express-widgets/wiki)
