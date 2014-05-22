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
            passThru.link = {
                url: info.linkUrl,
                title: siteTitle,
                isRead: 0
            };
            debugger;
            addLink(passThru)
        }
    });
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
    });
};



chrome.contextMenus.create({
    title: "Save Link",
    type: "normal",
    contexts: ["link"],
    onclick: saveLink
});
