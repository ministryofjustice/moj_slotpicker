
(function() {
  'use strict';

  var SlotPicker;

  SlotPicker = function(el, options) {
    this.settings = $.extend({}, this.defaults, options);
    this.cacheEls(el);
    this.bindEvents();
    this.setupNav();
    this.updateNav(0);
    this.consolidate();
    this.markChosenSlots(this.settings.originalSlots);
    return this;
  };

  SlotPicker.prototype = {
    defaults: {
      optionlimit: 3,
      selections: 'has-selections',
      bookableSlots: [],
      bookableDates: [],
      originalSlots: [],
      currentSlots: [],
      calendarDayHeight: 56,
      navPointer: 0
    },
    cacheEls: function() {
      this.$wrapper = $('#wrapper');
      this.$slotInputs = $('.js-slotpicker-slot');
      this.$slotOptions = $('.js-slotpicker-option');
      this.$selectedSlotWrapper = $('.js-selected-slots');
      this.$selectedSlots = $('.selected-slots li');
      this.$removeSlots = '.js-remove-slot';
      this.$promoteSlots = '.js-promote-slot';
      this.$promoteHelp = $('.js-promote-help');
      this.$months = $('.js-slotpicker__months');
      this.$next = $('.BookingCalendar-nav .next');
      this.$prev = $('.BookingCalendar-nav .prev');
      this.$availableMonths = $('.BookingCalendar-availableMonths a');
    },
    bindEvents: function() {
      var _this = this;
      _this = this;
      this.$slotOptions.on('click', function() {
        _this.$selectedSlotWrapper.addClass('is-active');
        _this.emptyUiSlots();
        _this.emptySlotInputs();
        _this.unHighlightSlots();
        _this.checkSlot($(this));
        _this.processSlots();
        _this.disableCheckboxes(_this.limitReached());
        return _this.togglePromoteHelp();
      });
      this.$wrapper.on('click', this.$removeSlots, function(e) {
        e.preventDefault();
        $($(this).data('slot-option')).click();
      });
      this.$wrapper.on('click', this.$promoteSlots, function(e) {
        var promoted;
        e.preventDefault();
        promoted = $(this).attr('href').split('#')[1] - 1;
        _this.promoteSlot(promoted);
        _this.processSlots();
      });
      $('.BookingCalendar-dayLink, .DateSlider-largeDates li').on('click chosen', function(e) {
        e.preventDefault();
        _this.selectDay($(this));
        $('.js-slotpicker').addClass('is-active');
        if (e.type !== 'chosen') {
          return _this.confirmVisibility(_this.$months);
        }
      });
      this.$next.on('click', function(e) {
        e.preventDefault();
        return _this.nudgeNav(1);
      });
      return this.$prev.on('click', function(e) {
        e.preventDefault();
        return _this.nudgeNav(-1);
      });
    },
    setupNav: function() {
      var self;
      self = this;
      this.settings.months = this.$availableMonths.map(function() {
        var item;
        item = $(this);
        return {
          label: item.text(),
          date: item.attr('href'),
          pos: $(item.attr('href')).closest('tr').index() * self.settings.calendarDayHeight
        };
      });
    },
    updateNav: function(i) {
      if (i > 0) {
        this.$prev.removeClass('hidden').text(this.settings.months[i - 1].label);
      } else {
        this.$prev.addClass('hidden');
      }
      if (i + 1 < this.settings.months.length) {
        this.$next.removeClass('hidden').text(this.settings.months[i + 1].label);
      } else {
        this.$next.addClass('hidden');
      }
      return $('.BookingCalendar-nav strong').text(this.settings.months[i].label);
    },
    nudgeNav: function(i) {
      this.settings.navPointer = i + this.settings.navPointer;
      this.updateNav(this.settings.navPointer);
      return $('.BookingCalendar-wrap').animate({
        scrollTop: this.settings.months[this.settings.navPointer].pos
      }, 200);
    },
    consolidate: function() {
      this.settings.bookableSlots = this.$slotInputs.first().find('select option').map(function() {
        return $(this).val();
      }).get().filter(function(v){return v!=='';});
      this.settings.bookableDates = this.settings.bookableSlots.map(function(s) {
        return s.substr(0, 10);
      });
      this.settings.originalSlots = this.$slotInputs.find('select').map(function() {
        return $(this).val();
      }).get().filter(function(v){return v!=='';});
    },
    selectDay: function(day) {
      var bookingFrom, date, dateStr, today;
      dateStr = day.data('date');
      date = new Date(dateStr);
      $('.js-slotpicker-options').removeClass('is-active');
      if (!~this.settings.bookableDates.indexOf(dateStr)) {
        today = new Date((new Date()).formatIso());
        bookingFrom = new Date(this.settings.bookableDates[0]);
        if (date < today) {
          $('#in-the-past').addClass('is-active');
        }
        if (date >= today) {
          if (date > bookingFrom) {
            $('#too-far-ahead').addClass('is-active');
          } else {
            $('#booking-gap').addClass('is-active');
          }
        }
      } else {
        $('#date-' + dateStr).addClass('is-active').focus();
      }
      $('.BookingCalendar-day--bookable.is-active').removeClass('is-active');
      return day.closest('td').addClass('is-active');
    },
    togglePromoteHelp: function() {
      return this.$promoteHelp[this.settings.currentSlots.length > 1 ? 'addClass' : 'removeClass']('is-active');
    },
    markChosenSlots: function(slots) {
      var slot, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = slots.length; _i < _len; _i++) {
        slot = slots[_i];
        _results.push($('[value="' + slot + '"]').click());
      }
      return _results;
    },
    highlightSlot: function(slot) {
      return slot.addClass('is-active');
    },
    unHighlightSlots: function() {
      return $('.js-slotpicker-options label').removeClass('is-active');
    },
    emptyUiSlots: function() {
      var slots;
      slots = this.$selectedSlots;
      slots.removeClass('is-active');
      slots.find('a').removeData();
      return slots.find('.date, .time').text('');
    },
    emptySlotInputs: function() {
      return this.$slotInputs.find('select').val('');
    },
    populateUiSlots: function(index, checkbox) {
      var $slot, date, day, duration, label, time;
      date = this.splitDateAndSlot(checkbox.val())[0];
      label = checkbox.closest('label');
      day = label.siblings('h4').text();
      time = label.find('strong').text();
      duration = label.find('.duration').text();
      $slot = this.$selectedSlots.eq(index);
      $slot.addClass('is-active');
      $slot.find('.date').text(day);
      $slot.find('.time').text([time, duration].join(', '));
      return $slot.find('.js-remove-slot').data('slot-option', checkbox);
    },
    populateSlotInputs: function(index, chosen) {
      return this.$slotInputs.eq(index).find('select').val(chosen);
    },
    processSlots: function() {
      var $slotEl, i, slot, _i, _len, _ref, _results, _this;
      _this = this;
      i = 0;
      _ref = this.settings.currentSlots;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        slot = _ref[_i];
        $slotEl = $('[value=' + slot + ']');
        _this.highlightSlot($slotEl.closest('label'));
        _this.populateSlotInputs(i, $slotEl.val());
        _this.populateUiSlots(i, $slotEl);
        _results.push(i++);
      }
      return _results;
    },
    limitReached: function() {
      return this.$slotOptions.filter(':checked').length >= this.settings.optionlimit;
    },
    disableCheckboxes: function(disable) {
      this.$slotOptions.not(':checked').prop('disabled', disable);
      return this.$slotOptions.not(':checked').closest('label')[disable ? 'addClass' : 'removeClass']('is-disabled');
    },
    splitDateAndSlot: function(str) {
      var bits, time;
      bits = str.split('-');
      time = bits.splice(-2).join('-');
      return [bits.join('-'), time];
    },
    checkSlot: function(el) {
      if (el.is(':checked')) {
        return this.addSlot(el.val());
      } else {
        return this.removeSlot(el.val());
      }
    },
    addSlot: function(slot) {
      this.settings.currentSlots.push(slot);
      return this.highlightDay(slot);
    },
    removeSlot: function(slot) {
      var pos;
      pos = this.settings.currentSlots.indexOf(slot);
      this.settings.currentSlots.splice(pos, 1);
      return this.highlightDay(slot);
    },
    promoteSlot: function(pos) {
      this.settings.currentSlots = this.settings.currentSlots.move(pos, pos - 1);
    },
    highlightDay: function(slot) {
      var day;
      day = this.splitDateAndSlot(slot)[0];
      return $('[data-date=' + day + ']')[~this.settings.currentSlots.join('-').indexOf(day) ? 'addClass' : 'removeClass']('is-chosen');
    },
    confirmVisibility: function($el) {
      if (!this.isElementInViewport($el.get(0))) {
        return this.moveIntoViewport($el);
      }
    },
    isElementInViewport: function(el) {
      var rect = el.getBoundingClientRect();

      return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
          rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
      );
    },
    moveIntoViewport: function($el) {
      var bottom;
      bottom = $el.offset().top + $el.height();
      return $('html,body').animate({
        scrollTop: bottom - $(window).height()
      }, 350);
    }
  };

  moj.Modules.slotPicker = {
    init: function() {
      return $('.js-slotpicker').each(function() {
        return $(this).data('slotpicker', new SlotPicker($(this), $(this).data()));
      });
    }
  };

}).call(this);
