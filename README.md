# Slot Picker

A Web user interface for selecting 3 time slots in order of preference.

The interface is made-up of:

* a calendar (for selecting available days)
* a list of slots for the selected day
* a list of chosen slots

There is also an optional 'date-slider', intended for touch screen devices which can substitute the calendar, ie. at chosen break points.

When a slot is selected the corresponding hidden option is selected.

This UI does depend on JavaScript. 

## How to use

`git clone https://github.com/ministryofjustice/slot-picker`

or

Download the ZIP and use the `dest` folder.

## Build

To compile the Sass, you will need:

* NodeJS
* Sass Ruby Gem
* GulpJS

Run `gulp` to lint the JavaScript and build the CSS from the Sass source.
