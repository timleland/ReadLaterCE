var saveLink = function(info) {
    $.ajax({
        url: info.linkUrl,
        success: function(data) {
            console.log(data);
            var title = data.match(/<title>(.*)<\/title>/);
            if (title !== null) {
                var siteTitle = title[0].replace('<title>', '').replace('</title>', '');
            } else {
                var siteTitle = info.linkUrl;
            }

            var passThru = {};
            passThru.currentTab = {
                url: info.linkUrl,
                title: siteTitle
            };

            addLink(passThru)
        }
    });
};

var getLinks = function(passThru, callBack) {
    chrome.storage.sync.get("links", function(currentLinks) {
        passThru.currentLinks = currentLinks.links;
        if (currentLinks.links === undefined ? passThru.linksExist = 0 : passThru.linksExist = 1);
        callBack(passThru);
    });
};

var addLink = function(passThru) {
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
    updateLinks(passThru)
};

var updateLinks = function(passThru) {
    chrome.storage.sync.set({
        'links': passThru.currentLinks
    }, function() {
        console.log('Link added');
        console.log(passThru);
    });
};

chrome.contextMenus.create({
    title: "Save Link",
    type: "normal",
    contexts: ["link"],
    onclick: saveLink
});
