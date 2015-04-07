/**
 * onepx.js
 * Author: BearJ
 * Version: v1.5.0
 * Date: 2015-4-1
 */
(function (name, definition) {
    "use strict";

    if (typeof define === "function") {
        define(definition);
    } else {
        window[name] = definition();
    }
})("onepx", function () {
    var _addStyleCache = [], // Style to be added
        _helperID = 0, // ID for each helper
        _hasSetHelperCommonStyle = false, // If helper common style had set
        _directions = ["top", "right", "bottom", "left"], // Used for calculating style which has these directions
        _tDirections = ["top-left", "top-right", "bottom-right", "bottom-left"] // Used for calculating border style from these directions
        ;


    /**
     * Add style to <head>
     * @param cssText
     * @private
     */
    function _addStyle2Head(cssText) {
        _addStyleCache.push(cssText);
        setTimeout(function () {
            var stylesText = "";
            while (_addStyleCache.length) {
                stylesText += "\n" + _addStyleCache.shift();
            }

            if (!stylesText) return;

            var style = document.createElement("style");
            style.type = "text/css";
            if (style.styleSheet) {
                style.styleSheet.cssText = stylesText;
            } else {
                style.appendChild(document.createTextNode(stylesText));
            }
            document.head.appendChild(style);
        }, 100);
    }

    /**
     * Observe dom
     * @param dom  need to be ovserved
     * @param callback  call when dom has changed
     * @private
     */
    function _observeDOMInsert(dom, callback) {
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        if (MutationObserver) {
            new MutationObserver(function (mutations) {
                for (var i = 0, lenI = mutations.length; i < lenI; ++i) {
                    var mutation = mutations[i], addedNodes = mutation.addedNodes;//  有增加元素
                    if (addedNodes && addedNodes.length) {
                        for (var j = 0, lenJ = addedNodes.length; j < lenJ; ++j) {
                            var node = addedNodes[j];
                            callback(node);
                        }
                    }
                }
            }).observe(dom, {childList: true, subtree: true});
        }
        else if (window.addEventListener) {
            dom.addEventListener("DOMNodeInserted", function (e) {
                callback(e.target);
            }, false);
        }
    }

    /**
     * Get style value
     * @param ele  element
     * @param rule  css rule
     * @return {string}  result
     * @private
     */
    function _getStyleVal(ele, rule) {
        var strValue = "";
        if (window.getComputedStyle) {
            strValue = window.getComputedStyle(ele, "").getPropertyValue(rule);
        }
        else if (document.defaultView && document.defaultView.getComputedStyle) {
            strValue = document.defaultView.getComputedStyle(ele, "").getPropertyValue(rule);
        }
        else if (ele.currentStyle) {
            rule = rule.replace(/\-(\w)/g, function (strMatch, p1) {
                return p1.toUpperCase();
            });
            strValue = ele.currentStyle[rule];
        }
        return strValue;
    }

    /**
     * Generate style names with directions
     * @param callback  pass direction as arguments. e.g.: callback("top") -> "margin-top"
     * @return {string}
     * @private
     */
    function _genStyleNameWithDirection(callback) {
        var out = "", result;
        for (var i = 0, len = _directions.length; i < len; ++i) {
            var dir = _directions[i];
            result = callback(dir);
            if (result == "continue") continue;
            else if (result == "break") break;

            out += result;
        }
        return out;
    }

    /**
     * Calculate border-radius style value. Use direction for IE compatibility
     * @param ele  elemetn
     * @return {string}  e.g.: border-top-radius:1px; border-right-radius:1px;...
     * @private
     */
    function _calcBorderRadiusStyle(ele) {
        var out = "";
        for (var i = 0, lenI = _tDirections.length; i < lenI; ++i) {
            var dir = _tDirections[i],
                br = _getStyleVal(ele, "border-" + dir + "-radius"), val = "";

            if (br != "0px") {
                val = ";" + "border-" + dir + "-radius:";
                if (br.indexOf("%") > -1) val += br;
                else {
                    br = br.match((/([-\d\.]*)(\w*)/));
                    val += "" + br[1] * 2 + br[2]
                }
            }
            out += val;
        }
        return out + ";";
    }

    /**
     * Calcute border style value(except border-radius).
     * @param ele
     * @return {string}
     * @private
     */
    function _calcBorderNormalStyle(ele) {
        return _genStyleNameWithDirection(function (dir) {
            var val = _getStyleVal(ele, "border-" + dir + "-width");
            if (!val || val.indexOf("1px") < 0) return "continue";

            return ";border-" + dir + ": " + val + " " + _getStyleVal(ele, "border-" + dir + "-style") + " " + _getStyleVal(ele, "border-" + dir + "-color");
        });
    }

    /**
     * Set helper to realize retina 1px line
     * @param ele
     * @private
     */
    function _setHelper(ele) {
        var helperStyle = _calcBorderNormalStyle(ele);
        if (!helperStyle) return;

        helperStyle += _calcBorderRadiusStyle(ele);

        //  Create helper
        var helper = document.createElement("span");
        helper.className = "onepxHelper";
        helper.id = "onepx" + ++_helperID;
        helperStyle = "#" + helper.id + "{" + helperStyle + "}";

        //  Add custom style to helper
        var customStyle = ele.getAttribute("onepx");
        if (customStyle) {
            var mods = customStyle.split("&");
            for (var i = 0, len = mods.length; i < len; ++i) {
                var mod = mods[i].split("@");
                if (mod.length < 2) return;

                var parents = mod[0], css = mod[1];
                helperStyle = helperStyle + "\n" + parents + " #" + helper.id + "{" + css + ";}"
            }
        }
        _addStyle2Head(helperStyle);

        //  If the element is inline-element, wrap a <span> help to realize
        var nodeName = ele.nodeName;
        ele.style.border = "0";
        if (nodeName == "IMG" || nodeName == "INPUT" || nodeName == "TEXTAREA" || nodeName == "SELECT" || nodeName == "OBJECT") {
            var margin = "", position = _getStyleVal(ele, "position"), display = _getStyleVal(ele, "display"), offset = "";
            margin = _genStyleNameWithDirection(function (dir) {
                var val = _getStyleVal(ele, "margin-" + dir);
                if (!val) return "continue";
                return ";margin-" + dir + ": " + val;
            });
            if (display == "inline") {
                display = "inline-block";
            }
            if (position != "absolute" && position != "relative") {
                position = "relative";
            } else {
                offset = _genStyleNameWithDirection(function (dir) {
                    var val = _getStyleVal(ele, dir);
                    if (!val || val == "auto") return "continue";
                    return ";" + dir + ": " + val;
                });
            }
            ele.style.fontSize = _getStyleVal(ele, "font-size");
            ele.style.margin = "0";
            ele.style.position = "static";
            ele.outerHTML =
                "<span id='onepxWrap" + _helperID + "' class='onepxWrap' style='position:" + position + ";display:" + display + margin + offset + ";font-size:0'>"
                + helper.outerHTML
                + ele.outerHTML
                + "</span>"
        } else {
            var elePos = _getStyleVal(ele, "position");
            if (elePos != "absolute" && elePos != "relative" && elePos != "fixed") {
                ele.style.position = "relative";
            }
            ele.appendChild(helper);
            ele.setAttribute("onepxset", "");
        }
    }

    /**
     * Set helpers to element which match the selectors
     * @param ele
     * @param selectors
     * @private
     */
    function _setHelpers(ele, selectors) {
        for (var i = 0, lenI = selectors.length; i < lenI; ++i) {
            var eles = ele.querySelectorAll(selectors[i] + ":not(.onepxHelper):not([onepxset])");
            for (var j = 0, lenJ = eles.length; j < lenJ; ++j) {
                _setHelper(eles[j]);
            }
        }
    }


    /**
     * onepx
     * @param targetSelectors  the selectors that need to be drew the retina 1px line
     * @param parentSelector  targets's parent selector, used to reduce the scope of observing, default "body"
     * @param isListen  observe the element if true, when element added dynamically, check them if need to drew 1px
     * @private
     */
    function onepx(targetSelectors, parentSelector, isListen) {
        var devicePixRatio = window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI) || 1;
        if (devicePixRatio <= 1 || !_getStyleVal(document.body, "display") || !targetSelectors) return;

        //  Add common style for helper to <head>
        if (!_hasSetHelperCommonStyle) {
            _addStyle2Head(
                "/*Use to draw 1px line.*/\n" +
                ".onepxHelper{ position:absolute;pointer-events:none;top:0;left:0;width:200%;height:200%;"
                + "-webkit-transform-origin: 0 0;-ms-transform-origin: 0 0;transform-origin: 0 0;"
                + "-webkit-transform:scale(0.5);-ms-transform:scale(0.5);transform:scale(0.5);"
                + "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box"
                + " }"
            );
            _hasSetHelperCommonStyle = true;
        }

        //  If the second argument was boolean, use as isListen
        if (typeof(parentSelector) == "boolean") {
            isListen = parentSelector;
            parentSelector = undefined;
        }

        //  Get selectors which will be drew retina 1px line
        var parent = (parentSelector && document.querySelector(parentSelector)) || document.body,
            tgtSelectors = targetSelectors.split(",");
        _setHelpers(parent, tgtSelectors);

        // If isListen was true, observe the element
        if (isListen) {
            _observeDOMInsert(parent, function (ele) {
                if (ele.nodeType != 1) return;

                var eleParent = ele.parentNode;
                if (!eleParent || eleParent.tarName == "HTML") eleParent = document.body;
                _setHelpers(eleParent, tgtSelectors);
            });
        }
    }

    return onepx;
});