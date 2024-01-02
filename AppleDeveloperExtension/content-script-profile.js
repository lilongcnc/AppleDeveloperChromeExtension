const kFilterPlatformOption = 'kFilterPlatformOption';
const kFilterTypeOption = 'kFilterTypeOption';
const kFilterExpirationOption = 'kFilterExpirationOption';
const kFilterDivID = 'kFilterDivID';

var profileTabModule = (function () {

    var itemInfos = [];
    var tabType = '';


    const filterPlatforms = new Set();
    const filterTypes = new Set();
    const filterExpirations = new Set();

    var selectedFilterPlatform = '';
    var selectedFilterType = '';
    var selectedFilterExpiration = '';

    function createMenuButton() {
        var button = document.createElement("button");
        button.style.backgroundColor = "#fff";
        button.style.border = "1px solid #0070c9";
        button.style.outline = "0";
        button.style.borderRadius = "4px";
        button.style.padding = "3px 11px 5px 11px";
        button.style.marginLeft = "10px";
        button.style.textAlign = "center";
        button.style.color = "#0070c9";
        button.style.fontSize = "13px";
        button.style.fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", Helvetica Neue, HelveticaNeue, Helvetica, Arial, sans-serif';
        button.style.minWidth = "120px";
        button.style.height = "40px";
        button.style.insetInline = "inline-block";
        return button
    }

    function createOpenFilterItemsButton() {
        var button = createMenuButton();
        button.innerHTML = "Open Filter Items";
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            chrome.runtime.sendMessage({
                tabType: tabType,
                actionType: 'openFilter',
                itemInfos: itemInfos,
                selectedFilterPlatform: selectedFilterPlatform,
                selectedFilterType: selectedFilterType,
                selectedFilterExpiration: selectedFilterExpiration
            }, function (response) {
                var r = confirm(response.message);
                if (r == true) {
                    chrome.runtime.sendMessage({
                        tabType: tabType,
                        actionType: 'openTabsWithDataIds',
                        dataIds: response.data
                    }, function (response) {});
                }
            });
        });
        return button;
    }

    function addActionButton(currentTabType) {
        if (document.getElementById(kItemOpenButtonID)) {
            console.log("❎ profileItemModule  addActionButton has add extension UI")
            return;
        }
        console.log("🐈 profileTabModule  addActionButton ")

        // init data
        itemInfos = [];
        tabType = currentTabType;

        // parse tables
        let tableRoot = document.getElementsByClassName('infinite-list-container')[0];
        let tableContent = document.getElementById('infiniteListContainer').firstElementChild;

        let tableRows = tableContent.firstElementChild.children;
        if (tableRows.length > 0) {
            console.log('tableRow:' + tableRows.length);
            for (var i = 0; i < tableRows.length; i++) {
                let tableRow = tableRows[i];
                let tableRowChildren = tableRow.children;

                let itemInfo = {}; // use let
                let dataId = tableRow.getAttribute('data-id');
                // record data
                if (i > 0) {
                    var platform = "";
                    var type = "";
                    var expiration = "";
                    for (var j = 0; j < tableRowChildren.length; j++) {
                        let children = tableRowChildren[j];

                        if (j == 0) {
                            // name
                        } else if (j == 1) {
                            // platform
                            let childDiv = children.children[0];
                            platform = childDiv.innerHTML;
                            filterPlatforms.add(platform);
                        } else if (j == 2) {
                            // type
                            let childDiv = children.children[0];
                            type = childDiv.innerHTML;
                            filterTypes.add(type);
                        } else if (j == 3) {
                            // expiration
                            let childDiv = children.firstElementChild.children[0];
                            expiration = childDiv.innerHTML;
                            filterExpirations.add(expiration);
                        }
                    }

                    itemInfo = {
                        dataId: dataId,
                        platform: platform,
                        type: type,
                        expiration: expiration,
                    }
                    itemInfos.push(itemInfo);
                }

                // add New UI
                if (i == 0) {
                    var span = document.createElement("span");
                    span.innerHTML = "Total Items Number: " + (tableRows.length - 1);
                    span.style.backgroundColor = "#FEF7F6";
                    span.style.color = "#0070c9";
                    span.style.textAlign = "center";
                    span.style.fontWeight = 'bold';
                    span.style.fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", Helvetica Neue, HelveticaNeue, Helvetica, Arial, sans-serif';
                    tableRow.appendChild(span);
                } else {
                    var button = document.createElement("button");
                    button.innerHTML = "Open In New Tab";
                    button.style.border = "1px solid black";
                    button.style.borderRadius = "6px";
                    button.style.textAlign = "center";
                    button.style.width = "130px";
                    button.style.height = "35px";
                    button.id = kItemOpenButtonID;
                    button.addEventListener('click', (event) => {
                        event.stopPropagation();
                        chrome.runtime.sendMessage({
                            tabType: tabType,
                            actionType: 'openOne',
                            itemInfos: [itemInfo]
                        }, function (response) {});
                    });
                    tableRow.appendChild(button);
                }
            }
        }

        if (document.getElementById(kFilterDivID)) {
            console.log("❎ profileItemModule  createFilterMenu has add extension UI")
            return;
        }
        console.log("🐈 profileTabModule  createFilterMenu ")
        createFilterMenu();
    }

    function createFilterMenu() {
        // header list-header
        var parentDiv = document.querySelector('#list-profiles');
        if (parentDiv) {
            var customMenu = document.createElement('div');
            customMenu.id = kFilterDivID;
            customMenu.textContent = 'Filter:  ';
            customMenu.style.color = '#111111';
            customMenu.style.fontSize = '24px';
            customMenu.style.fontWeight = 'bold';

            customMenu.style.display = 'flex';
            customMenu.style.textAlign = 'right';
            customMenu.style.marginBottom = '16px';
            customMenu.style.marginTop = '16px';

            let filterPlatformValues = Array.from(filterPlatforms);
            filterPlatformValues.unshift("All");
            let filterTypesValues = Array.from(filterTypes);
            filterTypesValues.unshift("All");
            let filterExpirationsValues = Array.from(filterExpirations);
            filterExpirationsValues.unshift("All");

            createOptions(customMenu, kFilterPlatformOption, filterPlatformValues)
            createOptions(customMenu, kFilterTypeOption, filterTypesValues)
            createOptions(customMenu, kFilterExpirationOption, filterExpirationsValues)
            customMenu.appendChild(createOpenFilterItemsButton());
            var targetDiv = parentDiv.querySelector('.list-header');
            parentDiv.insertBefore(customMenu, targetDiv.nextSibling);
        }
    }

    function createOptions(parentDom, filterType, optionValues) {
        var options = document.createElement('select');
        options.id = filterType;
        options.style.display = '';
        options.style.width = '200px';
        options.style.height = '40px';
        options.style.marginLeft = "10px";

        for (var i = 0; i < optionValues.length; i++) {
            if (optionValues[i] != null) {
                var option = document.createElement('option');
                option.textContent = optionValues[i];
                options.appendChild(option);
            }
        }
        options.addEventListener('change', function () {
            if (filterType == kFilterPlatformOption) {
                selectedFilterPlatform = options.value
            } else if (filterType == kFilterTypeOption) {
                selectedFilterType = options.value
            } else if (filterType == kFilterExpirationOption) {
                selectedFilterExpiration = options.value
            }
        });
        parentDom.appendChild(options);
    }

    return {
        addActionButton
    }
})();