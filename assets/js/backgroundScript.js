var saveLink = function(info) {
    $.ajax({
        url: info.linkUrl,
        success: function(data) {
            var title = data.match(/<title>(.*)<\/title>/);
            if (title !== null) {
                var siteTitle = title[0].replace('<title>', '').replace('</title>', '');
            } else {
                var siteTitle = info.linkUrl;
            }
            var siteTitle = $("<div/>").html(siteTitle).text();
            console.log(siteTitle);

            var passThru = {};
            passThru.link = {
                url: info.linkUrl,
                title: siteTitle,
                isRead: 0
            };

            addLink(passThru)
        }
    });
};

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        window.open('https://timleland.com/read-later-extension/');
    } else if (details.reason == "update") {

    }
});

chrome.contextMenus.create({
    title: "Save Link",
    type: "normal",
    contexts: ["link"],
    onclick: saveLink
});
