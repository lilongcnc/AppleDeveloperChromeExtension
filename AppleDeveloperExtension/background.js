chrome.webNavigation.onCompleted.addListener(function (details) {
	if (details.frameId === 0) {
		console.log("page load finished");
	}
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log('🐈background receive：' + request.tabType + request.actionType);
	if (request.tabType == 'profile') {
		dealProfileAction(request, sender, sendResponse)
	} else {
		dealCommonAction(request, sender, sendResponse)
	}
});

function dealCommonAction(request, sender, sendResponse) {
	let baseUrl = ""
	if (request.tabType == 'certificates') {
		baseUrl = "https://developer.apple.com/account/resources/certificates/download/"
	} else if (request.tabType == 'identify') {
		baseUrl = "https://developer.apple.com/account/resources/identifiers/bundleId/edit/"
	} else if (request.tabType == 'devices') {
		baseUrl = "https://developer.apple.com/account/resources/devices/edit/"
	} else if (request.tabType == 'keys') {
		baseUrl = "https://developer.apple.com/account/resources/authkeys/review/"
	}

	if (request.actionType == 'openOne') {
		var willOpenDataIds = request.itemInfos.map(function (item) {
			return item.dataId;
		});
		openDataIdsInNewTab(baseUrl, willOpenDataIds)
	}
}

function dealProfileAction(request, sender, sendResponse) {
	let baseUrl = "https://developer.apple.com/account/resources/profiles/review/"
	if (request.actionType == 'openTabsWithDataIds') {
		if (request.dataIds == null) {
			console.log('receive return');
			return
		}
		openDataIdsInNewTab(baseUrl, request.dataIds)
	} else {
		let itemInfos = request.itemInfos
		if (itemInfos == null) {
			console.log('receive return');
			return
		}
		var willOpenDataIds = []
		let selectedFilterPlatform = request.selectedFilterPlatform
		let selectedFilterType = request.selectedFilterType
		let selectedFilterExpiration = request.selectedFilterExpiration
		if (request.actionType == 'openFilter') {
			itemInfos.forEach(element => {
				if (!isEmpty(selectedFilterPlatform) && selectedFilterPlatform != 'All') {
					if (element.platform != selectedFilterPlatform) {
						return
					}
				}
				if (!isEmpty(selectedFilterType) && selectedFilterType != 'All') {
					if (element.type != selectedFilterType) {
						return
					}
				}
				if (!isEmpty(selectedFilterExpiration) && selectedFilterExpiration != 'All') {
					if (element.expiration != selectedFilterExpiration) {
						return
					}
				}

				willOpenDataIds.push(element.dataId)
			});
			sendResponse({
				data: willOpenDataIds,
				message: "You Will Open  " + willOpenDataIds.length + " Tabs, Are You Sure?"
			});
		} else if (request.actionType == 'openOne') {
			willOpenDataIds = itemInfos.map(function (item) {
				return item.dataId;
			});
			openDataIdsInNewTab(baseUrl, willOpenDataIds)
		}
	}
}

function isEmpty(s) {
	return !s || s.trim().length === 0;
}

function openDataIdsInNewTab(baseUrl, dataIds) {
	for (var i = 0; i < dataIds.length; i++) {
		var dataId = dataIds[i];
		let url = baseUrl + dataId
		openUrlNewTab(url);
	}
}

function openUrlNewTab(url, active = false) {
	chrome.tabs.create({
		url: url,
		active: active
	});
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	// var str = 'page changed' + tabId + '---' + tab.status + '《《《》》》' + changeInfo.url + '====' + changeInfo.status + tab.url + tab.title;
	// console.log(str);
	if (tab.status === 'complete') {}
});

chrome.webRequest.onCompleted.addListener(
	function (details) {
		let tabType = ""
		console.log('request finished, url: ' + details.url);
		if (details.url.match('v1/certificates')) {
			tabType = 'certificates'
		} else if (details.url.indexOf('v1/bundleIds') !== -1) {
			tabType = 'identify'
		} else if (details.url.indexOf('v1/devices') !== -1) {
			tabType = 'devices'
		} else if (details.url.indexOf('v1/profiles') !== -1) {
			tabType = 'profile'
		} else if (details.url.indexOf('account/auth/key/list') !== -1) {
			tabType = 'keys'
		}

		if (tabType) {
			console.log('background sendMessage')
			setTimeout(function () {
				sendMessageToContentScript({
					tabType: tabType,
					action: "addExtensionUI"
				}, function (response) {});
			}, 300);

		}

	}, {
		urls: ['<all_urls>']
	},
	['responseHeaders']
);

function sendMessageToContentScript(message, callback) {
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function (tabs) {
		chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
			if (callback) callback(response);
		});
	});
};