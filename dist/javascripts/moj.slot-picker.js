
(function() {
  'use strict';

  var SlotPicker = function($el, options) {
    this.settings = $.extend({}, this.defaults, options);
    this.settings.today = this.formatIso(this.settings.today);
    this.cacheEls($el);
    this.bindEvents();
    this.setupNav();
    this.updateNav(0);
    this.consolidate();
    this.activateOriginalSlots(this.settings.originalSlots);
    return this;
  };

  SlotPicker.prototype = {
    
    defaults: {
      optionLimit: 3,
      selections: 'has-selections',
      bookableSlots: [],
      bookableDates: [],
      originalSlots: [],
      currentSlots: [],
      calendarDayHeight: 56,
      navPointer: 0,
      today: new Date()
    },

    cacheEls: function($el) {
      this.$_el = $el;
      
      this.$slotInputs = $('.SlotPicker-input', $el);
      this.$slotOptions = $('.SlotPicker-slot', $el);
      this.$choices = $('.SlotPicker-choices', $el);
      this.$choice = $('.SlotPicker-choices li', $el);
      this.$promoteHelp = $('.SlotPicker-promoteHelp', $el);
      this.$next = $('.BookingCalendar-nav--next', $el);
      this.$prev = $('.BookingCalendar-nav--prev', $el);
      this.$availableMonths = $('.BookingCalendar-availableMonths a', $el);
      this.$slotTimes = $('.SlotPicker-days', $el);
      this.$dateTriggers = $('.BookingCalendar-dateLink, .DateSlider-largeDates li', $el);
      this.$currentMonth = $('.BookingCalendar-currentMonth');
      this.$calMask = $('.BookingCalendar-mask', $el);
      this.$times = $('.SlotPicker-day', $el);
      this.$calDates = $('.BookingCalendar-date--bookable', $el);
    },

    bindEvents: function() {
      var self = this;

      this.$slotOptions.on('click', function() {
        self.$choices.addClass('is-active');
        self.emptyUiSlots();
        self.emptySlotInputs();
        self.unHighlightSlots();
        self.checkSlot($(this));
        self.processSlots();
        self.disableCheckboxes(self.limitReached());
        self.togglePromoteHelp();
      });

      this.$_el.on('click', '.SlotPicker-icon--remove', function(e) {
        e.preventDefault();
        $($(this).data('slot-option')).click();
      });

      this.$_el.on('click', '.SlotPicker-icon--promote', function(e) {
        e.preventDefault();
        self.promoteSlot($(this).attr('href').split('#')[1] - 1);
        self.processSlots();
      });

      this.$dateTriggers.on('click chosen', function(e) {
        e.preventDefault();
        self.selectDay($(this));
        self.highlightDate($(this));
        self.$slotTimes.addClass('is-active');
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
        this.$prev.addClass('is-active').text(this.settings.months[i - 1].label);
      } else {
        this.$prev.removeClass('is-active');
      }

      if (i + 1 < this.settings.months.length) {
        this.$next.addClass('is-active').text(this.settings.months[i + 1].label);
      } else {
        this.$next.removeClass('is-active');
      }

      this.$currentMonth.text(this.settings.months[i].label);
    },

    nudgeNav: function(i) {
      this.settings.navPointer = i + this.settings.navPointer;
      this.updateNav(this.settings.navPointer);
      this.$calMask.animate({
        scrollTop: this.settings.months[this.settings.navPointer].pos
      }, 200);
    },

    consolidate: function() {
      this.settings.bookableSlots = this.$slotInputs.first().find('option').map(function() {
        var v = $(this).val();
        if (v !== '') {
          return v;
        }
      }).get();

      this.settings.bookableDates = this.settings.bookableSlots.map(function(s) {
        return s.substr(0, 10);
      });

      this.settings.originalSlots = this.$slotInputs.map(function() {
        var v = $(this).val();
        if (v !== '') {
          return v;
        }
      }).get();
    },

    selectDay: function(day) {
      var bookingFrom, bookingTo, today, target,
          dateStr = day.data('date'),
          date = new Date(dateStr);
      
      this.$times.removeClass('is-active');
      
      if (!~this.indexOf(this.settings.bookableDates, dateStr)) {
        today = new Date(this.settings.today);
        bookingFrom = new Date(this.settings.bookableDates[0]);
        bookingTo = new Date(this.settings.bookableDates[this.settings.bookableDates.length-1]);
        
        if (date < today) {
          target = '.SlotPicker-day--past';
        } else {
          if (date > bookingFrom) {
            if (date < bookingTo) {
              target = '.SlotPicker-day--unavailable';
            } else {
              target = '.SlotPicker-day--beyond';
            }
          } else {
            target = '.SlotPicker-day--leadtime';
          }
        }
      } else {
        target = '#date-' + dateStr;
      }
      
      $(target).addClass('is-active').focus();
    },

    highlightDate: function(day) {
      this.$calDates.filter('.is-active').removeClass('is-active');
      day.closest('td').addClass('is-active');
    },

    togglePromoteHelp: function() {
      this.$promoteHelp[this.settings.currentSlots.length > 1 ? 'addClass' : 'removeClass']('is-active');
    },

    activateOriginalSlots: function(slots) {
      for (var i = 0; i < slots.length; i++) {
        $('[value="' + slots[i] + '"]', this.$_el).click();
      }
    },

    highlightSlot: function(slot) {
      slot.addClass('is-active');
    },

    unHighlightSlots: function() {
      this.$times.find('.SlotPicker-label').removeClass('is-active');
    },

    emptyUiSlots: function() {
      this.$choice.removeClass('is-active');
      this.$choice.find('.SlotPicker-icon--remove').removeData();
      this.$choice.find('.SlotPicker-date, .SlotPicker-time').text('');
    },

    emptySlotInputs: function() {
      this.$slotInputs.val('');
    },

    populateUiSlots: function(index, checkbox) {
      var label = checkbox.closest('.SlotPicker-label'),
          day = label.siblings('.SlotPicker-dayTitle').text(),
          time = label.find('.SlotPicker-time').text(),
          duration = label.find('.SlotPicker-duration').text(),
          $slot = this.$choice.eq(index);

      $slot.addClass('is-active');
      $slot.find('.SlotPicker-date').text(day);
      $slot.find('.SlotPicker-time').text([time, duration].join(', '));
      $slot.find('.SlotPicker-icon--remove').data('slot-option', checkbox);
    },

    populateSlotInputs: function(index, chosen) {
      this.$slotInputs.eq(index).val(chosen);
    },

    processSlots: function() {
      var slots = this.settings.currentSlots,
          i, $slotEl;

      for (i = 0; i < slots.length; i++) {
        $slotEl = $('[value=' + slots[i] + ']', this.$_el);

        this.highlightSlot($slotEl.closest('label'));
        this.populateSlotInputs(i, $slotEl.val());
        this.populateUiSlots(i, $slotEl);
      }
    },

    limitReached: function() {
      return this.$slotOptions.filter(':checked').length >= this.settings.optionLimit;
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
      this.markDate(slot);
    },

    removeSlot: function(slot) {
      var pos = this.settings.currentSlots.indexOf(slot);
      
      this.settings.currentSlots.splice(pos, 1);
      this.markDate(slot);
    },

    promoteSlot: function(pos) {
      this.settings.currentSlots = this.move(this.settings.currentSlots, pos, pos - 1);
    },

    markDate: function(slot) {
      var day = this.splitDateAndSlot(slot)[0];
      
      $('[data-date=' + day + ']', this.$_el)[~this.settings.currentSlots.join('-').indexOf(day) ? 'addClass' : 'removeClass']('is-chosen');
    },

    formatIso: function(date) {
      if (typeof date === 'string') {
        return date;
      }
      return [
        date.getFullYear(),
        ('0'+(date.getMonth()+1)).slice(-2),
        ('0'+date.getDate()).slice(-2)
      ].join('-');
    },

    indexOf: function(array, obj) {
      for (var i = 0, j = array.length; i < j; i++) {
        if (array[i] === obj) { return i; }
      }
      return -1;
    },

    move: function(array, old_index, new_index) {
      if (new_index >= array.length) {
        var k = new_index - array.length;
        while ((k--) + 1) {
          array.push(undefined);
        }
      }
      array.splice(new_index, 0, array.splice(old_index, 1)[0]);
      return array;
    }


  };


  moj.Modules.SlotPicker = {
    init: function() {
      return $('.SlotPicker').each(function() {
        $(this).data('SlotPicker', new SlotPicker($(this), $(this).data()));
      });
    }
  };

}());
