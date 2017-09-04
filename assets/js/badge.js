window.badge = function() {
    var canSetBadge = function() {
        return typeof chrome !== 'undefined' && chrome.browserAction && chrome.browserAction.setIcon && chrome.browserAction.setBadgeText && $.isFunction(chrome.browserAction.setIcon);
    };

    return {
        setBadge: function(data) {
            if (!canSetBadge()) {
                return;
            }

            chrome.browserAction.setBadgeText({
                text: data.unReadCount.toString()
            });

            // chrome.browserAction.setBadgeBackgroundColor({
            //     color: '#ffa240'
            // });

            chrome.browserAction.setTitle({
                title: 'Unread Count: ' + data.unReadCount + '\n' + 'Read Count: ' + data.readCount
            });
        }
    }
}();
