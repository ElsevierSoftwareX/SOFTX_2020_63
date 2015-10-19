var key = "";

var getCache = function (url) {

    var supportsLocalStorage = 'localStorage' in window;

    // Both functions return a promise, so no matter which function
    // gets called inside getCache, you get the same API.

    function getJSON(url) {

        var promise = $.getJSON(url);

        promise.done(function (data) {
            localStorage.setItem(url, JSON.stringify(data));
        });

        console.log('%c' + url + ' fetched via AJAX', 'color: orange');

        return promise;

    }

    function getStorage(url) {

        var storageDfd = new $.Deferred(),
            storedData = localStorage.getItem(url);

        if (!storedData) {
            return getJSON(url);
        }

        setTimeout(function () {
            storageDfd.resolveWith(null, [JSON.parse(storedData)]);
        });

        console.log('%c' + url + ' fetched via localStorange', 'color: blue');

        return storageDfd.promise();

    }

    return supportsLocalStorage ? getStorage(url) : getJSON(url);

};
/*jQuery.ajaxSetup({
    beforeSend: function () {
        $('#spinner').show();
    },
    complete: function () {
        $('#spinner').hide();
    },
    success: function () {
        $('#spinner').hide();
    }
});
*/

function isValidURL(url) {
    var encodedURL = encodeURIComponent(url);
    var isValid = false;

    $.ajax({
        url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22" + encodedURL + "%22&format=json",
        type: "get",
        async: false,
        dataType: "json",
        success: function (data) {
            isValid = data.query.results != null;
        },
        error: function () {
            isValid = false;
        }
    });
    
    return isValid;
};

function isNumeric(obj) {
    return obj - parseFloat(obj) >= 0;
};

function alert_dial(info, redirect) {
    $("<header class=\"bar bar-nav\">\
                    <a class=\"icon icon-close pull-right\" onClick=\"window.location='index.html?view=" + redirect+ "'\"></a>\
                    <h1 class=\"title\">Information</h1>\
                    </header>\
                    <div class=\"content\">\
                    <p class=\"content-padded\">"+ info + "</p>\
                    </div>").appendTo("#info");
    $("#info").addClass("active");
};

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {

        // Check if the XMLHttpRequest object has a "withCredentials" property.
        // "withCredentials" only exists on XMLHTTPRequest2 objects.
        xhr.open(method, url, true);

    } else if (typeof XDomainRequest != "undefined") {

        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
        xhr = new XDomainRequest();
        xhr.open(method, url);

    } else {

        // Otherwise, CORS is not supported by the browser.
        xhr = null;

    }
    return xhr;
}


function getParameterByName(param)
{
    var results = new RegExp('[\?&]' + param + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    } else {
        return results[1] || 0;
    }
}  

function renderView(controller) {
   
    if (!controller) {
        controller = getParameterByName("view");
    }
    if (controller){
        $("#container").load("views/modules/"+controller+".html");
    } else {
        renderView("home");
    }
};

function session_reg(ip) {
    if (sessionStorage !== null) {
        sessionStorage.setItem('ip', ip);
        connect();
        //if (is_connected()) {
        //    alert("Well connected!");
        //}
    } else {
        alert('Session storage not supported!');
    }
};

function is_connected() {
    return sessionStorage.getItem('ip') !== null;
};

function session_get() {
    if (sessionStorage.ip !== "") {
        var session_ip = sessionStorage.getItem('ip');
        var session_host = session_ip
    } else {
        alert('Session storage not supported!');
    }
};

function list_param(data) {

    $.each(data['content'], function (key, val) {
        items.push(
            "<li class='table-view-cell media'>\
                <a class='navigate-right' onClick=\"document.location.href='index.html?view=dsp&name="+ key + "'\" data-transition='slide-in'>\
                    <div class='media-body'>\
                    "+ key + "\
                    </div>\
                </a>\
            </li>" );
    });

    $("<ul/>", {
        "class": "table-view",
        html: items.join("")
    }).appendTo("#content-padded");
}

function list_dsp(data) {

        var items = [];
        // display filename of yaml file with last modified date and size
        $.each(data['content'], function(filename, info){
            items.push(
                "<li class='table-view-cell media'>\
                <a class='navigate-right' onClick=\"document.location.href='index.html?view=dsp&name="+filename+"'\" data-transition='slide-in'>\
                    <span class=\"media-object pull-left icon icon-pages\"></span>\
                    <div class='media-body'>\
                    " + filename.replace(/(.*)\.[^.]+$/, "$1") +
                    "<p>" + info["last modified"] + "<br />" + info["size"] + "</p>\
                    </div>\
                </a>\
            </li>" );
        });

        $("<ul/>", {
            "class": "table-view",
            html: items.join("")
        }).appendTo("#content-padded");
};

function parse_result(data) {

    var filename = data['file'].replace(/.*\/|\.[^.]*$/g, '')+'.yaml';
    var time = data['time'];

    var items = [];
    $.each(data, function (key, val) {
        if (key == 'time' || key == 'date' || key == 'duration') {
            items.push(
                "<li class=\"table-view-cell\">"+key+"<span class=\"badge\">" + val + "</span></li>"
            );
        } else if (key == 'output'){
            items.push(
                "<li class=\"table-view-divider\">Generated files</li>"
            );
            // list output .dat files
            $.each(val, function (index, v) {
                items.push(
                    "<li class='table-view-cell media'>\
                    <a class='navigate-right' onClick=\"document.location.href='index.html?view=plot&name="+v['name']+"&time="+time+"&filename="+filename+"'\" data-transition='slide-in'>\
                        <div class='media-body'>\
                        <p>" + v['name']+"</p>\
                        </div>\
                    </a>\
                </li>" 
                );
            });
        } 
    });

    $("<br /><p style='text-align: center;'>Simulation succeffuly completed!</p>").insertBefore('.card');

    $("<ul/>", {
        "class": "table-view",
        html: items.join("")
    }).appendTo("#result");
}

function parse_dsp(data, dsp){

    var obj = data[dsp];
    // var atomic_models = obj[0].models[0].atomic_models;
    // var coupled_models = obj[0].models[0].coupled_models;
    // var connections = obj[0].models[0].connections;
    var cells = obj[0];
    var description = obj[1].description;

    draw(cells);

    // add description Segmented control
    $("<p>" + description + "</p>").appendTo("#description");
   
};

function parse_prop(data, model, dsp) {

    var obj = data[dsp];

    for (item in obj[0].cells) {
        var elem = obj[0].cells[item];
        var typ = elem.type;
        
        if (typ == 'devs.Atomic' && elem.id == model) {
            var prop = elem.prop.data;
            var items = [];

            $.each(prop, function (key, val) {
                items.push(
                    "<div class=\"input-row\">" +
                    "<label>" + key + "</label>" +
                    "<input name=\"" + key + "\" id=\"" + key + "\" type=\"text\" value=\"" + val + "\" />" +
                    "</div>");
            });

            $("<form/>", {
                "class": "input-group",
                html: items.join("")
            }).appendTo("#param");
        };
    };
};

function plot(filename) {
    $(document).ready(function () {
        $("<h1 class=\"title\">" + filename + "</h1>").appendTo('header');
        $("<p>graph!</p>").appendTo("#plot");
        console.log(filename);
    });
}

function discon(){
    // disconnect();
    delete sessionStorage.ip;
    sessionStorage.clear();
    //alert('Disconnected!');
};

function draw(json) {
    var graph = new joint.dia.Graph;

    var paper = new joint.dia.Paper({
        el: $('#paper'),
        width: $(document).width()-30,
        height: $(document).height()-($("#head2").height()+$("header").height()+50),
        gridSize: 1,
        model: graph,
        perpendicularLinks: true
    });

    // double click on model
    paper.on('cell:pointerdblclick',
    function (cellView, evt, x, y) {
        var dsp = $('#dsp').text();
        var m = cellView.model
        //var data = m.attributes.prop.data;

        window.location = "index.html?view=model_param&model=" + m.id + "&dsp=" + dsp+'.yaml';
    });

    graph.fromJSON(json);
    paper.scaleContentToFit();
    paper.setOrigin(paper.options.origin["x"], 50);
    // console.log(paper.options.origin);
}

function stub(d) {
    console.log(d);
};

function onConnect(k) {
    console.log('Established connection with ', k);
    key = k;
};

function connect() {
    window.tlantic.plugins.socket.connect(onConnect, stub, sessionStorage.getItem('ip'), 80);
    //window.tlantic.plugins.socket.connect(stub, stub, host, 18004);
};

function send(data) {
    window.tlantic.plugins.socket.send(stub, stub, key, data);
};

function disconnect() {
    window.tlantic.plugins.socket.disconnect(stub, stub, sessionStorage.getItem('ip')+':80');
};

function disconnectAll() {
    window.tlantic.plugins.socket.disconnectAll(stub, stub);
};

function isConnected() {
    window.tlantic.plugins.socket.isConnected(key, stub, stub);
};

function simulate(filename, time) {

    var url = sessionStorage.ip + "simulate?name=" + filename + "&time=" + time;

    var jqxhr = $.getJSON(url, function () {
                    console.log("success");
                })
                .done(function (data) {
                    $('#spinner').show();
                    parse_result(data);
                    $('#spinner').hide();
                })
                .fail(function () {
                    alert_dia("Error during simulation. Please check the model!", "dsp&name=" + filename);
                });
  
//    var jqxhr = $.ajax(url)
//    .done(function (html) {
//        console.log(data);
//        $("#result").html(data);
//    })
//    .fail(function () {
//        alert_dia("Error during simulation. Please check the model!", "dsp&name=" + filename);
//    });

};

$(document).ready(function(){

    // $.ajaxSetup({ cache: false });

    //$('body').on('click', 'a', renderView());
   
    if (is_connected()) {

        session_get();
        
        //discon();

        $("body").on('click', '#disconnect', function (event) {
            discon();
            window.location = "index.html";
        });

        $("body").on('click', '#list', function (event) {
            window.location = "index.html?view=listing_dsp";
        });

        $("body").on('click', '#information', function (event) {
            alert_dial("DEVSimPy-mob is a mobile app which aims to simulate DEVSimPy models from mobile environement.", this.location);
        });

        var controller = getParameterByName("view");

        console.log(controller);

        if (controller == "listing_dsp") {
            renderView(controller);
           
            // define function to populate the list of yaml file stored in the server
            var populate = function () {
                $.getJSON(sessionStorage.ip + "yaml?filenames")
                .done(function (data) {
                    list_dsp(data);
                })
                .fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                });
            };

            $("body").on('click', '#refresh', function (event) {
                // clear before populate the list
                $("#content-padded").empty();

                populate();
            });

            populate();

        } else if (controller == "dsp") {
            renderView(controller);

            var name = getParameterByName("name");
            var url = sessionStorage.ip + "json?name=" + name

            $("body").on('click', '#back_list', function (event) {
                // remove diagram from localstorage (for getCache)
                localStorage.removeItem(url);
                // redirect to the list of dsp (yaml)
                window.location = "index.html?view=listing_dsp";
            });

            getCache(url).then(function (data) {
                $('#spinner').show();
                parse_dsp(data, name);
                $('#spinner').hide();

                // completed
                $("<h1 id=\"dsp\" class=\"title\">" + name.replace(/(.*)\.[^.]+$/, "$1") + "</h1>").appendTo('header');

                $('body').on('click', '#simulate', function (event) {
                    var time = $('#time').val();

                    if (isNumeric(time)) {
                        window.location = "index.html?view=result&name=" + name + "&time=" + time;
                    } else {
                        alert_dial("Time must be digit value.", "dsp&name=" + name);
                    }
                });

            });

 /*           var jqxhr = $.getJSON(url)
                .done(function (data) {
                    //ActivityIndicator.show("sdc");
                    parse_dsp(data, name);
                    $('#spinner').hide();
                    //ActivityIndicator.hide();
                })
                .fail(function( jqxhr, textStatus, error ) {
                        var err = textStatus + ", " + error;
                        console.log( "Request Failed: " + err );
            });

            // only when model has been correctly loaded 
            jqxhr.complete(function () {
               $("<h1 id=\"dsp\" class=\"title\">" + name.replace(/(.*)\.[^.]+$/, "$1") + "</h1>").appendTo('header');

               $('body').on('click', '#simulate', function (event) {
                   var time = $('#time').val();

                   if (isNumeric(time)) {
                       window.location = "index.html?view=result&name="+name+"&time="+time;
                   } else {
                       alert_dial("Time must be digit value.", "dsp&name=" + name);
                   }
               });
            });
*/
        } else if (controller == "model_param") {
            renderView(controller);

            var dsp = getParameterByName("dsp");
            var model = getParameterByName("model");
          
            $("body").on('click', '#back_model', function (event) {
                window.location = "index.html?view=dsp&name=" + dsp;
            });

            $("body").on('click', '#save_yaml', function (event) {
                var jqxhr = $.getJSON(sessionStorage.ip + "json?name=" + dsp)
                .done(function (data) {
                    
                    var cells_tab = data[dsp][0]['cells'];
                    var i;
                    for (i = 1; i < cells_tab.length; ++i) {
                        if (cells_tab[i]['id'] == model) {
                            var prop_obj = cells_tab[i]['prop']['data'];
                            new_json_part = { 'filename': dsp, 'model':model, 'args': {} }
                            for (name in prop_obj) {
                                // get input value from form of the mobile app
                                var new_val = $("#" + name).val();

                                new_json_part['args'][name] = new_val

                                // update val into data object
                                //data[dsp][0]['cells'][i]['prop']['data'][name] = new_val;
                            }
                        }
                    }
                    //console.log(new_json_part);
                    $.ajax
                    ({
                        type: 'POST',
                        url: 'http://lcapocchi.pythonanywhere.com/yaml/save',
                        data: JSON.stringify(new_json_part),
                        contentType: "application/json; charset=utf-8",
                        dataType: 'json',
                        success: function (data) {
                            //$.each(data, function (index, value) {
 //                           //    alert("index: " + index + " , value: " + value);
                            //                           //});
                            //console.log(data);
                            alert_dial("Modification have been applied!", "dsp&name=" + dsp);
                        }
                    });

                })
                .fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                });

            });

            var jqxhr = $.getJSON(sessionStorage.ip + "json?name=" + dsp)
                .done(function (data) {
                    $('#spinner').show();
                    parse_prop(data, model, dsp);
                    $('#spinner').hide();
                })
                .fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                });

            // only when model has been correctly loaded 
            jqxhr.complete(function () {
                $("<h1 id='dsp' class=\"title\">" + model + "</h1>").appendTo('header');
            });

        } else if (controller == "plot") {
            renderView(controller);

            var filename = getParameterByName("name");
            var time = getParameterByName("time");
           
            $("body").on('click', '#back_result', function (event) {
                window.location = "index.html?view=result&name="+filename+"&time="+time;
            });

            var jqxhr = $.getJSON(sessionStorage.ip + "json?name=" + dsp)
                .done(function (data) {
                    //$('#spinner').show();
                    plot(filename);
                    //$('#spinner').hide();
                })
                .fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                });

            // only when model has been correctly loaded 
            //jqxhr.complete(function () {
            //    $("<h1 id='dsp' class=\"title\">" + model + "</h1>").appendTo('header');
            //});           

        } else if (controller == "result") {
            renderView(controller);

            var name = getParameterByName("name");
            var time = getParameterByName("time");

            $("body").on('click', '#back_sim', function (event) {
                  window.location = "index.html?view=dsp&name=" + name;
            });

            // performing simulation
            simulate(name, time);
    
        } else {
            window.location = "index.html?view=listing_dsp";            
        }
        
        //document.addEventListener(window.tlantic.plugins.socket.receiveHookName, function (ev) {
        //    console.log('Data has been received: ', JSON.stringify(ev.metadata));
        //    alert(ev.metadata.data);
        //    var p = JSON.parse(ev.metadata.data);
        //        console.log(p);
        //    });

    } else {

        renderView();

        $('body').on('submit', '#connection', function (event) {
            var ip = $("#ip").val();
            var username = $("#username").val();
            var password = $("#password").val();

            // devsimpy rest server need authentication ? 
            if (username != "" && password != ""){
                var address = 'http://'+ username + ":" + password +"@"+ ip + '/';
            } else {
                var address = 'http://' + ip + '/';
            }

            if (isValidURL(address)) {
                session_reg(address);
            } else {
                alert_dial("Please enter correct url and check if the devsimpy rest server needs authentication.", "home");
                event.preventDefault();
            }
        });
    }
});
