var commonTabModule = (function () {

    var tabType = '';

    function addActionButton(currentTabType) {
        if (document.getElementById(kItemOpenButtonID)) {
            console.log("❎ commonItemModule  addActionButton has add extension UI")
            return;
        }
        console.log("🐈 commonItemModule  addActionButton ")

        // init data
        tabType = currentTabType

        // parse tables
        let tableContent = document.getElementById('infiniteListContainer').firstElementChild;
        let tableRows = tableContent.firstElementChild.children;

        if (tableRows.length > 0) {
            console.log('tableRow:' + tableRows.length);
            for (var i = 0; i < tableRows.length; i++) {
                let tableRow = tableRows[i];
                let itemInfo = {}; // use let
                let dataId = tableRow.getAttribute('data-id');
                var dataPlatform = tableRow.getAttribute('data-platform');

                // record data
                if (i > 0) {
                    itemInfo = {
                        dataId: dataId,
                        platform: dataPlatform
                    }
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
    }

    return {
        addActionButton
    }
})();