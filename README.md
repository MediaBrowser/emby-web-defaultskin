# emby-web-markdown-aware-skin

This is a fork from emby-web-defaultskin that makes use of Markdown in formatting the Overview section.

The rest of this file is the generic instructions from [emby-web-defaultskin](https://github.com/MediaBrowser/emby-web-defaultskin)

* * *

# emby-web-defaultskin

This default skin for Emby Theater. To create your own skin, follow these steps:

* Fork this repository. After forking, you'll probably want to rename it.
* Update package.json (see below).
* Update skininfo.js with your unique names.
* Update plugin.js to change the skin name and id, matching the values from skininfo.js
* Update the installation url below.

# package.json

This file is used to display information about your add-on in places such as the installation screen, installed packages list, and catalog.

* name is your package name, and should have no spaces or special characters. This is a package name and is intended to be unique. Changing the name will cause the application to view it as a completely new package.
* update displayName as desired.
* update thumb to supply an image for display. this should be 16*9. It can be a relative or full url.
* if desired, update backdrop to supply a background image. this should be 16*9. It can be a relative or full url.

# Installation

Install into the app by installing a plugin from a url. The url is: http://mediabrowser.github.io/emby-web-defaultskin/package.json

# Local Testing

To test locally, install NodeJS, then install the http server module using:

npm install http-server -g

To start the server, enter

http-server -p 8088 --cors

Now you can install into Emby Theater using the http://localhost:8088/package.json

To do this: type http://localhost:8088 into your browser bar. (This will confirm that 1. The server is running and 2 you can access your repository.
Next, find your folder for your theme and locate the package.json file.
Click this and you should see what's written in the the package.json in your browser
Copy this address (CTRL+C)
Go into tv.emby.media. Go to settings and Select "Installed Plugins"
Select Install plugin, then select from URL and then paste your copied address in.
You should have your theme loaded.
Now load it from the Display Settings Menu and your done.


# Develop with Chrome

For rapid development, use the hosted version of Emby Theater:

http://tv.emby.media

This will allow you to perform all development activities using Chrome and it's excellent debugging tools.
