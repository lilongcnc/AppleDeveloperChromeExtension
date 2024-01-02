var contentScript = (function () {

    document.addEventListener('DOMContentLoaded', function () {
        // console.log('🐈2addEventListener：' + location.protocol + '\n' + location.port + '\n' + location.host + '\n' + location.pathname + '\n' + location.hostname + '\n' + location.href);
        if (location.href.match('https://developer.apple.com/account/resources')) {
            console.log('-------- DOMContentLoaded --------');
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {

                    if (document.getElementById('list-certificates')) {
                        console.log("list-certificates load finished");
                        commonTabModule.addActionButton(ResourceTabType.certificates)
                        observer.disconnect();
                    } else if (document.getElementById('list-identifiers')) {
                        console.log("list-identifiers load finished");
                        commonTabModule.addActionButton(ResourceTabType.identify)
                        observer.disconnect();
                    } else if (document.getElementById('list-devices')) {
                        console.log("list-devices load finished");
                        commonTabModule.addActionButton(ResourceTabType.devices)
                        observer.disconnect();
                    } else if (document.getElementById('list-authkeys')) {
                        console.log("list-authkeys load finished");
                        commonTabModule.addActionButton(ResourceTabType.keys)
                        observer.disconnect();
                    } else if (document.getElementById('list-profiles')) {
                        console.log("list-profiles load finished");
                        profileTabModule.addActionButton(ResourceTabType.profile)
                        observer.disconnect();
                    }
                });
            });
            observer.observe(document, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            });
        }
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log('content-script receive message:' + request.tabType);
        if (!JSUtils.isValidString(request.tabType)) {
            return
        }

        console.log('content-script receive message：' + request.tabType);
        if (request.tabType.match(ResourceTabType.profile)) {
            profileTabModule.addActionButton(ResourceTabType.profile)
        } else if (request.tabType.match(ResourceTabType.identify) ||
            request.tabType.match(ResourceTabType.certificates) ||
            request.tabType.match(ResourceTabType.devices) ||
            request.tabType.match(ResourceTabType.keys)) {
            commonTabModule.addActionButton(request.tabType)
        }
        sendResponse('receive content message：');
    });


    return {};

})();