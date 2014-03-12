# jslint browser: true, evil: false, plusplus: true, white: true, indent: 2, nomen: true

# global moj, $

# SlotPicker module for MOJ
# Dependencies: moj, jQuery

"use strict"

# Define the class
SlotPicker = (el, options) ->
  @settings = $.extend {}, @defaults, options
  @cacheEls el
  @bindEvents()
  @setupNav()
  @updateNav 0
  @markChosenSlots pvbe.current_slots
  return @

SlotPicker:: =
  defaults:
    optionlimit: 3
    selections: 'has-selections'
    currentSlots: []
    calendarDayHeight: 56
    navPointer: 0

  cacheEls: ->
    @$wrapper = $ '#wrapper'
    @$slotInputs = $ '.js-slotpicker-slot'
    @$slotOptions = $ '.js-slotpicker-option'
    @$selectedSlotWrapper = $ '.js-selected-slots'
    @$selectedSlots = $ '.selected-slots li'
    @$removeSlots = '.js-remove-slot'
    @$promoteSlots = '.js-promote-slot'
    @$promoteHelp = $ '.js-promote-help'
    @$months = $ '.js-slotpicker__months'
    @$next = $ '.BookingCalendar-nav .next'
    @$prev = $ '.BookingCalendar-nav .prev'
    @$availableMonths = $ '.BookingCalendar-availableMonths a'

  bindEvents: ->
    # store a reference to obj before 'this' becomes jQuery obj
    _this = this
    
    @$slotOptions.on 'click', (e) ->
      _this.$selectedSlotWrapper.addClass 'is-active'
      _this.emptyUiSlots()
      _this.emptySlotInputs()
      _this.unHighlightSlots()
      _this.checkSlot $(this)
      _this.processSlots()
      _this.disableCheckboxes _this.limitReached()
      _this.togglePromoteHelp()

    @$wrapper.on 'click', @$removeSlots, (e) ->
      e.preventDefault()
      $( $(this).data('slot-option') ).click()
      ga('send', 'event', 'slot', 'remove')

    @$wrapper.on 'click', @$promoteSlots, (e) ->
      e.preventDefault()
      promoted = $(this).attr('href').split('#')[1] - 1
      _this.promoteSlot promoted
      _this.processSlots()
      ga('send', 'event', 'slot', 'promote')

    $('.BookingCalendar-dayLink, .DateSlider-largeDates li').on 'click chosen', (e) ->
      e.preventDefault()
      _this.selectDay $(this)
      $('.js-slotpicker').addClass 'is-active'
      _this.confirmVisibility(_this.$months) unless e.type is 'chosen'

    @$next.on 'click', (e) =>
      e.preventDefault()
      @nudgeNav 1
  
    @$prev.on 'click', (e) =>
      e.preventDefault()
      @nudgeNav -1
  
  setupNav: ->
    self = @
    @settings.months = @$availableMonths.map ->
      item = $(this)

      label: item.text()
      date: item.attr 'href'
      pos: $(item.attr 'href').closest('tr').index() * self.settings.calendarDayHeight

  updateNav: (i) ->
    if i > 0
      @$prev.removeClass('hidden').text @settings.months[i-1].label
    else
      @$prev.addClass 'hidden'

    if i + 1 < @settings.months.length
      @$next.removeClass('hidden').text @settings.months[i+1].label
    else
      @$next.addClass 'hidden'

    $('.BookingCalendar-nav strong').text @settings.months[i].label

  nudgeNav: (i) ->
    @settings.navPointer = i + @settings.navPointer

    @updateNav @settings.navPointer

    $('.BookingCalendar-wrap').animate(
      scrollTop: @settings.months[@settings.navPointer].pos
    , 200)

  selectDay: (day) ->
    dateStr = day.data 'date'
    date = new Date(dateStr)

    # Show the slots for the selected day
    $('.js-slotpicker-options').removeClass 'is-active'
    $("#date-#{dateStr}").addClass('is-active').focus()

    # Show unbookable day message
    unless ~pvbe.bookable_dates.indexOf dateStr
      today = new Date((new Date()).formatIso())
      bookingFrom = new Date(pvbe.bookable_from)
      if date < today
        $('#in-the-past').addClass 'is-active'
      if date >= today
        if date > bookingFrom
          $('#too-far-ahead').addClass 'is-active'
        else
          $('#booking-gap').addClass 'is-active'

    # Highlight the currently selected day on the calendar
    $('.BookingCalendar-day--bookable.is-active').removeClass('is-active')
    day.closest('td').addClass('is-active')

  togglePromoteHelp: ->
    @$promoteHelp[if @settings.currentSlots.length > 1 then 'addClass' else 'removeClass'] 'is-active'

  markChosenSlots: (slots) ->
    for slot in slots
      $("[value='#{slot}']").click()

  highlightSlot: (slot) ->
    slot.addClass 'is-active'
  
  unHighlightSlots: ->
    $('.js-slotpicker-options label').removeClass 'is-active'

  emptyUiSlots: ->
    slots = @$selectedSlots
    slots.removeClass 'is-active'
    slots.find('a').removeData()
    slots.find('.date, .time').text ''

  emptySlotInputs: ->
    @$slotInputs.find('select').val ''

  populateUiSlots: (index, checkbox) ->
    date = @splitDateAndSlot(checkbox.val())[0]

    label = checkbox.closest('label')
    day = label.siblings('h4').text()
    time = label.find('strong').text()
    duration = label.find('.duration').text()
    
    $slot = @$selectedSlots.eq(index)

    $slot.addClass 'is-active'
    $slot.find('.date').text day
    $slot.find('.time').text [time, duration].join(', ')
    # store reference to checkbox
    $slot.find('.js-remove-slot').data 'slot-option', checkbox

  populateSlotInputs: (index, chosen) ->
    @$slotInputs.eq(index).find('[name="visit[slots][][slot]"]').val chosen

  processSlots: ->
    _this = this
    i = 0

    for slot in @settings.currentSlots
      $slotEl = $ "[value=#{slot}]"

      _this.highlightSlot $slotEl.closest('label')
      _this.populateSlotInputs i, $slotEl.val()
      _this.populateUiSlots i, $slotEl
      
      i++

  limitReached: ->
    @$slotOptions.filter(':checked').length >= @settings.optionlimit

  disableCheckboxes: (disable) ->
    @$slotOptions.not(':checked').prop 'disabled', disable
    @$slotOptions.not(':checked').closest('label')[if disable then 'addClass' else 'removeClass'] 'is-disabled'

  splitDateAndSlot: (str) ->
    bits = str.split '-'
    time = bits.splice(-2).join '-'
    [bits.join('-'),time]

  checkSlot: (el) ->
    if el.is(':checked')
      @addSlot el.val()
    else
      @removeSlot el.val()

  addSlot: (slot) ->
    @settings.currentSlots.push slot
    @highlightDay slot

  removeSlot: (slot) ->
    pos = @settings.currentSlots.indexOf slot
    @settings.currentSlots.splice pos, 1
    @highlightDay slot

  promoteSlot: (pos) ->
    @settings.currentSlots = @settings.currentSlots.move pos, pos-1

  highlightDay: (slot) ->
    day = @splitDateAndSlot(slot)[0]
    $("[data-date=#{day}]")[if ~@settings.currentSlots.join('-').indexOf(day) then 'addClass' else 'removeClass'] 'is-chosen'

  confirmVisibility: ($el) -> @moveIntoViewport $el unless isElementInViewport $el.get(0)

  moveIntoViewport: ($el) ->
    bottom = $el.offset().top + $el.height()
    $('html,body').animate
      scrollTop: bottom - $(window).height()
    , 350
    


# Add module to MOJ namespace
moj.Modules.slotPicker = init: ->
  $('.js-slotpicker').each ->
    $(this).data 'slotpicker', new SlotPicker($(this), $(this).data())
