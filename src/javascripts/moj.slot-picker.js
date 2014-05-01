
(function() {
  'use strict';

  var SlotPicker = function($el, options) {
    this.settings = $.extend({}, this.defaults, options);
    this.settings.today = this.formatIso(this.settings.today);
    this.cacheEls($el);
    this.bindEvents();
    this.settings.navMonths = this.setupNav(this.$availableMonths);
    this.updateNav(0);
    this.consolidate();
    this.activateOriginalSlots(this.settings.originalSlots);
    this.$days.append(this.buildDays());
    return this;
  };

  SlotPicker.prototype = {
    
    defaults: {
      optionLimit: 3,
      singleUnavailableMsg: true,
      selections: 'has-selections',
      bookableSlots: [],
      bookableDates: [],
      originalSlots: [],
      currentSlots: [],
      calendarDayHeight: 56,
      navPointer: 0,
      today: new Date(),
      days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      months: ['January','February','March','April','May','June','July','August','September','October','November','December']
    },

    cacheEls: function($el) {
      this.$_el = $el;
      
      this.$slotInputs = $('.SlotPicker-input', $el);
      this.$choices = $('.SlotPicker-choices', $el);
      this.$choice = $('.SlotPicker-choices li', $el);
      this.$promoteHelp = $('.SlotPicker-promoteHelp', $el);
      this.$next = $('.BookingCalendar-nav--next', $el);
      this.$prev = $('.BookingCalendar-nav--prev', $el);
      this.$availableMonths = $('.BookingCalendar-availableMonths a', $el);
      this.$timeSlots = $('.SlotPicker-timeSlots', $el);
      this.$dateTriggers = $('.BookingCalendar-dateLink, .DateSlider-largeDates li', $el);
      this.$currentMonth = $('.BookingCalendar-currentMonth');
      this.$calMask = $('.BookingCalendar-mask', $el);
      this.$calDates = $('.BookingCalendar-date--bookable', $el);
      this.$days = $('.SlotPicker-days', $el);
    },

    bindEvents: function() {
      var self = this;

      this.$_el.on('click', '.SlotPicker-slot', function() {
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
        self.$timeSlots.addClass('is-active');
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

    setupNav: function($el) {
      var self = this;

      return $el.map(function() {
        var item = $(this);

        return {
          label: item.text(),
          date: item.attr('href'),
          pos: $(item.attr('href')).closest('tr').index() * self.settings.calendarDayHeight
        };
      }).get();
    },

    updateNav: function(i) {
      if (i > 0) {
        this.$prev.addClass('is-active').text(this.settings.navMonths[i - 1].label);
      } else {
        this.$prev.removeClass('is-active');
      }

      if (i + 1 < this.settings.navMonths.length) {
        this.$next.addClass('is-active').text(this.settings.navMonths[i + 1].label);
      } else {
        this.$next.removeClass('is-active');
      }

      this.$currentMonth.text(this.settings.navMonths[i].label);
    },

    nudgeNav: function(i) {
      this.settings.navPointer = i + this.settings.navPointer;
      this.updateNav(this.settings.navPointer);
      this.$calMask.animate({
        scrollTop: this.settings.navMonths[this.settings.navPointer].pos
      }, 200);
    },

    consolidate: function() {
      var slots, i, times = [], day, days = [], previous;

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
      
      slots = this.settings.bookableSlots;
      
      for (i = 0; i < slots.length; i++) {
        day = this.splitDateAndSlot(slots[i])[0];

        if (previous !== day && i) {
          days[previous] = times;
          times = [];
        }

        times.push(this.splitDateAndSlot(slots[i])[1]);

        if (i === slots.length-1) {
          days[day] = times;
        }

        previous = day;
      }

      this.settings.bookableTimes = days;
    },

    selectDay: function(day) {
      $('.SlotPicker-day', this.$_el).removeClass('is-active');
      $(this.chosenDaySelector(day.data('date'))).addClass('is-active').focus();
    },

    chosenDaySelector: function(dateStr) {
      var bookingFrom, bookingTo, today, date;
      
      if (~this.indexOf(this.settings.bookableDates, dateStr)) {
        return '#date-' + dateStr;
      }

      date = new Date(dateStr);
      today = new Date(this.settings.today);
      bookingFrom = new Date(this.settings.bookableDates[0]);
      bookingTo = new Date(this.settings.bookableDates[this.settings.bookableDates.length-1]);
      
      if (date < today) {
        return '.SlotPicker-day--past';
      } else {
        if (date > bookingFrom) {
          if (date < bookingTo) {
            if (!this.settings.singleUnavailableMsg) {
              return '#date-' + dateStr;
            } else {
              return '.SlotPicker-day--unavailable';
            }
          } else {
            return '.SlotPicker-day--beyond';
          }
        } else {
          return '.SlotPicker-day--leadtime';
        }
      }
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
      $('.SlotPicker-label', this.$_el).removeClass('is-active');
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
      $('.SlotPicker-input').eq(index).val(chosen);
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
      return this.$_el.find('.SlotPicker-slot:checked').length >= this.settings.optionLimit;
    },

    disableCheckboxes: function(disable) {
      this.$_el.find('.SlotPicker-slot').not(':checked')
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
    },

    buildTimeSlots: function(date, slots) {
      var i, out = '',
          source = $('#SlotPicker-tmplTimeSlot').html(),
          template = Handlebars.compile(source);

      for (i = 0; i < slots.length; i++) {
        out+= template({
          time: this.displayTime(slots[i].split('-')[0]),
          duration: this.duration( this.timeFromSlot(slots[i].split('-')[0]), this.timeFromSlot(slots[i].split('-')[1]) ),
          slot: [date,slots[i]].join('-')
        });
      }

      return out;
    },

    buildDays: function() {
      var day, out = '', date,
          source = $('#SlotPicker-tmplDay').html(),
          template = Handlebars.compile(source),
          slots = this.settings.bookableTimes;

      for (day in slots) {
        date = new Date(day);
        out+= template({
          date: this.settings.days[date.getDay()] +' '+ date.getDate() +' '+ this.settings.months[date.getMonth()],
          slot: day,
          slots: this.buildTimeSlots(day, slots[day])
        });
      }

      return out;
    },

    displayTime: function(time) {
      var hrs = parseInt(time.substr(0, 2)),
          mins = time.substr(2),
          out = hrs;

      if (hrs > 12) {
        out-= 12;
      }
      

      if (hrs === 0) {
        out = 12;
      }

      if (parseInt(mins)) {
        out+= ':' + mins;
      }

      return out+= (hrs > 11) ? 'pm' : 'am';
    },

    duration: function(start, end) {
      var out = '',
          diff = end.getTime() - start.getTime(),
          duration = new Date(diff);
      
      if (duration.getUTCHours()) {
        out+= duration.getUTCHours() + ' hr';
        if (duration.getUTCHours() > 1) {
          out+= 's';
        }
      }
      
      if (duration.getMinutes()) {
        out+= ' ' + duration.getMinutes() + ' min';
        if (duration.getMinutes() > 1) {
          out+= 's';
        }
      }

      return out;
    },

    timeFromSlot: function(slot) {
      var time = new Date();

      time.setHours(slot.substr(0, 2));
      time.setMinutes(slot.substr(2));

      return time;
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
