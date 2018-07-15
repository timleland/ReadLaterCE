var _gaq = _gaq || [];

var _badgeData;

var getCurrentTab = function(callBack) {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function(tabs) {
        var newLink = {
            title: tabs[0].title,
            url: tabs[0].url,
            isRead: 0
        }

        callBack(newLink);
    });
};
var getLink = function(key, callBack) {
    chrome.storage.sync.get(key, function(link) {
        var linkObject = link[key];
        linkObject.key = key;
        callBack(linkObject);
    });
};

var getLinks = function(callBack) {
    chrome.storage.sync.get(function(currentLinks) {
        callBack(currentLinks);
    });
};

var addUpdateLink = function(link) {
    var dateAdded = new Date();
    link.title = link.title + ' (' + link.url + ')';
    var addLink = {
        url: link.url,
        title: link.title.replace('"', '').replace('\'', ''), //Prevent quotes from being in title
        isRead: link.isRead,
        dateAdded: dateAdded.toISOString()
    };

    var newLinkObject = {};
    var key = addLink.url;
    newLinkObject[key] = addLink;

    chrome.storage.sync.set(newLinkObject, function() {
        console.log('Saved link: ', addLink.url);
        getLinks(refreshLinkList);
    });

    _gaq.push(['_trackEvent', 'Link saved', 'clicked']);
};

var refreshLinkList = function(linksObject) {
    $('.spinner').fadeOut(function() {
        $('.linkList').fadeIn();
    });

    $('.unreadLinks').empty();
    $('.readLinks').empty();
    var displayList = '';
    var linkType = '';
    var unReadCount = 0;
    var readCount = 0;

    var linksArray = [];
    for (var key in linksObject) {
        var link = linksObject[key];
        link.key = key;
        linksArray.push(link)
    }

    linksArray.sort(function(a, b) {
        return new Date(b.dateAdded) - new Date(a.dateAdded)
    })

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
            var truncatedTitle = linksArray[i].title.substring(0, 40);

            if (linksArray[i].title.length > 40) {
                truncatedTitle = truncatedTitle.concat('...');
            }

            var key = encodeURIComponent(linksArray[i].key);
            $(displayList).append('<li class="' + linkType + '"><a title="' + linksArray[i].url + '" target="_blank" data-key="' + key + '" href="' + linksArray[i].url + '">' + getFavicon(linksArray[i].url) + ' ' + truncatedTitle +
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

    _badgeData = {
        unReadCount: unReadCount,
        readCount: readCount
    };

    badge.setBadge(_badgeData);
};

var archiveLink = function(link) {
    _badgeData.unReadCount = _badgeData.unReadCount - 1;
    _badgeData.readCount = _badgeData.readCount + 1;
    badge.setBadge(_badgeData);
    link.isRead = 1;
    addUpdateLink(link);
    console.log("Archive link: " + link.url);
};

var deleteLink = function(link) {
    chrome.storage.sync.remove(link.key, function(data) {
        console.log("Link deleted: " + link.url);
        getLinks(refreshLinkList);
    });
};


var clearReadLinks = function(links) {
    if (links != undefined) {
        for (var link in links) {
            if (links[link].isRead === 1) {
                var linkToDelete = links[link];
                linkToDelete.key = link;
                deleteLink(linkToDelete);
            }
        }
    }
};

var getFavicon = function(url) {
    if (url) {
        var domain = url.replace('http://', '').replace('https://', '').split(/[/?#]/)[0];
        var imgUrl = "http://www.google.com/s2/favicons?domain=" + domain;
        var img = document.createElement("img");
        img.setAttribute('src', imgUrl);
        return img.outerHTML;
    }
};

var googleAnalytics = function() {
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

var clearLinks = function() {
    chrome.storage.sync.clear(function(data) {
        console.log("All Links Cleared");
    });
};

$(document).ready(function() {
    // Check whether new version is installed
    chrome.runtime.onInstalled.addListener(function(details) {
        if (details.reason == "install") {
            console.log("This is a first install!");
        } else if (details.reason == "update") {
            var thisVersion = chrome.runtime.getManifest().version;
            console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
        }
    });

    googleAnalytics();
    _gaq.push(['_trackEvent', 'Extension Opened', 'clicked']);

    setTimeout(function() {
        getLinks(refreshLinkList);
    }, 100);

    $('.readH3').click(function() {
        $('.readLinks').toggle("fast");
        $('.deleteAllRead').toggle("fast");
    });

    $('.saveButton').click(function() {
        getCurrentTab(addUpdateLink);
    });

    $('.deleteAllRead').click(function() {
        getLinks(clearReadLinks);
    });

    $(document).on('click', '.unreadLinks a', function() {
        var key = decodeURIComponent($(this).attr("data-key"))
        getLink(key, archiveLink);
    });

    $(document).on('click', '.closeIcon', function() {
        var key = decodeURIComponent($(this).prev().attr("data-key"))
        getLink(key, deleteLink);
    })
});