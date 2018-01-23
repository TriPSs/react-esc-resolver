import React from 'react'
import PropTypes from 'prop-types'
import { capitalize, hasOwnProperty } from './utils'

import Resolver from './Resolver'

export default (prop, Loader) => {

  const loadProps = (typeof prop === 'string') ? [prop] : prop
  const names = loadProps.map(capitalize).join('')

  return Component => class extends React.Component {

    static displayName = `${names}ClientResolver`

    static childContextTypes = {
      resolver: PropTypes.instanceOf(Resolver),
    }

    static contextTypes = {
      resolver: PropTypes.instanceOf(Resolver),
    }

    constructor(props, context) {
      super(props, context)

      this.queue = []
      this.state = {
        bypass: process.env.NODE_ENV === 'test',
        loaded: this.isLoaded(props),
        server: isServer,
      }
    }

    componentDidMount() {
      this.setState({ server: false }, () => {
        if (!this.isLoaded(this.props)) {
          Promise.all(this.queue).then(() => this.setState({ loaded: true }))
        }
      })
    }

    enqueue = (promise) => {
      this.queue.push(promise)

      return promise
    }

    isLoaded = (props) => {
      let loaded = true

      loadProps.forEach((prop) => {
        if (!hasOwnProperty(props, prop) || !props[prop]) {
          loaded = false
        }
      })

      return loaded
    }

    render() {
      const { bypass, loaded, server } = this.state

      if (bypass || loaded || server) {
        return <Component {...this.props} />
      }

      return (
        <div>
          <Loader />

          <div style={{ display: 'none' }}>
            <Resolver onResolve={this.enqueue}>
              {(resolved) => <Component {...this.props} {...resolved} />}
            </Resolver>
          </div>
        </div>
      )
    }
  }
}