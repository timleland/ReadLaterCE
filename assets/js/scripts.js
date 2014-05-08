var getCurrentTab = function(passThu, callBack) {
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function(tabs) {
        passThu.currentTab = tabs[0];
        callBack(passThu);
    });
};

var getLinks = function(passThu, callBack) {
    chrome.storage.sync.get("links", function(currentLinks) {
        passThu.currentLinks = currentLinks.links;
        if (currentLinks.links === undefined ? passThu.linksExist = 0 : passThu.linksExist = 1);
        callBack(passThu);
    });
};

var updateLinks = function(passThu, callBack) {
    chrome.storage.sync.set({
        'links': passThu.currentLinks
    }, function() {
        callBack(passThu);
    });
};

var addLink = function(passThu, callBack) {
    //If getLinks has not been run get existing links
    if (passThu.currentLinks === undefined && passThu.linksExist === undefined) {
        getLinks(passThu, addLink);
        return;
        //If getLinks func has been run but no links exist add first ink
    } else if (passThu.linksExist === 0) {
        passThu.currentLinks = new Array();
        console.log('First Add: ' + passThu.currentTab);

    }
    var dateAdded = new Date();
    passThu.currentLinks.push({
        'url': passThu.currentTab.url,
        'title': passThu.currentTab.title,
        'isRead': 0,
        'dateAdded': dateAdded.toISOString()
    });
    updateLinks(passThu, refreshLinkList)
};

var refreshLinkList = function(passThu) {
    $('.unreadLinks').empty();
    $('.readLinks').empty();
    var displayList = '';
    var linkType = '';
    var unReadCount = 0;
    var readCount = 0;
    var linksArray = passThu.currentLinks;

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
            $(displayList).append('<li class="' + linkType + '"><a target="_blank" data-arrayId="' + i + '" href="' + linksArray[i].url + '">' + truncatedTitle +
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

var clearReadLinks = function(passThu) {
    var currentLinks = passThu.currentLinks;
    if (currentLinks != undefined) {
        //Loop through array in reverse to avoid errors caused by array being re-indexed
        for (var i = currentLinks.length - 1; i >= 0; i--) {
            console.log(currentLinks[i]);
            debugger;
            if (currentLinks[i].isRead === 1) {
                currentLinks.splice(i, 1);
            }
        }
        updateLinks(passThu, refreshLinkList);
    }
};


var debugLinks = function() {
    chrome.storage.sync.get("links", function(data) {
        console.log(data);
    });
};

var archiveLink = function(passThu) {
    passThu.currentLinks[passThu.readId].isRead = 1;
    updateLinks(passThu, refreshLinkList);
};

var deleteLink = function(passThu) {
    passThu.currentLinks.splice(passThu.readId, 1);
    updateLinks(passThu, refreshLinkList);
};

$(document).ready(function() {
    getLinks({}, refreshLinkList);

    $('.readH3').click(function() {
        $('.readLinks').toggle("slow");
    });

    $('.saveButton').click(function() {
        getCurrentTab({}, addLink);
    });

    $('.deleteReadButton').click(function() {
        getLinks({}, clearReadLinks);
    });

    $(document).on('click', '.unreadLinks a', function() {
        var passThu = {
            'readId': parseInt($(this).attr("data-arrayId"))
        }
        getLinks(passThu, archiveLink);
    });

    $(document).on('click', '.closeIcon', function() {
        var passThu = {
            'readId': parseInt($(this).prev().attr("data-arrayId"))
        }
        getLinks(passThu, deleteLink);
    })

});
