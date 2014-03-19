 /*
 * asFontEditor
 * https://github.com/amazingSurge/jquery-asFontEditor
 *
 * Copyright (c) 2014 amazingSurge
 * Licensed under the GPL license.
 */


(function($, document, window, undefined) {

    "use strict";

    var pluginName = 'asFontEditor';
    // main constructor
    var Plugin = $[pluginName] = function(element, options) {
        var metas = {};

        this.element = element;
        this.$element = $(element);

        this.options = $.extend({}, Plugin.defaults, options, this.$element.data(), metas);
        this.namespace = this.options.namespace;
        this.components = $.extend(true, {}, this.components);

        // public properties

        this.classes = {
            // status
            skin: this.namespace + '_' + this.options.skin,
            disabled: this.namespace + '_disabled',
            active: this.namespace + '_active',
            hide: this.namespace + '_hide',
            show: this.namespace + '_show',
            hasFont: this.namespace + '_hasFont'
        };

        // flag
        this.disabled = false;
        this.initialed = false;
        
        var self = this;
        $.extend(self, {
            init: function() {
                self._createHtml();

                if (self.options.skin) {
                    self.$wrap.addClass(self.classes.skin);
                }

                self._getValue();

                if (self.options.disabled) {
                    self.disable();
                }
                //init 
                self.doTextAlign.init();
                self.doFontStyle.init();
                self.doTextTransform.init();
                self.doTextDecoration.init();
                self.doFontWeight.init();
                self.doLineHeight.init();
                self.doFontSize.init();
                self.doFontFamily.init();

                if (self.value.font_family == "inherit") {
                    self.$typo_trigger.removeClass(self.classes.hasFont);
                    $(self.$typo_font)[0].lastChild.nodeValue = "Add typography";
                } else {
                    self.$typo_trigger.addClass(self.classes.hasFont);
                    $(self.$typo_font)[0].lastChild.nodeValue = self.value.font_family;
                }

                self._bindEvent();

                // init
                // self.val(self.value, true);

                self.initialed = true;
                // after init end trigger 'ready'
                self._trigger('ready');
            },

            _bindEvent: function() {
                self.$typo_trigger.hover(
                    function() {
                        self.$typo_mask.addClass(self.classes.show);
                        self.$typo_remove.addClass(self.classes.show);
                    },
                    function() {
                        self.$typo_mask.removeClass(self.classes.show);
                        self.$typo_remove.removeClass(self.classes.show);
                    }
                );

                self.$typo_mask.on("click",function() {
                    self.$typo_trigger.addClass(self.classes.hide);
                    self.$wrap.append(self.$extend);
                    self.$extend.removeClass(self.classes.hide).addClass(self.classes.show);
                });

                self.$typo_remove.on("click",function(event) {
                    // self.font_family = "inherit";
                    // self.family = 0;
                    // self.$typo_trigger.removeClass(self.classes.hasFont);
                    // $(self.$typo_font)[0].lastChild.nodeValue = "Add typography";
                    // self.$typo_font_family.data("dropdown").set(self.$font_family_item.eq(self.family));
                    self._process();
                    return false;
                });

                self.$typo_close.on("click",function(event) {
                    event.preventDefault();
                    self.$extend.removeClass(self.classes.show).addClass(self.classes.hide);
                    self.$typo_trigger.removeClass(self.classes.hide);
                });
            },
            _createHtml: function() {
                this.$wrap = $(this.options.tpl());
                this.$extend = $(this.options.tpl_extend());
                this.$element.after(this.$wrap);

                this.$typo_trigger = this.$wrap.find('.' + this.namespace + '-trigger');
                this.$typo_font = this.$typo_trigger.find('.' + this.namespace + '-font');
                this.$typo_remove = this.$typo_trigger.find('.' + this.namespace + '-remove');
                this.$typo_font_show = this.$typo_font.find('span');
                this.$typo_mask = this.$wrap.find('.' + this.namespace + '-mask');

                this.$typo_close = this.$extend.find('.' + this.namespace + '-close');
            },

            _trigger: function(eventType) {
                // event
                self.$element.trigger(pluginName + '::' + eventType, self);

                // callback
                eventType = eventType.replace(/\b\w+\b/g, function(word) {
                    return word.substring(0, 1).toUpperCase() + word.substring(1);
                });
                var onFunction = 'on' + eventType;
                var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;
                if (typeof self.options[onFunction] === 'function') {
                    self.options[onFunction].apply(self, method_arguments);
                }
            },
            _getValue: function() {
                var value = this.$element.val();
                if (value) {
                    this.value = this.options.parse(value);
                } else {
                    return false;
                }
            },
            _process: function() {
                if (self.value === null) {
                    self.value = {};
                }
                self.options.onChange.call(self, self.value);
                self.$element.val(self.options.process(self.value));
            },

            doFontFamily: {
                init: function() {
                    var oneself = this;
                    if (!self.value.font_family) {
                        this.font_family = self.options.font_family.default_value;
                    } else {
                        this.font_family = self.value.font_family;
                    }

                    var tpl_content = self.options.font_family.tpl().replace(/fontFamilyNamespace/g, self.options.font_family.namespace).replace(/namespace/g, self.namespace);
                    this.$tpl_font_family = $(tpl_content);
                    self.$typo_close.after(this.$tpl_font_family);

                    this.$content = self.$extend.find('.' + self.namespace + '-fontFamily-content');
                    this.$font_family = self.$extend.find('.' + self.namespace + '-fontFamily-dropdown');
                    this.$items = this.$content.find('li');
                    this.values = self.options.font_family.values;

                    $.each(this.values, function(key, value) {
                        oneself.$items.eq(key).data('font_family', value);
                    });

                    this.$font_family.dropdown({
                        namespace: self.options.font_family.namespace,
                        imitateSelect: true,
                        data: "font_family",
                        onChange: function(value) {
                            if (self.disabled) {
                                return;
                            }

                            self.value.font_family = value;
                            if (value == "inherit") {
                                self.$typo_trigger.removeClass(self.classes.hasFont);
                                $(self.$typo_font)[0].lastChild.nodeValue = "Add typography";
                            } else {
                                self.$typo_trigger.addClass(self.classes.hasFont);
                                $(self.$typo_font)[0].lastChild.nodeValue = value;
                            }
                            self._process();
                            self.$typo_font_show.css({
                                "font-family": value
                            });
                        }
                    });

                    this.set(this.font_family);
                },

                set: function(value) {
                    this.$font_family.data('dropdown').set(value);
                }
            },

            doFontWeight: {
                init: function() {
                    var oneself = this;
                    if (!self.value.font_weight) {
                        this.font_weight = self.options.font_weight.default_value;
                    } else {
                        this.font_weight = self.value.font_weight;
                    }

                    var tpl_content = self.options.font_weight.tpl().replace(/fontWeightNamespace/g, self.options.font_weight.namespace).replace(/namespace/g, self.namespace);
                    this.$tpl_font_weight = $(tpl_content);
                    self.$typo_close.after(this.$tpl_font_weight);

                    this.$content = self.$extend.find('.' + self.namespace + '-fontWeight-content');
                    this.$font_weight = self.$extend.find('.' + self.namespace + '-fontWeight-dropdown');
                    this.$items = this.$content.find('li');
                    this.values = self.options.font_weight.values;

                    $.each(this.values, function(key, value) {
                        oneself.$items.eq(key).data('font_weight', value);
                    });

                    this.$font_weight.dropdown({
                        namespace: self.options.font_weight.namespace,
                        imitateSelect: true,
                        data: "font_weight",
                        onChange: function(value) {
                            if (self.disabled) {
                                return;
                            }

                            self.value.font_weight = value;
                            self._process();
                        }
                    });

                    this.set(this.font_weight);                    
                },

                set: function(value) {
                    this.$font_weight.data('dropdown').set(value);
                }   
            },

            doFontSize: {
                init: function() {
                    var oneself = this;
                    if (!self.value.font_size) {
                        this.font_size_value = self.options.font_size.value;
                        this.font_size_unit = self.options.font_size.unit;
                    } else if (self.value.font_size === "inherit") {
                        this.font_size_value = self.options.font_size.min;
                        this.font_size_unit = self.options.font_size.unit;
                    } else {
                        this.font_size_value = self.parse(self.value.font_size).number;
                        this.font_size_unit = self.parse(self.value.font_size).unit;
                    }

                    var tpl_content = self.options.font_size.tpl().replace(/fontSizeNamespace/g, self.options.font_size.namespace).replace(/namespace/g, self.namespace);
                    this.$tpl_font_size = $(tpl_content);
                    self.$typo_close.after(this.$tpl_font_size);

                    // this.$content = self.$extend.find('.' + self.namespace + '-fontSize-content');
                    this.$font_size = self.$extend.find('.' + self.namespace + '-fontSize-range');
                    this.$font_size_value = self.$extend.find('.' + self.namespace + '-fontSize-value');
                    this.$font_size_unit = this.$font_size_value.find('span');

                    if (this.font_size_value == self.options.font_size.min) {
                        $(this.$font_size_value)[0].firstChild.nodeValue = "inherit";
                        $(this.$font_size_unit).text("");
                    } else {
                        $(this.$font_size_value)[0].firstChild.nodeValue = this.font_size_value;
                        $(this.$font_size_unit).text(this.font_size_unit);
                    }

                    this.$font_size.range({
                        namespace: self.options.font_size.namespace,
                        min: parseInt(self.options.font_size.min),
                        max: parseInt(self.options.font_size.max),
                        step: parseFloat(self.options.font_size.step),
                        pointer: 1,
                        value: [oneself.font_size_value],
                        onChange: function(newValue) {
                            oneself.font_size_value = newValue;
                            if (newValue == self.options.font_size.min) {
                                $(oneself.$font_size_value)[0].firstChild.nodeValue = "inherit";
                                $(oneself.$font_size_unit).text("");
                                self.value.font_size = "inherit";
                            } else {
                                $(oneself.$font_size_value)[0].firstChild.nodeValue = oneself.font_size_value;
                                $(oneself.$font_size_unit).text(oneself.font_size_unit);
                                self.value.font_size = oneself.font_size_value + oneself.font_size_unit;
                            }
                            self._process();
                        }
                    });
                },

                set: function(newValue) {
                    this.$font_size.data('range').set(newValue);
                }
            },

            doLineHeight: {
                init: function() {
                    var oneself = this;
                    if (!self.value.line_height) {
                        this.line_height_value = self.options.line_height.value;
                        this.line_height_unit = self.options.line_height.unit;
                    } else if (self.value.line_height === "inherit") {
                        this.line_height_value = self.options.line_height.min;
                        if (self.options.line_height.unit == "inherit") {
                            this.line_height_unit = "";
                        } else {
                           this.line_height_unit = self.options.line_height.unit; 
                        }
                    } else {
                        this.line_height_value = self.parse(self.value.line_height).number;
                        this.line_height_unit = self.parse(self.value.line_height).unit;
                    }

                    var tpl_content = self.options.line_height.tpl().replace(/lineHeightNamespace/g, self.options.line_height.namespace).replace(/namespace/g, self.namespace);
                    this.$tpl_line_height = $(tpl_content);
                    self.$typo_close.after(this.$tpl_line_height);

                    // this.$content = self.$extend.find('.' + self.namespace + '-lineHeight-content');
                    this.$line_height = self.$extend.find('.' + self.namespace + '-lineHeight-range');
                    this.$line_height_value = self.$extend.find('.' + self.namespace + '-lineHeight-value');
                    this.$line_height_unit = this.$line_height_value.find('span');
                    console.log(this,this.$line_height_value,this.$line_height_unit,(this.$line_height_value)[0]);

                    if (this.line_height_value == self.options.line_height.min) {
                        $(this.$line_height_value)[0].firstChild.nodeValue = "inherit";
                        $(this.$line_height_unit).text("");
                    } else {
                        $(this.$line_height_value)[0].firstChild.nodeValue = this.line_height_value;
                        $(this.$line_height_unit).text(this.line_height_unit);
                    }

                    this.$line_height.range({
                        namespace: self.options.line_height.namespace,
                        min: parseInt(self.options.line_height.min),
                        max: parseInt(self.options.line_height.max),
                        step: parseFloat(self.options.line_height.step),
                        pointer: 1,
                        value: [oneself.line_height_value],
                        onChange: function(newValue) {
                            oneself.line_height_value = newValue;
                            if (newValue == self.options.line_height.min) {
                                $(oneself.$line_height_value)[0].firstChild.nodeValue = "inherit";
                                $(oneself.$line_height_unit).text("");
                                self.value.line_height = "inherit";
                            } else {
                                $(oneself.$line_height_value)[0].firstChild.nodeValue = oneself.line_height_value;
                                $(oneself.$line_height_unit).text(oneself.line_height_unit);
                                self.value.line_height = oneself.line_height_value + oneself.line_height_unit;
                            }
                            self._process();
                        }
                    });
                },

                set: function(newValue) {
                    self.$typo_line_height.data('range').set(newValue);
                }
            },

            doTextAlign: {
                init: function() {
                    var oneself = this;
                    if (!self.value.text_align) {
                        this.text_align = self.options.text_align.default_value;
                    } else {
                        this.text_align = self.value.text_align;
                    }

                    var tpl_content = self.options.text_align.tpl().replace(/namespace/g, self.namespace);
                    this.$tpl_text_align = $(tpl_content);
                    self.$typo_close.after(this.$tpl_text_align);

                    self.$typo_decorations = self.$extend.find('.' + self.namespace + '-decorations');
                    this.$items = self.$typo_decorations.find('.' + self.namespace + '-textAlign');
                    this.values = self.options.text_align.values;

                    $.each(this.values, function(key, value) {
                        oneself.$items.eq(key).data('text_align', value);
                    });

                    this.set(this.text_align);
                    this.bindEvent();
                },

                set: function(newValue) {
                    this.$items.removeClass(self.classes.active);
                    for (var i = 0; i < this.values.length; i++) {
                        if (newValue === this.values[i]) {
                            self.value.text_align = newValue;
                            this.$items.eq(i).addClass(self.classes.active);
                        }
                    };
                },

                bindEvent: function() {
                    var oneself = this;
                    this.$items.on("click", function() {
                        if (self.disabled) {
                            return;
                        }

                        var align = $(this).data("text_align");
                        oneself.set(align);
                        self._process();
                        return false;
                    });
                }
            },

            doFontStyle: {
                init: function() {
                    var oneself = this;
                    if (!self.value.font_style) {
                        this.font_style = self.options.font_style.default_value;
                    } else {
                        this.font_style = self.value.font_style;
                    }

                    var tpl_content = self.options.font_style.tpl().replace(/namespace/g, self.namespace);
                    this.$tpl_font_style = $(tpl_content);
                    self.$typo_decorations.append(this.$tpl_font_style);
                    this.value = self.options.font_style.value;

                    console.log(this.$tpl_font_style);

                    this.$tpl_font_style.data('font_style', this.value);

                    this.set(this.font_style);
                    this.bindEvent();
                },

                set: function(newValue) {

                    this.$tpl_font_style.removeClass(self.classes.active);
                    if (newValue === this.value) {
                        self.value.font_style = newValue;
                        this.$tpl_font_style.addClass(self.classes.active);
                    }                    
                },

                bindEvent: function() {
                    var oneself = this;
                    this.$tpl_font_style.on("click", function() {
                        if (self.disabled) {
                            return;
                        }
                        if ($(this).hasClass(self.classes.active)) {
                            $(this).removeClass(self.classes.active);
                            self.value.font_style = self.options.font_style.default_value;
                        } else {
                            $(this).addClass(self.classes.active);
                            self.value.font_style = oneself.value;
                        }
                        self._process();
                        return false;
                    });
                }
            },

            doTextTransform: {
                init: function() {
                    var oneself = this;
                    if (!self.value.text_transform) {
                        this.text_transform = self.options.text_transform.default_value;
                    } else {
                        this.text_transform = self.value.text_transform;
                    }

                    var tpl_content = self.options.text_transform.tpl().replace(/namespace/g, self.namespace);
                    this.$tpl_text_transform = $(tpl_content);
                    self.$typo_decorations.append(this.$tpl_text_transform);

                    this.$items = self.$extend.find('.' + self.namespace + '-textTransform');
                    // this.$items = this.$text_transform.find('li');
                    this.values = self.options.text_transform.values;

                    $.each(this.values, function(key, value) {
                        oneself.$items.eq(key).data('text_transform', value);
                    });

                    this.set(this.text_transform);
                    this.bindEvent();
                },

                set: function(newValue) {
                    this.$items.removeClass(self.classes.active);
                    for (var i = 0; i < this.values.length; i++) {
                        if (newValue === this.values[i]) {
                            self.value.text_transform = newValue;
                            this.$items.eq(i).addClass(self.classes.active);
                        }
                    };
                },

                bindEvent: function() {
                    var oneself = this;
                    this.$items.on("click", function() {
                        if (self.disabled) {
                            return;
                        }

                        var transform = $(this).data("text_transform");
                        oneself.set(transform);
                        self._process();
                        return false;
                    });
                }
            },

            doTextDecoration: {
                init: function() {
                    var oneself = this;
                    if (!self.value.text_decoration) {
                        this.text_decoration = self.options.text_decoration.default_value;
                    } else {
                        this.text_decoration = self.value.text_decoration;
                    }

                    var tpl_content = self.options.text_decoration.tpl().replace(/namespace/g, self.namespace);
                    this.$tpl_text_decoration = $(tpl_content);
                    self.$typo_decorations.append(this.$tpl_text_decoration);

                    this.$items = $('.' + self.namespace + '-textDecoration', self.$extend);
                    // this.$items = this.$text_decoration.find('li');
                    this.values = self.options.text_decoration.values;

                    $.each(this.values, function(key, value) {
                        oneself.$items.eq(key).data('text_decoration', value);
                    });

                    this.set(this.text_decoration);
                    this.bindEvent();
                },

                set: function(newValue) {
                    console.log(this.$items)
                    this.$items.removeClass(self.classes.active);
                    for (var i = 0; i < this.values.length; i++) {
                        if (newValue === this.values[i]) {
                            self.value.text_decoration = newValue;
                            this.$items.eq(i).addClass(self.classes.active);
                        }
                    };
                },

                bindEvent: function() {
                    var oneself = this;
                    console.log(this.$items)
                    this.$items.on("click", function() {
                        alert("1");
                        if (self.disabled) {
                            return;
                        }

                        var decoration = $(this).data("text_decoration");
                        oneself.set(decoration);
                        self._process();
                        return false;
                    });
                }
            }

        });

        this._trigger('init');
        this.init();
    };

    Plugin.prototype = {
        constructor: Plugin,
        components: {},

        val: function(value, update) {
            if (typeof value === 'undefined') {
                return this.value;
            }

            if (value) {
                this.set(value, update);
            } else {
                this.clear(update);
            }
        },

        // set: function(value, update) {
        //     var self = this;

        //     if (update !== false) {
        //         self.value = value;

        //         // self.setImage(value.image);
        //         // self.doRepeat.set(value.repeat);
        //         // self.doSize.set(value.size);
        //         // self.doPosition.set(value.position);
        //         // self.doAttachment.set(value.attachment);

        //         self._process();
        //         self.options.onChange.call(self, value);
        //     }
        // },

        // clear: function(update) {
        //     var self = this;
        //     self.value = null;

        //     if (update !== false) {
        //         var image = "",
        //             repeat = "",
        //             position = "",
        //             attachment = "",
        //             size = "";

        //         self._process();
        //         self.options.onChange.call(self, self.value);
        //     }
        // },

        parse: function(value) {
            var reg1,reg2,arry1,arry2,number_value,unit_value;
            reg1 = /(\d+)\.(\d+)|\d+/g;
            reg2 = /[^0-9|.]/g;

            arry1 = value.match(reg1);
            arry2 = value.match(reg2);

            if (arry2) {
                unit_value = arry2.join("");
            } else {
                unit_value = "";
            }

            number_value = parseFloat(arry1.join(""));

            return {
                number: number_value,
                unit: unit_value
            };
        },


        enable: function() {
            this.disabled = false;
            this.$wrap.removeClass(this.classes.disabled);
        },
        disable: function() {
            this.disabled = true;
            this.$wrap.addClass(this.classes.disabled);
        },
        destory: function() {
            this.$element.data(pluginName, null);
            this.$wrap.remove();
            this._trigger('destory');
        }
    };

    Plugin.defaults = {
        namespace: pluginName,
        skin: null,

        font_family: {
            namespace: 'az-dropdown',
            default_value: 'none',
            values: ["inherit", "Arial", "Bpreplay", "Cambira", "Gabriola"],
            tpl: function() {
                return '<div class="namespace-fontFamily">' + 
                            '<span class="namespace-fontFamily-title">Typeface</span>' + 
                            '<div class="namespace-fontFamily-content">' + 
                                '<div class="fontFamilyNamespace namespace-fontFamily-dropdown"><i></i></div>' + 
                                '<ul>' + 
                                    '<li>none</li>' + 
                                    '<li>Arial</li>' +
                                    '<li>Bpreplay</li>' +
                                    '<li>Cambira</li>' + 
                                    '<li>Gabriola</li>' + 
                                '</ul>' + 
                            '</div>' + 
                        '</div>'; 
            }

        },

        font_weight: {
            namespace: 'az-dropdown',
            default_value: 'normal',
            values: ["normal", "bold", "400", "500", "600", "700"],
            tpl: function() {
                return '<div class="namespace-fontWeight">' + 
                            '<span class="namespace-fontWeight-title">Weight</span>' + 
                            '<div class="namespace-fontWeight-content">' + 
                                '<div class="fontWeightNamespace namespace-fontWeight-dropdown"><i></i></div>' + 
                                '<ul>' + 
                                    '<li>normal</li>' +
                                    '<li>bold</li>' + 
                                    '<li>400</li>' + 
                                    '<li>500</li>' + 
                                    '<li>600</li>' + 
                                    '<li>700</li>' + 
                                '</ul>' + 
                            '</div>' + 
                        '</div>';
            }
        },

        
        font_size: {
            namespace: 'az-range',
            value: 16,
            unit: "px",//not set "inherit"
            min: 0,
            max: 100,
            step: 2,
            tpl: function() {
                return '<div class="namespace-fontSize">' + 
                            '<span class="namespace-fontSize-title">Font Size</span>' +
                            '<div class="namespace-fontSize-content">' + 
                                '<div class="fontSizeNamespace namespace-fontSize-range"></div>' + 
                                '<div class="namespace-fontSize-value">0<span>px</span></div>' + 
                            '</div>' + 
                        '</div>';
            }
        },
        line_height: {
            namespace: 'az-range',
            value: 1,
            unit: "inherit",
            min: 1,
            max: 10,
            step: 0.5,
            tpl: function() {
                return '<div class="namespace-lineHeight">' + 
                            '<span class="namespace-lineHeight-title">Line Height</span>' +
                            '<div class="namespace-lineHeight-content">' + 
                                '<div class="lineHeightNamespace namespace-lineHeight-range"></div>' + 
                                '<div class="namespace-lineHeight-value">0<span>em</span></div>' + 
                            '</div>' + 
                        '</div>';
            }
        },

        text_align: {
            default_value: 'inherit',
            values: ["left", "center", "right"],
            tpl: function() {
                return '<ul class="namespace-decorations">' + 
                            '<li class="namespace-textAlign text-left"></li>' + 
                            '<li class="namespace-textAlign text-center"></li>' + 
                            '<li class="namespace-textAlign text-right"></li>' + 
                        '</ul>';
            }
        },

        font_style: {
            default_value: 'normal',
            value: 'italy',
            tpl: function() {
                return '<li class="namespace-fontStyle text-italy"></li>';
            }
        },
        text_transform: {
            default_value: 'normal',
            values: ["uppercase", "lowercase", "capitalize"],
            tpl: function() {
                return  '<li class="namespace-textTransform text-uppercase"></li>' + 
                        '<li class="namespace-textTransform text-lowercase"></li>' + 
                        '<li class="namespace-textTransform text-capitalize"></li>';
            }
        },
        text_decoration: {
            default_value: 'none',
            values: ["underline", "line-through"],
            tpl: function() {
                return  '<li class="namespace-textDecoration text-underline"></li>' + 
                        '<li class="namespace-textDecoration text-linethrough"></li>';
            }
        },


        tpl: function() {
            return '<div class="' + this.namespace + '">' +
                        '<div class="' + this.namespace + '-trigger">' + 
                            '<div class="' + this.namespace + '-font"><span>Aa</span>Add typography</div>' + 
                            '<div class="' + this.namespace + '-mask">Extend</div>' + 
                            '<a class="' + this.namespace + '-remove" href="">x</a>' + 
                        '</div>' +
                    '</div>';
        },

        tpl_extend: function() {
            return '<div class="' + this.namespace + '-extend">' + 
                        '<a class="' + this.namespace + '-close" href="#">-</a>' + 
                    '</div>';
        },

        process: function(value) {
            if (value) {
                return JSON.stringify(value);
            } else {
                return '';
            }
        },

        parse: function(value) {
            if (value) {
                return $.parseJSON(value);
            } else {
                return null;
            }
        },

        onChange: function() {},
        onClick: function() {}
    };

    Plugin.registerComponent = function(component, methods) {
        Plugin.prototype.components[component] = methods;
    };

    $.fn[pluginName] = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;

            if (/^\_/.test(method)) {
                return false;
            } else if ((/^(getTabs)$/.test(method)) || (method === 'val' && method_arguments === undefined)) {
                var api = this.first().data(pluginName);
                if (api && typeof api[method] === 'function') {
                    return api[method].apply(api, method_arguments);
                }
            } else {
                return this.each(function() {
                    var api = $.data(this, pluginName);
                    if (api && typeof api[method] === 'function') {
                        api[method].apply(api, method_arguments);
                    }
                });
            }
        } else {
            return this.each(function() {
                if (!$.data(this, pluginName)) {
                    $.data(this, pluginName, new Plugin(this, options));
                }
            });
        }
    };
})(jQuery, document, window);

