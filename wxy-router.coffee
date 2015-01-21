router = new RouteRecognizer()
importedUris = {}
previousRoute = undefined

extend = (src, extendees...) ->
  for extendee in extendees
    for key, value of extendee
      src[key] = value

  return

Polymer
  attached: ->
    @_AddRoutes()
    @_OnStateChange()
    window.addEventListener 'popstate', @_OnStateChange.bind @
    return

  go: (uri, {data, options} = {}) ->
    options ?= {}
    uri = '#' + uri
    if options.replace
      window.history.replaceState null, null, uri
    else
      window.history.pushState null, null, uri

    @_OnStateChange data
    return

  _AddRoutes: ->
    routes = @children
    handlers = {}
    for route in routes
      handler = handlers[route.path] = route

      router.add [
        path: route.path
        handler: handler
      ]

    return

  _OnStateChange: (data) ->
    result = router.recognize window.location.hash.substring 1
    return if not result?.length > 0
    match = result[0]
    match.data = data
    @_Import match
    return

  _Import: (match) ->
    route = match.handler

    uri = route.import

    activate = =>
      @_Activate match
      return

    if !importedUris[uri]
      importLink = document.createElement 'link'
      importLink.setAttribute 'rel', 'import'
      importLink.setAttribute 'href', uri
      importLink.addEventListener 'load', activate
      document.head.appendChild importLink
    else
      importLink = document.querySelector "link[href=6'#{uri}']"
      if importLink.import
        activate()
      else
        importLink.addEventListener 'load', activate

    return

  _Activate: (match) ->
    route = match.handler

    elementName = route.name
    customElement = document.createElement elementName
    model =
      router: @

    extend customElement, model, match.params, match.data

    @_RemoveContent previousRoute
    previousRoute = route
    route.appendChild customElement
    return

  _RemoveContent: (route) ->
    if route
      node = route.firstChild
      while node
        nodeToRemove = node
        node = node.nextSibling
        if nodeToRemove.tagName isnt 'TEMPLATE'
          route.removeChild nodeToRemove
    return
