/*!
 * jQuery.ui.sortableFix - This plugin overrides some methods in ui.sortable to fix 
 * several issues.
 *
 * Copyright 2011 Arwid Bancewicz
 * Licensed under the MIT lice
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * @date 9 May 2011
 * @author Arwid Bancewicz http://arwid.ca
 * @version 0.1
 */
 (function($) {

    /* Overrid contains to make it unusuable */
    $.ui.contains = function() {
        return false;
    }

    $.widget("ui.sortable", $.extend({},
    $.ui.sortable.prototype, {

        _intersectsWithPointerOrig: $.ui.sortable.prototype._intersectsWithPointer,

        /* Override _intersectsWithPointer */
        _intersectsWithPointer: function(item) {
            // If item is not in the container, disregard it
            var itemElement = this.options.connectWith ? $(item.item[0]).closest(this.options.connectWith) : this.element;
            if (this.positionAbs.top < itemElement.offset().top || this.positionAbs.top > itemElement.offset().top + itemElement.height()) {
                return false;
            }

            return this._intersectsWithPointerOrig(item);
        },

        /* Override _rearrange */
        _rearrange: function(event, i, a, hardRefresh) {
            if (a) {
                // moving into a new list
                var container = $(a[0]);
                var ctop = container.offset().top;
                var cbottom = ctop + container.outerHeight(true);
                var chalf = (cbottom - ctop) / 2 + ctop;

                if (event.clientY > chalf) {
                    // came in from bottom
                    this.direction = "down";
                    var last = $(a[0]).find(this.options.items + ":last");
                    if (last.size()) {
                        last.after(this.placeholder[0]);
                    } else {
                        a[0].insertBefore(this.placeholder[0], a[0].childNodes[0])
                    }
                } else {
                    // came in from top
                    this.direction = "up";
                    var first = $(a[0]).find(this.options.items + ":first");
                    if (first.size()) {
                        first.before(this.placeholder[0]);
                    } else {
                        a[0].insertBefore(this.placeholder[0], a[0].childNodes[0])
                    }
                }
            } else {
                // moving along current list
                (this.direction == 'down' ? this._insertAbove(this.placeholder[0], i.item[0]) : this._insertBelow(this.placeholder[0], i.item[0]));
            }

            this.counter = this.counter ? ++this.counter: 1;
            var self = this,
            counter = this.counter;

            window.setTimeout(function() {
                if (counter == self.counter) self.refreshPositions(!hardRefresh);
            },
            0);
        },

        /* Inserting in a tree --------------------------------------------- */
        _insertBelow: function(new_node, existing_node) {
            console.log("_insertBelow");
            var firstChild = this._below($(existing_node), true);
            if (firstChild.size()) {
                $(new_node).insertBefore(firstChild);
            } else {
                var below = this._below($(existing_node), true);
                if (below.size()) {
                    $(new_node).insertBefore(this._below($(existing_node)));
                } else {
                    $(new_node).insertAfter($(existing_node));
                }
            }
        },
        _insertAbove: function(new_node, existing_node) {
            var firstParent = this._above($(existing_node), true);
            if (firstParent.size()) {
                $(new_node).insertBefore(existing_node);
            } else {
                var aboveNode = this._above($(existing_node));
                if (aboveNode.size()) {
                    $(new_node).insertAfter(aboveNode);
                } else {
                    $(new_node).insertBefore(existing_node);
                }
            }
        },

        /* Tree traversing-------------------------------------------------- */
        _above: function(node, onlyParent) {
            var prev = node.prev(this.options.items);
            if (onlyParent || prev.size() == 0) {
                return node.parent().closest(this.options.items);
            } else {
                var prevLastChild = prev.find(this.options.items + ":last");
                if (prevLastChild.size()) return prevLastChild;
                else return prev;
            }
        },
        _below: function(node, onlyChildren) {
            var below = node.find(this.options.items + ":first");
            if (onlyChildren) return below;
            if (below.size()) {
                return below;
            } else {
                below = node;
                while (below.next(this.options.items).size() == 0 && below.parent().size() != 0) {
                    below = below.parent().closest(this.options.items);
                }
                return below.next(this.options.items);
            }
        }

    }));

})(jQuery);