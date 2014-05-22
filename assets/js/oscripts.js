var getCurrentTab = function(passThru, callBack) {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function(tabs) {
        passThru.currentTab = tabs[0];
        callBack(passThru);
    });
};

var getLinks = function(passThru, callBack) {
    chrome.storage.sync.get("links", function(currentLinks) {
        passThru.currentLinks = currentLinks.links;
        if (currentLinks.links === undefined ? passThru.linksExist = 0 : passThru.linksExist = 1);
        callBack(passThru);
    });
};

var updateLinks = function(passThru, callBack) {
    chrome.storage.sync.set({
        'links': passThru.currentLinks
    }, function() {
        callBack(passThru);
    });
};

var addLink = function(passThru, callBack) {
    //If getLinks has not been run get existing links
    if (passThru.currentLinks === undefined && passThru.linksExist === undefined) {
        getLinks(passThru, addLink);
        return;
        //If getLinks func has been run but no links exist add first ink
    } else if (passThru.linksExist === 0) {
        passThru.currentLinks = new Array();
        console.log('First Add: ' + passThru.currentTab);

    }
    var dateAdded = new Date();
    passThru.currentLinks.push({
        'url': passThru.currentTab.url,
        'title': passThru.currentTab.title,
        'isRead': 0,
        'dateAdded': dateAdded.toISOString()
    });
    updateLinks(passThru, refreshLinkList)
};

var refreshLinkList = function(passThru) {
    $('.unreadLinks').empty();
    $('.readLinks').empty();
    var displayList = '';
    var linkType = '';
    var unReadCount = 0;
    var readCount = 0;
    var linksArray = passThru.currentLinks;

    if (linksArray != undefined) {
        for (var i = 0; i < linksArray.length; i++) {
            if (linksArray[i].isRead === 0) {
                unReadCount++;
                displayList = '.unreadLinks';
                linkType = 'unRead';
            } else {
                readCount++;
                displayList = '.readLinks';
                linkType = 'read';
            }
            var truncatedTitle = linksArray[i].title.substring(0, 35);

            if (linksArray[i].title.length > 35) {
                truncatedTitle = truncatedTitle.concat('...');
            }
            $(displayList).append('<li class="' + linkType + '"><a target="_blank" data-arrayId="' + i + '" href="' + linksArray[i].url + '">' + getFavicon(linksArray[i].url) + ' ' + truncatedTitle +
                '</a><i class="fa fa-times pullRight closeIcon"></i><ul class="subList"><li> <abbr class="timeago" title="' + linksArray[i].dateAdded +
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

var clearLinks = function() {
    chrome.storage.sync.remove("links", function(data) {
        console.log("All Links Cleared");
    });
};

var clearReadLinks = function(passThru) {
    var currentLinks = passThru.currentLinks;
    if (currentLinks != undefined) {
        //Loop through array in reverse to avoid errors caused by array being re-indexed
        for (var i = currentLinks.length - 1; i >= 0; i--) {
            console.log(currentLinks[i]);
            debugger;
            if (currentLinks[i].isRead === 1) {
                currentLinks.splice(i, 1);
            }
        }
        updateLinks(passThru, refreshLinkList);
    }
};


var debugLinks = function() {
    chrome.storage.sync.get("links", function(data) {
        console.log(data);
    });
};

var archiveLink = function(passThru) {
    passThru.currentLinks[passThru.readId].isRead = 1;
    updateLinks(passThru, refreshLinkList);
};

var deleteLink = function(passThru) {
    passThru.currentLinks.splice(passThru.readId, 1);
    updateLinks(passThru, refreshLinkList);
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

var rightClickSaveLink = function() {
    return function(info, tab) {
        console.log(info);

    };
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

$(document).ready(function() {

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
            'readId': parseInt($(this).attr("data-arrayId"))
        }
        getLinks(passThru, archiveLink);
    });

    $(document).on('click', '.closeIcon', function() {
        var passThru = {
            'readId': parseInt($(this).prev().attr("data-arrayId"))
        }
        getLinks(passThru, deleteLink);
    })

});
