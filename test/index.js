const assert = require('assert')
const { fromDatum, fromRequest, fetch, execture } = require('../dist/query')

describe('query', () => {
  describe('fromRequest', () => {
    it('assigns the correct data from a request', () => {
      const request = {
        method: 'GET',
        url: 'relation/widget/widget?q=query',
        query: { },
        body: { }
      }
      const expected = {
        method: 'GET',
        metaId: 'relation/widget/widget',
        args: { metaData: true },
        data: { }
      }
      const actual = fromRequest(request)
      assert.deepEqual(actual, expected)
    })
  })
  describe('fromDatum', () => {
    it('assigns the correct data from a datum', () => {
      const expected = {
        method: 'GET',
        metaId: 'relation/widget/widget',
        args: { metaData: true },
        data: { },
        queryString: 'metaData=true'
      }
      const actual = fromDatum ('GET', { toUrl () { return 'relation/widget/widget' }}, {}, {})
      assert.deepEqual(actual, expected)
    })
  })
})
