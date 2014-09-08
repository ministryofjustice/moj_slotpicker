/**
 * moj.slot-picker - UI components for selecting time slots
 * @version v0.21.1
 * @link https://github.com/ministryofjustice/moj_slotpicker
 * @license OGL v2.0 - https://github.com/ministryofjustice/moj_slotpicker/blob/master/LICENCE.md
 */

(function() {
  'use strict';

  var DateSlider = function($el, options) {
    this.settings = $.extend({}, this.defaults, options);
    this.slotPicker = $el.closest('.SlotPicker').data('SlotPicker').settings;
    this.render($el);
    this.cacheEls($el);
    this.bindEvents();
    this.calculateDimensions();
    this.resizeElements();
    this.inputDevice();
    if (this.settings.selectonload && $el.is(':visible')) {
      this.selectDateFromIndex(0);
    }
    return this;
  };

  DateSlider.prototype = {
    defaults: {
      currentPos: 0,
      visibleDays: 12,
      displayDays: 5,
      selectableDays: 6,
      width: 700,
      dayWidth: 100,
      middle: 300,
      inactive: 300,
      animateSpeed: 250,
      selectonload: false,
      resizeonload: true,
      centreonday: true,
      emulatetouch: false,

      days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      months: ['January','February','March','April','May','June','July','August','September','October','November','December'],

      UPNESS: 0.22,
      SQUASHDAYS: 0.95,
      MAGNIFYDAY: 1.4,
      MAGNIFYFONT: 1.33,
      BORDERWIDTH: 2,
      FONTSIZESCALE: 0.52,
      SHRINKWEEKDAY: 0.42
    },

    cacheEls: function($el) {
      this.$_el = $el;

      this.$window = $(window);

      this.$scrolls = $('.scroll', $el);
      this.$large = $('.DateSlider-largeDates', $el);
      this.$touch = $('.DateSlider-touch', $el);
      this.$months = $('.DateSlider-month span', $el);
      this.$buttonL = $('.DateSlider-buttonLeft', $el);
      this.$buttonR = $('.DateSlider-buttonRight', $el);

      // needed for CSS changes
      this.$small = $('.DateSlider-smallDates', $el);
      this.$day = $('li', $el);
      this.$largeRow = $('.DateSlider-days', this.$large);
    },

    render: function() {
      var len = this.slotPicker.bookableDates.length,
          from = moj.Helpers.dateFromIso(this.slotPicker.bookableDates[0]),
          to = moj.Helpers.dateFromIso(this.slotPicker.bookableDates[len - 1]),
          buffer = Math.floor(this.settings.displayDays / 2),
          bufferFrom = new Date(), bufferTo = new Date();
      
      // clone date range
      bufferFrom.setTime(from.getTime());
      bufferTo.setTime(to.getTime());

      bufferFrom.setDate(bufferFrom.getDate() - buffer);
      bufferTo.setDate(bufferTo.getDate() + buffer);

      $('.DateSlider-largeDates .DateSlider-days').append(this.buildDays(from, to, true));
      $('.DateSlider-smallDates .DateSlider-days').append(this.buildDays(bufferFrom, bufferTo));
      $('.DateSlider-month').append(this.buildMonthLabels(moj.Helpers.monthsInRange(from, to)));
    },

    bindEvents: function() {
      var self = this;

      this.$touch.on({
        scroll: function() {
          self.syncScrollPos(self.$touch);
        },
        click: function(e) {
          self.slide(self.posOfDateAt(e.offsetX));
        }
      });

      this.$large.on({
        chosen: function() {
          if (self.differentPos(self.$large.scrollLeft())) {
            self.selectDateFromIndex(self.settings.currentPos / self.settings.dayWidth);
          }
        },
        scroll: function() {
          self.centreDateWhenInactive(self);
        }
      });

      this.$window.on('resize', function() {
        self.calculateDimensions();
        self.resizeElements();
        self.centreDateWhenInactive(self);
      });

      this.$buttonL.on('click', function(e) {
        e.preventDefault();
        self.slide(self.settings.currentPos - self.settings.dayWidth);
      });

      this.$buttonR.on('click', function(e) {
        e.preventDefault();
        self.slide(self.settings.currentPos + self.settings.dayWidth);
      });
    },

    calculateDimensions: function() {
      this.settings.viewPort        = this.$window.width();
      
      this.settings.visibleDays     = this.$small.find('li').length;
      this.settings.selectableDays  = this.$large.find('li').length;

      this.settings.dayWidth        = Math.floor(this.settings.viewPort / this.settings.displayDays);
      this.settings.width           = this.settings.dayWidth * this.settings.displayDays;
      this.settings.middle          = Math.floor(this.settings.displayDays / 2) * this.settings.dayWidth;
      
      this.settings.dayHeight       = Math.floor(this.settings.dayWidth * this.settings.SQUASHDAYS);
      this.settings.largeHeight     = Math.floor(this.settings.dayHeight * this.settings.MAGNIFYDAY);
      this.settings.largeLineHeight = (this.settings.largeHeight * this.settings.UPNESS) * 2 + this.settings.dayHeight;
      this.settings.topOffset       = Math.floor(this.settings.largeHeight * this.settings.UPNESS);
      
      this.settings.fontSmall       = this.settings.dayHeight * this.settings.FONTSIZESCALE;
      this.settings.fontLarge       = this.settings.fontSmall * this.settings.MAGNIFYFONT;
      this.settings.fontSmaller     = this.settings.fontLarge * this.settings.SHRINKWEEKDAY;
    },

    resizeElements: function() {
      var unit = 'px';

      if (!this.settings.resizeonload) {
        return this.$_el.css({visibility: 'visible'});
      }
      
      this.$buttonL.add(this.$buttonR).css({
        width: this.settings.dayWidth + unit,
        height: this.settings.dayHeight + unit,
        fontSize: this.settings.fontLarge + unit,
        lineHeight: this.settings.dayHeight + unit
      });
      
      $('.DateSlider-sliders', this.$_el).css({
        height: this.settings.dayHeight + unit
      });
      
      this.$day.css({
        width: this.settings.dayWidth + unit,
        fontSize: this.settings.fontSmall + unit,
        lineHeight: this.settings.dayHeight + unit
      });
      
      $('.DateSlider-days', this.$touch).css({
        width: (this.settings.dayWidth * this.settings.visibleDays) + unit
      });
      
      $('.DateSlider-days', this.$small).css({
        width: (this.settings.dayWidth * this.settings.visibleDays) + unit
      });
      
      this.$largeRow.css({
        width: (this.settings.dayWidth * this.settings.selectableDays) + unit
      });
      
      $('li', this.$largeRow).css({
        fontSize: this.settings.fontLarge + unit,
        lineHeight: this.settings.largeLineHeight + unit
      });

      $('small', this.$largeRow).css({
        fontSize: this.settings.fontSmaller + unit
      });

      this.$scrolls.css({
        width: this.settings.viewPort + unit
      });

      this.$touch.css({
        height: this.settings.largeHeight + this.settings.BORDERWIDTH * 2 + unit,
        top: -Math.floor(this.settings.largeHeight * this.settings.UPNESS) + unit
      });

      this.$large.css({
        height: this.settings.largeHeight + unit,
        width: this.settings.dayWidth + unit,
        top: -(this.settings.topOffset - this.settings.BORDERWIDTH) + unit,
        left: this.settings.middle + unit
      });

      $('.DateSlider-portalFrame', this.$_el).css({
        width: (this.settings.dayWidth - this.settings.BORDERWIDTH) + unit,
        height: this.settings.largeHeight + unit,
        top: -this.settings.topOffset + unit,
        left: (this.settings.middle - this.settings.BORDERWIDTH / 2) + unit
      });

      this.$_el.css({
        visibility: 'visible'
      });
    },

    inputDevice: function() {
      if (this.settings.emulatetouch) {
        this.$buttonL.remove();
        this.$buttonR.remove();
        return;
      }
      return (Modernizr.touch ? this.$buttonL.add(this.$buttonR) : this.$touch).remove();
    },

    differentPos: function(pos) {
      if (this.settings.currentPos !== pos) {
        this.settings.currentPos = pos;
        return true;
      }
    },

    slide: function(pos) {
      var self = this;

      this.$scrolls.animate({
        scrollLeft: pos
      }, self.settings.animateSpeed).promise().done(function() {
        self.$large.trigger('chosen');
      });
    },

    selectDateFromIndex: function(index) {
      var day = this.$large.find('li').eq(index);
      
      day.trigger('chosen');
      this.showMonthForDate(day.data('date'));
    },

    showMonthForDate: function(dateStr) {
      var self = this;

      this.$months.removeClass('is-active').filter(function() {
        return $(this).data('date') === self.yearMonthFromDate(dateStr);
      }).addClass('is-active');
    },

    yearMonthFromDate: function(date) {
      return moj.Helpers.formatIso(date).split('-').splice(0, 2).join('-');
    },

    posOfDateAt: function(x) {
      return (Math.floor(x / this.settings.dayWidth) * this.settings.dayWidth) - this.settings.middle;
    },

    posOfNearestDateTo: function(x) {
      var balance = x % this.settings.dayWidth;

      if (balance > this.settings.dayWidth / 2) {
        return x - balance + this.settings.dayWidth;
      } else {
        return x - balance;
      }
    },

    syncScrollPos: function($el) {
      $el.siblings('.scroll').scrollLeft($el.scrollLeft());
    },

    centreDateWhenInactive: function(obj) {
      var self = this;

      if (!this.settings.centreonday) {
        return;
      }

      clearTimeout($.data(obj, 'scrollTimer'));

      $.data(obj, 'scrollTimer', setTimeout(function() {
        self.slide(self.posOfNearestDateTo(self.$large.scrollLeft()));
      }, self.settings.inactive));
    },

    buildDays: function(from, to, dayLabel) {
      var template = moj.Helpers.getTemplate('#DateSlider-tmplDay'),
          out = '', curIso,
          curDate = new Date();

      // clone date to prevent changing original var
      curDate.setTime(from.getTime());
      
      while (curDate <= to) {
        curIso = moj.Helpers.formatIso(curDate);
        
        out+= template({
          dayLabel: dayLabel,
          klass: moj.Helpers.dateBookable(curIso, this.slotPicker.bookableDates) ? '' : 'unavailable',
          isoDate: curIso,
          day: curIso.substr(8, 2),
          weekDay: this.settings.days[curDate.getDay()].substr(0, 3)
        });
        
        curDate.setDate(curDate.getDate() + 1);
      }

      return out;
    },

    buildMonthLabels: function(months) {
      var template = moj.Helpers.getTemplate('#DateSlider-tmplMonth'),
          out = '', month;

      for (month in months) {
        out+= template({
          yearMonth: this.yearMonthFromDate(months[month]),
          month: this.settings.months[months[month].getMonth()]
        });
      }

      return out;
    }
  };


  moj.Helpers.monthsInRange = function(from, to) {
    var months = [], lastMonth, date;

    while (from <= to) {
      if (from.getMonth() !== lastMonth) {
        date = new Date(from.getTime());
        date.setDate(1);
        months.push(date);
      }
      lastMonth = from.getMonth();
      from.setDate(from.getDate() + 1);
    }
    
    return months;
  };


  moj.Modules.DateSlider = {
    init: function() {
      return $('.DateSlider').each(function() {
        $(this).data('DateSlider', new DateSlider($(this), $(this).data()));
      });
    }
  };

}());
