import logger from '@hyperapp/logger'

import { h, app } from 'hyperapp'
import { state } from './state'
import { actions } from './actions'
import { view } from './views'

console.log(state)

logger()(app)(state, actions, view, document.getElementById('app'))
