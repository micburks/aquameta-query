/* global location fetch Headers */
import 'isomorphic-fetch'

/* Set query based on datum request */
export function fromRequest (req) {
  const query = {}
  query.method = req.method
  query.metaId = req.url.split('?')[0]
  query.args = req.query
  query.data = req.body

  // Do not need query.queryString

  // metaData defaults to true
  query.args.metaData = query.args.hasOwnProperty('metaData') ? query.args.metaData : true

  console.log('fromRequest args', query.args)
  return query
}

/* Set query based on programmatic api */
export function fromDatum (method, metaId, args, data) {
  const query = {}
  query.method = method
  query.metaId = metaId.toUrl()
  query.args = args || {}
  query.data = data || {}

  // metaData defaults to true
  query.args.metaData = query.args.hasOwnProperty('metaData') ? query.args.metaData : true

  // Map the keys of the args object to an array of encoded url components
  query.queryString = Object.keys(query.args).sort().map(keyName => {
    let key = query.args[keyName]

    switch (keyName) {
      case 'where':
        // where: { name: 'column_name', op: '=', value: 'value' }
        // where: [{ name: 'column_name', op: '=', value: 'value' }]
        key = !key.length ? [key] : key
        return key.map(w => `where=${encodeURIComponent(JSON.stringify(w))}`).join('&')
      case 'order_by':
        // So many possibilities...
        // order_by: '-?column_name'
        // order_by: ['-?column_name']
        // order_by: { 'column_name': 'asc|desc' }
        // order_by: [{ 'column_name': 'asc|desc' }]
        // order_by: { column: 'column_name', direction: 'asc|desc' }
        // order_by: [{ column: 'column_name', direction: 'asc|desc' }]
        key = !key.length ? [key] : key

        return `${keyName}=${
                    encodeURIComponent(
                      key.map((o, i) => (o.direction !== 'asc' ? '-' : '') + o.column)
                      .join(',')
                    )
                }`
      case 'limit':
        // limit: number
      case 'offset': // eslint-disable-line no-fallthrough
        // offset: number
        let parsedNum = parseInt(key)
        if (!isNaN(parsedNum)) {
          return `${keyName}=${parsedNum}`
        }
        return
      case 'evented':
        return 'session_id=' + encodeURIComponent(JSON.stringify(key))
      case 'metaData':
      case 'args':
      case 'exclude':
      case 'include':
        return `${keyName}=${encodeURIComponent(JSON.stringify(key))}`
    }
  })
    .join('&')
  // .replace(/^/, '?')
    .replace(/&&/g, '&')

  console.log('fromDatum queryString', query.queryString)
  return query
}

/* Client-side */
export function toFetch (query) {
  let baseUrl = `/${query.config.url}/${query.config.version}`.replace(/\/+/g, '/')
  console.log('base url for fetch', baseUrl)

  // URLs
  let urlWithoutQuery = baseUrl + query.metaId
  let urlWithQuery = urlWithoutQuery + query.queryString.replace(/^\?*/, '?')

  // If query string is too long, upgrade GET method to POST
  if (query.method === 'GET' && (location.host + urlWithQuery).length > 1000) {
    query.method = 'POST'
  }

  // This makes the uWSGI server send back json errors
  let headers = new Headers()
  headers.append('Content-Type', 'application/json')

  // Settings object to send with 'fetch' method
  let initObject = {
    method: query.method,
    headers: headers,
    credentials: 'same-origin'
  }

  // Don't add data on GET requests
  if (query.method !== 'GET') {
    initObject.body = JSON.stringify(query.data)
  }

  return fetch(query.method === 'GET' ? urlWithQuery : urlWithoutQuery, initObject)
    .then(response => {
      if (response.status < 200 || response.state >= 300) {
        // If bad request (code 300 or higher), reject promise
        throw new Error(response)
      }
      // Read json stream
      return response.json()
    })
    .catch(error => {
      // Log error in collapsed group
      console.groupCollapsed(query.method, error.statusCode, error.title)
      if ('message' in error) {
        console.error(error.message)
      }
      console.groupEnd()
      throw error.title
    })
}

/* Server-side */
export function toExecute (query, connection) {
  connection.then(client => {
    console.log('trying connection', query.config.version, query.method, query.metaId, JSON.stringify(query.args), JSON.stringify(query.data))
    return client.query(
      'select status, message, response, mimetype ' +
      'from endpoint.request($1, $2, $3, $4::json, $5::json)', [
        query.config.version,
        query.method,
        query.metaId,
        JSON.stringify(query.args),
        JSON.stringify(query.data)
      ])
      .then(result => {
        // release client
        // client.release()

        result = result.rows[0]
        if (result.status >= 400) throw result
        return result
      }).catch(err => {
        if (client.release) client.release()
        console.error('error in endpoint.request query', err)
      })
  })
}
