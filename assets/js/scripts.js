var getCurrentTab = function(passThru, callBack) {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function(tabs) {
        passThru.link = tabs[0];
        passThru.link.isRead = 0;
        callBack(passThru);
    });
};

var getLinks = function(passThru, callBack) {
    if (passThru.key !== undefined) {
        chrome.storage.sync.get(passThru.key, function(link) {
            passThru.link = link;
            if (link === undefined ? passThru.linksExist = 0 : passThru.linksExist = 1);
            callBack(passThru);
        });
    } else {
        chrome.storage.sync.get(function(currentLinks) {
            passThru.currentLinks = currentLinks;
            if (currentLinks === undefined ? passThru.linksExist = 0 : passThru.linksExist = 1);
            callBack(passThru);
        });
    }
};

var addLink = function(passThru, callBack) {
    var dateAdded = new Date();
    link = {
        'url': passThru.link.url,
        'title': passThru.link.title,
        'isRead': passThru.link.isRead,
        'dateAdded': dateAdded.toISOString()
    };

    var key = passThru.link.title
    var newLink = {};
    newLink[key] = link;
    chrome.storage.sync.set(newLink, function() {
        console.log('Saved', key);
        getLinks({}, refreshLinkList);
    });
};

var refreshLinkList = function(passThru) {
    $('.unreadLinks').empty();
    $('.readLinks').empty();
    var displayList = '';
    var linkType = '';
    var unReadCount = 0;
    var readCount = 0;
    var linksObject = passThru.currentLinks;

    var linksArray = [];
    for (var key in linksObject) {
        linksArray.push([linksObject[key].dateAdded, linksObject[key]])
    }
    linksArray.sort(function(a, b) {
        return new Date(b[0]) - new Date(a[0])
    })

    if (linksArray != undefined) {
        for (var i = 0; i < linksArray.length; i++) {
            if (linksArray[i][1].isRead === 0) {
                unReadCount++;
                displayList = '.unreadLinks';
                linkType = 'unRead';
            } else {
                readCount++;
                displayList = '.readLinks';
                linkType = 'read';
            }
            var truncatedTitle = linksArray[i][1].title.substring(0, 35);

            if (linksArray[i][1].title.length > 35) {
                truncatedTitle = truncatedTitle.concat('...');
            }
            $(displayList).append('<li class="' + linkType + '"><a title="' + linksArray[i][1].url + '" target="_blank" data-key="' + linksArray[i][1].title + '" href="' + linksArray[i][1].url + '">' + getFavicon(linksArray[i][1].url) + ' ' + truncatedTitle +
                '</a><i class="fa fa-times pullRight closeIcon"></i><ul class="subList"><li> <abbr class="timeago" title="' + linksArray[i][1].dateAdded +
                '"></abbr> </li></ul></li>');
        }
    }
    $("abbr.timeago").timeago();
    $('#unReadCount').html('Unread: ' + unReadCount);
    if (readCount > 0) {
        $('.readSection').show();
    } else {
        $('.readSection').hide();
    }
};

var clearReadLinks = function(passThru) {
    var currentLinks = passThru.currentLinks;
    if (currentLinks != undefined) {
        for (var key in currentLinks) {
            if (currentLinks[key].isRead === 1) {
                passThru.key = key;
                deleteLink(passThru, null);
            }
        }
    }
};

var archiveLink = function(passThru) {
    passThru.link = passThru.link[passThru.key];
    passThru.link.isRead = 1;
    addLink(passThru, null);
};

var deleteLink = function(passThru) {
    chrome.storage.sync.remove(passThru.key, function(data) {
        console.log("Link cleared");
        getLinks({}, refreshLinkList);
    });
};

var getFavicon = function(url) {
    var domain = url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
    var imgUrl = "http://www.google.com/s2/favicons?domain=" + domain;
    var img = document.createElement("img");
    img.setAttribute('src', imgUrl);
    return img.outerHTML;
};

var getSiteTitle = function() {
    $.ajax({
        url: "http://textance.herokuapp.com/title/www.bbc.co.uk",
        complete: function(data) {
            console.log(data.responseText);
        }
    });
};

var googleAnalytics = function() {
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-50925323-1']);
    _gaq.push(['_trackPageview']);

    (function() {
        var ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ga, s);
    })();
};

var debugLinks = function() {
    chrome.storage.sync.get(function(data) {
        console.log(data);
    });
};

var clearLinks = function(key) {
    chrome.storage.sync.clear(function(data) {
        console.log("All Links Cleared");
    });
};

var updater = function() {
    chrome.storage.sync.get("links", function(currentLinks) {
        if (!$.isEmptyObject(currentLinks)) {
            var links = currentLinks.links;
            links.forEach(function(link) {
                var key = link.title
                var newLink = {};
                newLink[key] = link;
                chrome.storage.sync.set(newLink, function() {
                    console.log('Saved', key, testPrefs);
                });
            });
            chrome.storage.sync.remove('links', function(data) {
                console.log('Old links removed');
            });
        }
    });
};

$(document).ready(function() {

    updater(); //Move all links to key/value

    googleAnalytics();
    getLinks({}, refreshLinkList);

    $('.readH3').click(function() {
        $('.readLinks').toggle("fast");
        $('.deleteAllRead').toggle("fast");
    });

    $('.saveButton').click(function() {
        getCurrentTab({}, addLink);
    });

    $('.deleteAllRead').click(function() {
        getLinks({}, clearReadLinks);
    });

    $(document).on('click', '.unreadLinks a', function() {
        var passThru = {
            'key': $(this).attr("data-key")
        }
        getLinks(passThru, archiveLink);
    });

    $(document).on('click', '.closeIcon', function() {
        var passThru = {
            'key': $(this).prev().attr("data-key")
        }
        getLinks(passThru, deleteLink);
    })

});
