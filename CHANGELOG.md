# Changelog

## 0.21.1 (2014-09-08)
* Fix: Correct daysInRange to count days from tomorrow

## 0.21.0 (2014-09-07)
* New: Responsive month labels
* Fix: Set background colours on day elements & key
* Fix: Vertical centre legend

## 0.20.1 (2014-08-28)
* Fix: Reordering now works when UI choices are adajecent to other elements
* Fix: failing original slots spec

## 0.20.0 (2014-08-28)
* Change: UI slots now require 'SlotPicker-choice' class

## 0.19.2 (2014-07-11)
* Fix: IE7/8 display wrong time for 0845

## 0.19.1 (2014-07-08)
* Fix: Reinstate focus on days
* Fix: Add missing 'tmpl' prefix to templates
* Change: Update README
* Change: Use unified helper method for Handlebars templates

## 0.19.0 (2014-07-06)
* New: Scroll next element into focus (mobile/touch only)
* Fix: day is selected when removing slot

## 0.18.1 (2014-07-04)
* Fix: TypeError when removing slots using button
* Fix: Initial day selection for DateSlider interferes with calendar

## 0.18.0 (2014-07-04)
* New: Asset files include banner/header with version info

## 0.17.0 (2014-07-04)
* New: Display current day of chosen slot in calendar
* Fix: Create Asset Pipeline DateSlider friendly CSS
* Fix: Include current week in BookingCalendar when slots start
* Fix: DateSlider month labels show next month

## 0.16.1 (2014-07-03)
* Fix: IE7 DateSlider trailing comma bug
* Fix: graphic checkbox for IE & mobile checkbox
* Fix: IE7 time slot layout overlaps
* Fix: opaque tick box background

## 0.16.0 (2014-07-03)
* Highlight active options
* Display message for days containing single slot
* Large tick box graphic
* Removed focus from days
* Aesthic tweaks

## 0.15.0 (2014-07-03)
* Dynamically label each day
* Dynamic 'days in range' count
* Emulate touch option

## 0.14.0 (2014-07-02)
* Add Dynamic DateSlider

## 0.13.0 (2014-06-22)
* Use Handlebars for templating slot choices

## 0.12.1 (2014-06-19)
* Internet Explorer fixes

## 0.12.0 (2014-05-23)
* Update to calendar header design

## 0.11.2 (2014-05-08)
* Fixed issue #13 asset pipeline paths

## 0.11.1 (2014-05-07)
* Fixed issue #12 whole last month not added to calendar
* Fixed lastDayOfWeek method and tests

## 0.11.0 (2014-05-07)
* Use Handlebars for templating Booking Calendar

## 0.10.0 (2014-05-02)
* Use Handlebars for templating of days and timeslots

## 0.9.0 (2014-05-01)
* Added [notes on contributing](https://github.com/ministryofjustice/moj_slotpicker/blob/master/CONTRIBUTING.md)
* Updated copyright

## 0.8.2 (2014-04-30)
* Fixed issue #3: generated CSS file for Rails Asset Pipeline

## 0.8.1 (2014-04-25)
* Fixed issue #7: incorrect classnames contained in include

## 0.8.0 (2014-04-24)
* Jasmine tests suite wtih jasmine-jquery fixtures
* Fixed Gulp task clash - include vs copy

## 0.7.0 (2014-04-24)
* Image assets moved into `slot-picker-images` for Rails workaround

## 0.6.1 (2014-04-23)
* Fixed slots 'unavalable' notice which did not show when beyond range of dates

## 0.6.0 (2014-04-10)
* BookingCalendar link styles are now locked down to A elements

## 0.5.1 (2014-04-10)
* Corrected licence in bower file

## 0.5.0 (2014-04-10)
* Time slots now wrapped in element to allow extra conditional content

## 0.4.0 (2014-04-09)
* New option to show multiple unavailable day messages
* Move image assets within stylesheets directory
* Consistent classnames "unavailable"

## 0.3.3 (2014-04-08)
* Added [OGL LICENCE](https://github.com/ministryofjustice/moj_slotpicker/blob/master/LICENCE.md)

## 0.3.2 (2014-03-28)
* Package is now self-sufficient in terms of CSS
* README now includes Bower details

## 0.3.1 (2014-03-28)
* Fixed missing comma in Bower JSON

## 0.3.0 (2014-03-28)
* Added Bower config

## 0.2.0 (2014-03-28)
* SlotPicker is now self-sufficient in terms of Array/Date object methods
* README now includes basic mark-up instructions and explains dependencies
* Build outputs to to dist
* Removed app specific elements and un-used classes from calendar

## 0.1.0 (2014-03-28)
* First minor release
