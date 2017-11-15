[![Build Status](https://travis-ci.org/cassproject/cass-viewer.svg?branch=master)](https://travis-ci.org/cassproject/cass-viewer)

Deprecated for view mode in CASS Editor. All links now refer to cass-editor and this document has been updated to reflect this.

# CASS
Competency and Skills Service -- Competency Framework Viewer

View CASS frameworks and competencies using an easy to use, embeddable iframe.

# Features
 * View public competency frameworks on a CASS instance.
 * Select - Select competencies and trees of competencies for use in your application.
 * Links - URLs for your data provide the capability to align with other educational resources.
 * Embeddable - Put the cass-viewer in your website with a few lines of HTML.
 * Customizable - Change the default behavior of the cass-viewer via URL parameters.
 * Inherits your style - If it can, uses the CSS from the embedding website to style the internals.
 * Unbranded and open source - Carries no branding information, allowing you to use it easily and without concern.

# Try it out
The (unbranded) cass-viewer is available for use at https://cassproject.github.io/cass-editor/

# Integration
Integrate the cass-viewer into your website by nesting it into an iframe on your website.

```html
<iframe id="iframe" width="100%" height="800" frameborder="0"></iframe>
<script>
    document.getElementsByTagName("iframe")[0].setAttribute("src", "https://cassproject.github.io/cass-editor/index.html?view=true");
</script>
```

# CSS Inheritance
The cass-viewer attempts to read the stylesheets of the parent page and import them into the website. It may not be able to do this without your help.

```
An error message when headers are not set:
    ...Styles/Webfonts/Gibson/Gibson-Regular-webfont.woff2' from origin 'https://cassproject.github.io' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'https://cassproject.github.io' is therefore not allowed access. The response had HTTP status code 404.
```

To remedy this, your web server needs to allow cross-origin requests to the cassproject github.io site.

```
Access-Control-Allow-Origin: https://cassproject.github.io
```

# URL Parameters
The cass-viewer has many modes and options that can be enabled or disabled based on desired functionality. These options are passed as URL parameters.

## Setting the server
By default, the cass-viewer operates on the sandbox.cassproject.org CASS instance. This should instead be your server. To do this, use `server=protocol://cass.yourserver.com`.

    ex:
    https://cassproject.github.io/cass-editor/index.html?view=true&server=https://dev.cassproject.org

## Expose URL links
If your users need the URLs for each framework or resource they are editing, you can enable link-showing by using `link=true`

    ex:
    https://cassproject.github.io/cass-editor/index.html?view=true&link=true

## Select competencies in frameworks
If your app needs the ability to select competencies from a framework, use `select=label` where 'label' is the tag you want the select button to have. ex: Add, Select, Import.

    ex:
    https://cassproject.github.io/cass-editor/index.html?view=true&select=Add

## Filtering frameworks by an additional search query.
If you are limiting users to seeing only a set of frameworks that can be described by a search query, you can add an additional search query to the initial framework search by using `filter=<search query>`.

    ex:
    https://cassproject.github.io/cass-editor/index.html?view=true&filter=@id:case.georgiastandards.org

# Events
The cass-viewer can send events when various operations occur.

To bind the cass-viewer from the parent page, use the following code:

    window.addEventListener('message', iframeMessage, false);

	function iframeMessage(event) {
		//check the origin, to make sure it comes from a trusted source.
		if (false && event.origin !== window.location.origin)
			return;
		alert("I got " + event.data.selected.length + " selected items from the iframe");
	}

To ensure the iframe is passing the correct origin, pass the origin into the iframe using a URL parameter, `origin=originUrl`.

On Selected:

    event.data.message == "selected"
    event.data.selected == [uri,uri,uri]
