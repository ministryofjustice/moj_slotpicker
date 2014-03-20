
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
      var self = this;

      this.$slotOptions.on('click', function() {
        self.$selectedSlotWrapper.addClass('is-active');
        self.emptyUiSlots();
        self.emptySlotInputs();
        self.unHighlightSlots();
        self.checkSlot($(this));
        self.processSlots();
        self.disableCheckboxes(self.limitReached());
        self.togglePromoteHelp();
      });

      this.$wrapper.on('click', this.$removeSlots, function(e) {
        e.preventDefault();
        $($(this).data('slot-option')).click();
      });

      this.$wrapper.on('click', this.$promoteSlots, function(e) {
        e.preventDefault();
        self.promoteSlot($(this).attr('href').split('#')[1] - 1);
        self.processSlots();
      });

      $('.BookingCalendar-dayLink, .DateSlider-largeDates li').on('click chosen', function(e) {
        e.preventDefault();
        self.selectDay( $(this) );
        $('.js-slotpicker').addClass( 'is-active' );
        
        if (e.type !== 'chosen') {
          self.confirmVisibility(self.$months);
        }
      });

      this.$next.on('click', function(e) {
        e.preventDefault();
        self.nudgeNav(1);
      });

      this.$prev.on('click', function(e) {
        e.preventDefault();
        self.nudgeNav(-1);
      });
    },

    setupNav: function() {
      var self = this;

      this.settings.months = this.$availableMonths.map(function() {
        var item = $(this);

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

      $('.BookingCalendar-nav strong').text(this.settings.months[i].label);
    },

    nudgeNav: function(i) {
      this.settings.navPointer = i + this.settings.navPointer;
      this.updateNav(this.settings.navPointer);
      $('.BookingCalendar-wrap').animate({
        scrollTop: this.settings.months[this.settings.navPointer].pos
      }, 200);
    },

    consolidate: function() {
      this.settings.bookableSlots = this.$slotInputs.first().find('select option').map(function() {
        var v = $(this).val();
        if (v !== '') {
          return v;
        }
      }).get();

      this.settings.bookableDates = this.settings.bookableSlots.map(function(s) {
        return s.substr(0, 10);
      });

      this.settings.originalSlots = this.$slotInputs.find('select').map(function() {
        var v = $(this).val();
        if (v !== '') {
          return v;
        }
      }).get();
    },

    selectDay: function(day) {
      var bookingFrom, today,
          dateStr = day.data('date'),
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
      day.closest('td').addClass('is-active');
    },

    togglePromoteHelp: function() {
      this.$promoteHelp[this.settings.currentSlots.length > 1 ? 'addClass' : 'removeClass']('is-active');
    },

    markChosenSlots: function(slots) {
      for (var i = 0; i < slots.length; i++) {
        $('[value="' + slots[i] + '"]').click();
      }
    },

    highlightSlot: function(slot) {
      slot.addClass('is-active');
    },

    unHighlightSlots: function() {
      $('.js-slotpicker-options label').removeClass('is-active');
    },

    emptyUiSlots: function() {
      var slots = this.$selectedSlots;
      
      slots.removeClass('is-active');
      slots.find('a').removeData();
      slots.find('.date, .time').text('');
    },

    emptySlotInputs: function() {
      this.$slotInputs.find('select').val('');
    },

    populateUiSlots: function(index, checkbox) {
      var label = checkbox.closest('label'),
          day = label.siblings('h4').text(),
          time = label.find('strong').text(),
          duration = label.find('.duration').text(),
          $slot = this.$selectedSlots.eq(index);

      $slot.addClass('is-active');
      $slot.find('.date').text(day);
      $slot.find('.time').text([time, duration].join(', '));
      $slot.find('.js-remove-slot').data('slot-option', checkbox);
    },

    populateSlotInputs: function(index, chosen) {
      this.$slotInputs.eq(index).find('select').val(chosen);
    },

    processSlots: function() {
      var self = this,
          slots = this.settings.currentSlots,
          i, $slotEl;

      for (i = 0; i < slots.length; i++) {
        $slotEl = $('[value=' + slots[i] + ']');

        self.highlightSlot($slotEl.closest('label'));
        self.populateSlotInputs(i, $slotEl.val());
        self.populateUiSlots(i, $slotEl);
      }
    },

    limitReached: function() {
      return this.$slotOptions.filter(':checked').length >= this.settings.optionlimit;
    },

    disableCheckboxes: function(disable) {
      this.$slotOptions.not(':checked')
        .prop('disabled', disable)
        .closest('label')[disable ? 'addClass' : 'removeClass']('is-disabled');
    },

    splitDateAndSlot: function(str) {
      var bits = str.split('-'),
          time = bits.splice(-2).join('-');
      
      return [bits.join('-'), time];
    },

    checkSlot: function(el) {
      if (el.is(':checked')) {
        this.addSlot(el.val());
      } else {
        this.removeSlot(el.val());
      }
    },

    addSlot: function(slot) {
      this.settings.currentSlots.push(slot);
      this.highlightDay(slot);
    },

    removeSlot: function(slot) {
      var pos = this.settings.currentSlots.indexOf(slot);
      
      this.settings.currentSlots.splice(pos, 1);
      this.highlightDay(slot);
    },

    promoteSlot: function(pos) {
      this.settings.currentSlots = this.settings.currentSlots.move(pos, pos - 1);
    },

    highlightDay: function(slot) {
      var day = this.splitDateAndSlot(slot)[0];
      
      $('[data-date=' + day + ']')[~this.settings.currentSlots.join('-').indexOf(day) ? 'addClass' : 'removeClass']('is-chosen');
    },

    confirmVisibility: function($el) {
      if (!this.isElementInViewport($el.get(0))) {
        this.moveIntoViewport($el);
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
      var bottom = $el.offset().top + $el.height();
      
      $('html,body').animate({
        scrollTop: bottom - $(window).height()
      }, 350);
    }
  };


  moj.Modules.SlotPicker = {
    init: function() {
      return $('.js-slotpicker').each(function() {
        $(this).data('SlotPicker', new SlotPicker($(this), $(this).data()));
      });
    }
  };

}());
