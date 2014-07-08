# MOJ Slot Picker

A Web user interface for selecting 3 time slots in order of preference.

[Demo](http://ministryofjustice.github.io/moj_slotpicker/index.html)

The interface consists of:

* a calendar for selecting available days
* an optional date 'slider' for touch screens
* a list of slots for the selected day
* a list of chosen slots in order of preference

When a slot is selected the corresponding hidden option element is selected.


## Dependencies

* jQuery
* moj.js (see [Non-MOJ projects](#non-moj-projects) below)
* [Handlbars](http://handlebarsjs.com/)

## How to use

Install as a [Bower](http://bower.io) package

    bower install moj.slot-picker

or

    git clone https://github.com/ministryofjustice/slot-picker

or

Download the [latest version as a ZIP](https://github.com/ministryofjustice/moj_slotpicker/releases) and use the `dist` folder.


### Note for Ruby on Rails Asset Pipelines

For Asset Pipeline users, include the CSS files with the `.ap` suffix as these use the `image-url` helper for file image assets.

Also, assuming you have installed the package in `vendor/assets`, add the following line to `config/application.rb` to make sure the slot picker assets are served.

    config.assets.paths << "#{Rails.root}/vendor/assets/moj.slot-picker/dist/stylesheets"

Lastly, make sure `*.png` is included in `config.assets.precompile`.


## Mark-up

The Slot Picker expects source dates to be provided in the form of option elements with values as the slot data.

    <option value="2014-03-17-1400-1600">Monday, 17 March - 2:00pm</option>

The slot data is in the format `YYYY-MM-DD-HHMM-HHMM`, where the former time is the start of the slot and the latter time is the end.

Re-create the classname structure and templates as shown in `/dist/index.html`.

## Options

Options are applied via **data-*** attributes.

Name                   | Default | Description
---------------------- | ------- | ---------------
option-limit           | 3       | The amount of slots to populate
single-unavailable-msg | true    | Use one message for all days do not contain any slot times (defined by .SlotPicker-day--unavailable


## Non-MOJ projects

MOJ projects use a JavaScript [module structure](https://github.com/ministryofjustice/moj_boilerplate/blob/master/app/assets/javascripts/moj.js) based on [Heisenburg.js](https://github.com/Heisenbergjs/heisenberg). 

For non-MOJ projects you need to re-create the namespace before the moj.slot-picker.js and moj.date-slider.js files are included, and then initialise the each module.

    <script>var moj = moj || { Modules: {}, Helpers: {} };</script>
    <script src="javascripts/moj.slot-picker.js"></script>
    <script>moj.Modules.SlotPicker.init();</script>

This can be seen in the [demo](http://ministryofjustice.github.io/moj_slotpicker/index.html).
