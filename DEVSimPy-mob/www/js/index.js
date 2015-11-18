var key = "";

//var urls = [];
//localStorage["urls"] = JSON.stringify(urls);
// For removing single Key
//localStorage.removeItem("urls");

var add_url = function (ip) {
    var urls = JSON.parse(localStorage["urls"]);
    if ($.inArray(ip, urls) < 0) {
        urls.push(ip);
        localStorage.setItem('urls', JSON.stringify(urls));
    }
}

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

function isValidURL(url) {
    var isValid = false;

    $.ajax({
        url: url + "info",
        type: "get",
        async: false,
        dataType: "json",
        success: function (data) {
            isValid = data != null;
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
                    <a class=\"icon icon-close pull-right\" onClick=\"window.location='index.html?view=" + redirect + "'\"></a>\
                    <h1 class=\"title\">Information</h1>\
                    </header>\
                    <div class=\"content\">"
                    + info +
                    "</div>").appendTo("#info");
    $("#info").addClass("active");
};

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {
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


function getParameterByName(param) {
    var results = new RegExp('[\?&]' + param + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    } else {
        return results[1] || 0;
    }
}

function renderView(controller) {

    if (!controller) {
        controller = getParameterByName("view");
    }
    if (controller) {
        $("#container").load("views/modules/" + controller + ".html", function () {
            $(this).trigger('document_change');
        });
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
    $.each(data['content'], function (filename, info) {

        // remove stored yaml
        var url = sessionStorage.ip + "json?name=" + filename;
        if (localStorage[url]) {
            localStorage.removeItem(url)
        }

        items.push(
            "<li class='table-view-cell media'>\
                <a class='navigate-right' onClick=\"document.location.href='index.html?view=dsp&name="+ filename + "'\" data-transition='slide-in'>\
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

function list_labels(data, filename) {

    // remove stored yaml
    var url = sessionStorage.ip + "yaml/labels?name=" + filename;
    if (localStorage[url]) {
        localStorage.removeItem(url)
    }

    // insert the first separator before populate the list of models 
    var code = "<li class=\"table-view-cell table-view-divider\">Models settings</li>"
    $("<ul/>", {
        "class": "table-view",
        html: code
    }).appendTo("#setting");

    //populate the list
    var items = [];
    
    $.each(data['output'], function (id, name) {
        items.push(
            "<li class='table-view-cell'>\
                <a class='navigate-right' onClick=\"document.location.href='index.html?view=model_param&model=" + name + "&dsp=" + filename + "'\" data-transition='slide-in'> \
                    <div class='media-body'>\
                    " + name + "</div>\
                </a>\
            </li>" );
    });

    $("<ul/>", {
        "class": "table-view",
        html: items.join("")
    }).appendTo("#setting");

    // close the list by inserting the simulation options
    var code = "<li class=\"table-view-cell table-view-divider\">Simulation settings</li> \
     <li class=\"table-view-cell\"> \
               <form class=\"input-group\"> \
                    <div class=\"input-row\"> \
                        <label>Time</label> \
                            <input id=\"time\" type=\"text\" value=\"10\" maxlength=\"4\"> \
                        </div> \
                    </form> \
     </li> "
    $("<ul/>", {
        "class": "table-view",
        html: code
    }).appendTo("#setting");

};

function parse_result(data) {

    var filename = data['file'].replace(/.*\/|\.[^.]*$/g, '') + '.yaml';
    var time = data['time'];

    var items = [];
    $.each(data, function (key, val) {
        if (key == 'time' || key == 'date' || key == 'duration') {
            items.push(
                "<li class=\"table-view-cell\">" + key + "<span class=\"badge\">" + val + "</span></li>"
            );
        } else if (key == 'output') {
            items.push(
                "<li class=\"table-view-divider\">Generated files</li>"
            );
            // list output .dat files
            $.each(val, function (index, v) {
                items.push(
                    "<li class='table-view-cell media'>\
                    <a class='navigate-right' onClick=\"document.location.href='index.html?view=plot&name="+ v['name'] + "&time=" + time + "&filename=" + filename + "'\" data-transition='slide-in'>\
                        <div class='media-body'>\
                        <p>" + v['name'] + "</p>\
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

function parse_dsp(data, dsp) {

    var obj = data[dsp];
    // var atomic_models = obj[0].models[0].atomic_models;
    // var coupled_models = obj[0].models[0].coupled_models;
    // var connections = obj[0].models[0].connections;
    var cells = obj[0];
    var description = obj[1].description != "" ? obj[1].description : "No description for this model.";

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

function plot(filename, data) {
    FusionCharts.ready(function () {
        var salesChart = new FusionCharts({
            type: 'scrollline2d',
            dataFormat: 'json',
            renderAt: 'plot',
            width: $(document).width() - 30,
            height: $(document).height() - ($("#head2").height() + $("header").height() + 50),
            dataSource: data
        }).render();
    });
}

function discon() {
    // disconnect();
    delete sessionStorage.ip;
    sessionStorage.clear();
};

function draw(json) {
    var graph = new joint.dia.Graph;

    var paper = new joint.dia.Paper({
        el: $('#paper'),
        width: $(document).width() - 30,
        height: $(document).height() - ($("#head2").height() + $("header").height() + 50),
        gridSize: 1,
        model: graph,
        perpendicularLinks: true
    });

 //   PreventGhostClick("#paper");

 //   $("#paper").hammer().bind("doubletap", function (ev) {
 //       console.log('test');
 //   });

    // double click on model
   paper.on('cell:pointerdblclick',
    function (cellView, evt, x, y) {
        var dsp = $('#dsp').text();
        var m = cellView.model
        //var data = m.attributes.prop.data;

        window.location = "index.html?view=model_param&model=" + m.id + "&dsp=" + dsp + '.yaml';
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
    window.tlantic.plugins.socket.disconnect(stub, stub, sessionStorage.getItem('ip') + ':80');
};

function disconnectAll() {
    window.tlantic.plugins.socket.disconnectAll(stub, stub);
};

function isConnected() {
    window.tlantic.plugins.socket.isConnected(key, stub, stub);
};

function simulate(filename, time) {

    var url = sessionStorage.ip + "simulate?name=" + filename + "&time=" + time;

    console.log(url);

    getCache(url).then(function (data) {
        $('#spinner').show();
        parse_result(data);
        $('#spinner').hide();
    });
};

function hidePopover() {
    var popovers = $('.popover');
    $(popovers).removeClass('visible');
    $(popovers).removeClass('active');
    $(popovers).hide();
    $("div.backdrop").remove();
}

$(document).ready(function () {

    // $.ajaxSetup({ cache: false });

    /*    $.ajaxSetup({
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

    //$('body').on('click', 'a', renderView());

    if (is_connected()) {
        
        session_get();

        $("body").on('click', '#disconnect', function (event) {
            function onConfirm(buttonIndex) {
                //alert('You selected button ' + buttonIndex);
                if (buttonIndex == '1') {
                    discon();
                    window.location = "index.html";
                }
            }

            navigator.notification.confirm(
                'Are you sure you want to quit DEVSimPy-mob?', // message
                 onConfirm,            // callback to invoke with index of button pressed
                'Warning',           // title
                ['Yes', 'No']     // buttonLabels
            );
            
        });

        $("body").on('click', '#list', function (event) {
            hidePopover();
            // remove diagram from localstorage (for getCache)
            window.location = "index.html?view=listing_dsp";
        });

        var controller = getParameterByName("view");

        if (controller == "listing_dsp") {
            renderView(controller);

            // Information menu has been clicked
            $("body").on('click', '#information', function (event) {
                hidePopover();
                $.getJSON(sessionStorage.ip + "info")
                .done(function (data) {
                    alert_dial("<p class=\"content-padded\">DEVSimPy-mob is a mobile app which aims to simulate DEVSimPy models from mobile environement.</p><br />" +
                            "<p><b>DEVSimPy-mob specifications:</b></p> <ul>" +
                               "<li> <p><b>DEVSimPy version:</b> " + data['devsimpy-version'] + "</p></li>" +
                               "<li> <p><b>DEVSimPy libs:</b> " + data['devsimpy-libraries'] + "</p></li>" +
                               "<li> <p><b>DEVSimPy plugins:</b> " + data['devsimpy-plugins'] + "</p></li>" +
                               "</ul>" +
                               "<p><b> RestFull Server specification </b></p>" +
                               "<ul>" +
                               "<li><p>URL: " + data['url-server'] + "</p></li>" +
                               "<li><p>Python version: " + data['python-version'] + "</p></li>" +
                               "<li><p>Machine: " + data['machine-server'] + "</p></li>" +
                               "<li><p>OS: " + data['os-server'] + "</p></li>" +
                               "</ul>"

                            );
                })
                .fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                });
            });

            // define function to populate the list of yaml files stored in the server
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

            // Refresh button has been clicked
            $("body").on('click', '#refresh', function (event) {
                hidePopover();
                // clear before populate the list
                $("#content-padded").empty();
                populate();
            });

            // populate the model list
            populate();

        } else if (controller == "dsp") {
            renderView(controller);

            var name = getParameterByName("name");
            var url1 = sessionStorage.ip + "json?name=" + name
            var url2 = sessionStorage.ip + "yaml/labels?name=" + name

            // back button has been clicked
            $("body").on('click', '#back_list', function (event) {
                // remove diagram from localstorage (for getCache)
                localStorage.removeItem(url1);
                // redirect to the list of dsp (yaml)
                window.location = "index.html?view=listing_dsp";
            });

            // Information item menu has been clicked
            $("body").on('click', '#information', function (event) {
                hidePopover();
                alert_dial("<p class=\"content-padded\"> Feel free to edit or simualte the current model.</p>", "dsp&name=" + name);
            });

            // Ajax call for model parsing
            getCache(url1).then(function (data) {

                $('#spinner1').show();
                parse_dsp(data, name);
                $('#spinner1').hide();

                // completed
                $("<h1 id=\"dsp\" class=\"title\">" + name.replace(/(.*)\.[^.]+$/, "$1") + "</h1>").appendTo('header');

                $('body').on('click', '#simulate', function (event) {
                    var time = $('#time').val();

                    if (isNumeric(time)) {
                        //clear simulation result
                        url = sessionStorage.ip + "simulate?name=" + name + "&time=" + time;
                        if (localStorage.getItem(url)) {
                            localStorage.removeItem(url);
                        }
                        window.location = "index.html?view=result&name=" + name + "&time=" + time;
                    } else {

                        alert_dial("<p class=\"content-padded\"> Time must be digit value.</p>", "dsp&name=" + name);
                    }
                });
            });

            // Ajax call for model parsing
            getCache(url2).then(function (data) {

                $('#spinner2').show();
                list_labels(data, name);
                $('#spinner2').hide();

                // completed
            });

        } else if (controller == "model_param") {
            renderView(controller);

            var dsp = getParameterByName("dsp");
            var model = getParameterByName("model");

            $(document).on('document_change', function () {
                $("<h1 id='dsp' class=\"title\">" + model + "</h1>").appendTo('header');
            });

            // back button has been cliked
            $("body").on('click', '#back_model', function (event) {
                window.location = "index.html?view=dsp&name=" + dsp;
            });

            // save button has been clicked
            $("body").on('click', '#save_yaml', function (event) {

                var jqxhr = $.getJSON(sessionStorage.ip + "json?name=" + dsp)
                .done(function (data) {

                    var cells_tab = data[dsp][0]['cells'];
                    var i;
                    for (i = 1; i < cells_tab.length; ++i) {
                        if (cells_tab[i]['id'] == model) {
                            var prop_obj = cells_tab[i]['prop']['data'];
                            new_json_part = { 'filename': dsp, 'model': model, 'args': {} }
                            for (name in prop_obj) {
                                // get input value from form of the mobile app
                                var new_val = $("#" + name).val();

                                //if (isNumeric(new_val)) {
                                //    new_val = parseFloat(new_val);
                                //} else if (name == "fileName") {
                                //console.log(prop_obj[name]);
                                //console.log(new_val);
                                //    var v = new_val;
                                //    new_val = v;
                                //} else if (new_val == 'false' || new_val == 'true') {
                                //    new_val = JSON.parse(new_val);
                                //}

                                new_json_part['args'][name] = new_val;

                                // update val into data object
                                //data[dsp][0]['cells'][i]['prop']['data'][name] = new_val;
                            }
                        }
                    }
                    //console.log(JSON.stringify(new_json_part));
                    $.ajax
                    ({
                        type: 'POST',
                        url: sessionStorage.ip + "yaml/save",
                        data: JSON.stringify(new_json_part),
                        contentType: "application/json; charset=utf-8",
                        dataType: 'json',
                        success: function (data) {
                            function alertDismissed() {
                                console.log(data);
                            }

                            navigator.notification.alert(
                                'Properties updated!',  // message
                                alertDismissed,         // callback
                                'Warning',            // title
                                'Ok'                  // buttonName
                            );
                            //alert_dial("<p class=\"content-padded\"> Properties updated!</p>", "dsp&name=" + dsp);
                        }
                    });

                })
                .fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                });

            });

            // Ajax call for properties parsing
            var jqxhr = $.getJSON(sessionStorage.ip + "json?name=" + dsp)
                .done(function (data) {
                    $('#spinner').show();
                    parse_prop(data, model, dsp);
                    $('#spinner').hide();
                })
                .fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                })
                //.always(function () {
                //       $("<h1 id='dsp' class=\"title\">" + model + "</h1>").appendTo('header');
                // });

        } else if (controller == "plot") {
            renderView(controller);

            var name = getParameterByName("name");
            var dsp = getParameterByName("filename");
            var time = getParameterByName("time");
            var url = sessionStorage.ip + "plot?name=" + name;

            // document_change event is triggered by the renderView function in order to be sure that the page is loaded
            $(document).on('document_change', function () {
                $("<h1 class=\"title\">" + name + "</h1>").appendTo('header');
            });

            // back_result button has been clicked
            $("body").on('click', '#back_result', function (event) {
                window.location = "index.html?view=result&name=" + dsp + "&time=" + time;
            });

            // Ajax call for plotting simulation results
            var jqxhr = $.getJSON(url)
                .done(function (data) {
                    plot(name, data);
                })
                .fail(function (jqxhr, textStatus, error) {
                    var err = textStatus + ", " + error;
                    console.log("Request Failed: " + err);
                });    

        } else if (controller == "result") {
            renderView(controller);

            var name = getParameterByName("name");
            var time = getParameterByName("time");

            // back button has been clicked
            $("body").on('click', '#back_sim', function (event) {
                window.location = "index.html?view=dsp&name=" + name;
            });

            // performing simulation
            simulate(name, time);

        } else {
            window.location = "index.html?view=listing_dsp";
        }

    } else {
        // connect view 

        renderView();

        // document_change event is triggered by the renderView function in order to be sure that the page is loaded
        $(document).on('document_change', function () {
            // sure that datalist element exist
            if ($('#datalist')) {
                try {
                    //console.log(localStorage.getItem("urls"));
                    // restore urls list from localstorage and populate the datalist
                    $.each(JSON.parse(localStorage.getItem("urls")), function (index, value) {
                        $("<option value='" + value + "'>").appendTo($('#datalist'));
                    });
                } catch (e) {
                    localStorage.setItem('urls', JSON.stringify([]));
                }
            }
        });

        $('body').on('submit', '#connection', function (event) {
            var ip = $("#ip").val();
            var username = $("#username").val();
            var password = $("#password").val();
            var address = 'http://';

            // devsimpy rest server need authentication ? 
            if (username != "" && password != "") {
                address += username + ":" + password + "@" + ip + '/';
            } else {
                address += ip + '/';
            }

            // if URL is valid
            if (isValidURL(address)) {
                // store the address in urls list object in the localstorage
                add_url(ip);
                session_reg(address);
            } else {
                alert_dial(" <p class=\"content-padded\"> Please enter correct url and check first if you have network and second if the devsimpy rest server needs authentication.</p>", "home");
                event.preventDefault();
            }
        });
    }
});
